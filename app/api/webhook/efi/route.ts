
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { mapEfiStatus, validateEfiWebhook } from "@/lib/efi";
import { sendWelcomeEmail, sendAdminPurchaseNotification } from "@/lib/email";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    console.log("[EFI Webhook] Recebendo notificação...");

    const body = await request.text();
    const signature = request.headers.get("x-efi-signature") || "";

    // Validate webhook signature
    if (!validateEfiWebhook(signature, body)) {
      console.error("[EFI Webhook] Assinatura inválida!");
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    }

    console.log("[EFI Webhook] Assinatura validada!");

    const data = JSON.parse(body);
    console.log("[EFI Webhook] Notificação recebida");

    const { event, data: eventData } = data;

    // Extract charge ID
    const chargeId = eventData?.charge?.id || eventData?.id;

    if (!chargeId) {
      console.error("[EFI Webhook] Charge ID não encontrado no payload");
      return NextResponse.json({ error: "Charge ID não encontrado" }, { status: 400 });
    }

    console.log("[EFI Webhook] Evento:", event);
    console.log("[EFI Webhook] Charge ID:", chargeId);

    // Find payment in database
    const payment = await prisma.payment.findFirst({
      where: {
        stripeSessionId: chargeId,
        gateway: "efi",
      },
      include: {
        user: true,
        planDetails: true,
      },
    });

    if (!payment) {
      console.error("[EFI Webhook] Pagamento não encontrado para Charge ID:", chargeId);
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 });
    }

    console.log("[EFI Webhook] Pagamento encontrado:", payment.id);

    // Map EFI status to internal status
    const efiStatus = eventData?.status || "new";
    const internalStatus = mapEfiStatus(efiStatus);

    console.log("[EFI Webhook] Status EFI:", efiStatus);
    console.log("[EFI Webhook] Status Interno:", internalStatus);

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: internalStatus,
        gateway: "efi",
      },
    });

    console.log("[EFI Webhook] Status do pagamento atualizado!");

    // If payment is completed, grant access
    if (internalStatus === "completed") {
      console.log("[EFI Webhook] Pagamento confirmado! Concedendo acesso...");

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Update user
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          hasAccess: true,
          password: hashedPassword,
          leadStatus: "active",
        },
      });

      console.log("[EFI Webhook] Acesso concedido ao usuário!");

      // Send welcome email
      try {
        await sendWelcomeEmail({
          to: payment.user.email,
          name: payment.user.name,
          email: payment.user.email,
          password: tempPassword,
          planName: payment.planDetails?.name || "Clivus",
        });
        console.log("[EFI Webhook] Email de boas-vindas enviado!");
      } catch (emailError) {
        console.error("[EFI Webhook] Erro ao enviar email de boas-vindas:", emailError);
      }

      // Send admin notification
      try {
        await sendAdminPurchaseNotification({
          userName: payment.user.name,
          userEmail: payment.user.email,
          planName: payment.planDetails?.name || "Clivus",
          planPrice: payment.amount,
        });
        console.log("[EFI Webhook] Email de notificação enviado ao admin!");
      } catch (emailError) {
        console.error("[EFI Webhook] Erro ao enviar email ao admin:", emailError);
      }
    }

    // If payment failed, revoke access
    if (internalStatus === "failed") {
      console.log("[EFI Webhook] Pagamento falhou. Revogando acesso...");

      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          hasAccess: false,
          leadStatus: "payment_failed",
        },
      });

      console.log("[EFI Webhook] Acesso revogado!");
    }

    console.log("[EFI Webhook] Webhook processado com sucesso!");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[EFI Webhook] Erro ao processar webhook:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook", details: error.message },
      { status: 500 }
    );
  }
}
