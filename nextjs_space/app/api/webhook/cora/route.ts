/**
 * CORA Webhook Handler
 * Processa eventos de pagamento do CORA
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { mapCoraStatus, validateCoraWebhook } from "@/lib/cora";
import { sendWelcomeEmail, sendAdminPurchaseNotification } from "@/lib/email";
import bcryptjs from "bcryptjs";

export async function POST(request: Request) {
  try {
    console.log("[CORA Webhook] Recebendo evento...");

    // Obter payload e assinatura
    const rawBody = await request.text();
    const signature = request.headers.get("X-Cora-Signature") || "";

    console.log("[CORA Webhook] Assinatura:", signature);

    // Validar webhook (se configurado)
    const isValid = validateCoraWebhook(rawBody, signature);
    if (!isValid) {
      console.error("[CORA Webhook] Assinatura inválida!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log("[CORA Webhook] Payload:", JSON.stringify(payload, null, 2));

    const { event, data } = payload;
    console.log(`[CORA Webhook] Evento recebido: ${event}`);

    // Eventos suportados:
    // - invoice.paid (Boleto pago)
    // - invoice.expired (Boleto vencido)
    // - invoice.canceled (Boleto cancelado)

    if (!data || !data.id) {
      console.error("[CORA Webhook] Dados inválidos no webhook");
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const boletoId = data.id;
    const coraStatus = data.status;
    console.log(`[CORA Webhook] Boleto ID: ${boletoId}, Status: ${coraStatus}`);

    // Buscar pagamento pelo ID do boleto (armazenado em stripeSessionId)
    const payment = await prisma.payment.findFirst({
      where: {
        stripeSessionId: boletoId,
        gateway: "cora",
      },
      include: {
        user: true,
        planDetails: true,
      },
    });

    if (!payment) {
      console.error(`[CORA Webhook] Payment não encontrado para boleto ${boletoId}`);
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    console.log(`[CORA Webhook] Payment encontrado: ${payment.id}`);

    // Mapear status do CORA para status interno
    const newStatus = mapCoraStatus(coraStatus as any);
    console.log(`[CORA Webhook] Mapeando status: ${coraStatus} -> ${newStatus}`);

    // Atualizar status do pagamento
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        gateway: "cora",
      },
    });
    console.log("[CORA Webhook] Status do pagamento atualizado");

    // Se o pagamento foi aprovado, liberar acesso e enviar emails
    if (event === "invoice.paid" || coraStatus === "PAID") {
      console.log("[CORA Webhook] Pagamento aprovado, atualizando acesso do usuário");

      // Gerar senha temporária aleatória
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcryptjs.hash(tempPassword, 10);
      
      // Atualizar usuário: hasAccess = true
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          hasAccess: true,
          leadStatus: "active",
          password: hashedPassword, // Nova senha temporária
        },
      });
      console.log("[CORA Webhook] Acesso do usuário liberado");

      // Enviar email de boas-vindas com credenciais
      const planName = payment.planDetails?.name || "Plano Desconhecido";
      console.log("[CORA Webhook] Enviando email de boas-vindas...");
      try {
        await sendWelcomeEmail({
          to: payment.user.email!,
          name: payment.user.name!,
          email: payment.user.email!,
          password: tempPassword,
          planName: planName,
        });
        console.log("[CORA Webhook] Email de boas-vindas enviado");
      } catch (emailError) {
        console.error("[CORA Webhook] Erro ao enviar email de boas-vindas:", emailError);
      }

      // Enviar notificação para o admin
      console.log("[CORA Webhook] Enviando notificação para admin...");
      try {
        await sendAdminPurchaseNotification({
          userName: payment.user.name!,
          userEmail: payment.user.email!,
          planName: planName,
          planPrice: payment.amount,
        });
        console.log("[CORA Webhook] Notificação de admin enviada");
      } catch (adminEmailError) {
        console.error("[CORA Webhook] Erro ao enviar notificação de admin:", adminEmailError);
      }
    }

    // Se o pagamento falhou ou foi cancelado, revogar acesso
    if (event === "invoice.canceled" || coraStatus === "CANCELED" || coraStatus === "EXPIRED") {
      console.log("[CORA Webhook] Pagamento cancelado/vencido, revogando acesso");
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          hasAccess: false,
          leadStatus: "payment_failed",
        },
      });
    }

    console.log("[CORA Webhook] Webhook processado com sucesso");
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("[CORA Webhook] Erro ao processar webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
