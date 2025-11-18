
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { mapAsaasStatus } from "@/lib/asaas";
import { sendWelcomeEmail, sendAdminPurchaseNotification } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log("📩 Webhook Asaas recebido:", JSON.stringify(body, null, 2));

    const { event, payment } = body;

    if (!event || !payment) {
      return NextResponse.json(
        { error: "Dados do webhook inválidos" },
        { status: 400 }
      );
    }

    // Buscar pagamento no banco usando externalReference
    const paymentRecord = await prisma.payment.findFirst({
      where: {
        id: payment.externalReference,
      },
      include: {
        user: true,
        planDetails: true,
      },
    });

    if (!paymentRecord) {
      console.error("❌ Pagamento não encontrado:", payment.externalReference);
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

    // Mapear status do Asaas para status interno
    const newStatus = mapAsaasStatus(payment.status);

    console.log(`📊 Status Asaas: ${payment.status} → Status interno: ${newStatus}`);

    // Processar evento de pagamento confirmado
    if (
      event === "PAYMENT_RECEIVED" ||
      event === "PAYMENT_CONFIRMED" ||
      newStatus === "completed"
    ) {
      console.log("✅ Pagamento confirmado!");

      // Atualizar status do pagamento
      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: "completed",
          gateway: "asaas",
        },
      });

      // Conceder acesso ao usuário
      await prisma.user.update({
        where: { id: paymentRecord.userId },
        data: { hasAccess: true },
      });

      // Gerar senha temporária
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Atualizar senha do usuário
      await prisma.user.update({
        where: { id: paymentRecord.userId },
        data: { password: hashedPassword },
      });

      // Enviar email de boas-vindas
      if (paymentRecord.user.email) {
        await sendWelcomeEmail({
          to: paymentRecord.user.email,
          name: paymentRecord.user.name || "Cliente",
          email: paymentRecord.user.email,
          password: tempPassword,
          planName: paymentRecord.planDetails?.name || "Premium",
        });
      }

      // Notificar admin sobre a venda
      await sendAdminPurchaseNotification({
        userName: paymentRecord.user.name || "Cliente",
        userEmail: paymentRecord.user.email || "",
        planName: paymentRecord.planDetails?.name || "Premium",
        planPrice: paymentRecord.amount,
      });

      console.log("✅ Processamento completo: acesso liberado, emails enviados!");
    }

    // Processar evento de pagamento pendente/vencido/cancelado
    if (
      event === "PAYMENT_OVERDUE" ||
      event === "PAYMENT_DELETED" ||
      newStatus === "failed"
    ) {
      console.log("❌ Pagamento falhou ou foi cancelado");

      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: "failed",
          gateway: "asaas",
        },
      });
    }

    // Processar reembolso
    if (event === "PAYMENT_REFUNDED" || newStatus === "refunded") {
      console.log("🔄 Pagamento reembolsado");

      await prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
          status: "refunded",
          gateway: "asaas",
        },
      });

      // Remover acesso do usuário
      await prisma.user.update({
        where: { id: paymentRecord.userId },
        data: { hasAccess: false },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erro no webhook Asaas:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}
