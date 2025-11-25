
/**
 * Pagar.me Webhook Handler
 * Processes incoming webhook events from Pagar.me
 */

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { mapPagarmeStatus, validatePagarmeWebhook } from "@/lib/pagarme";
import { sendWelcomeEmail, sendAdminPurchaseNotification } from "@/lib/email";
import bcryptjs from "bcryptjs";

export async function POST(request: Request) {
  console.log("\n🔔 [Pagar.me Webhook] Recebendo notificação...");

  try {
    // Get raw body for signature validation
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature") || "";

    console.log("📝 [Pagar.me Webhook] Signature recebida:", signature ? "Sim" : "Não");

    // Validate webhook signature
    const isValid = validatePagarmeWebhook(rawBody, signature);
    if (!isValid) {
      console.error("❌ [Pagar.me Webhook] Assinatura inválida!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("✅ [Pagar.me Webhook] Assinatura validada!");

    // Parse the payload
    const payload = JSON.parse(rawBody);
    console.log("📦 [Pagar.me Webhook] Evento:", payload.type, "- ID:", payload.data?.id);

    const { type, data } = payload;

    // Map relevant events
    // Pagar.me sends: order.paid, order.payment_failed, charge.paid, charge.refunded, etc.
    if (
      type === "order.paid" ||
      type === "charge.paid" ||
      type === "order.payment_failed" ||
      type === "charge.payment_failed" ||
      type === "order.canceled" ||
      type === "charge.refunded"
    ) {
      const orderId = data.id || data.order?.id;
      const orderStatus = data.status;

      console.log("🔍 [Pagar.me Webhook] Buscando pagamento com orderId:", orderId);

      // Find payment record using Pagar.me order ID
      const payment = await prisma.payment.findFirst({
        where: {
          stripeSessionId: orderId, // We reuse this field for Pagar.me Order ID
          gateway: "pagarme",
        },
        include: {
          user: true,
          planDetails: true,
        },
      });

      if (!payment) {
        console.error("❌ [Pagar.me Webhook] Pagamento não encontrado para orderId:", orderId);
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
      }

      console.log("✅ [Pagar.me Webhook] Pagamento encontrado:", {
        paymentId: payment.id,
        userId: payment.userId,
        plan: payment.plan,
        currentStatus: payment.status,
      });

      // Map Pagar.me status to internal status
      const newStatus = mapPagarmeStatus(orderStatus);
      console.log("🔄 [Pagar.me Webhook] Mapeando status:", {
        pagarmeStatus: orderStatus,
        newStatus,
      });

      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: newStatus,
          gateway: "pagarme",
        },
      });

      console.log("✅ [Pagar.me Webhook] Status do pagamento atualizado!");

      // If payment is completed, grant access and send emails
      if (newStatus === "completed") {
        console.log("🎉 [Pagar.me Webhook] Pagamento confirmado! Concedendo acesso...");

        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcryptjs.hash(tempPassword, 10);

        // Update user: grant access, set password, update lead status
        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            hasAccess: true,
            password: hashedPassword,
            leadStatus: "active",
          },
        });

        console.log("✅ [Pagar.me Webhook] Acesso concedido ao usuário!");

        // Send welcome email with credentials
        try {
          await sendWelcomeEmail({
            to: payment.user.email!,
            name: payment.user.name!,
            email: payment.user.email!,
            password: tempPassword,
            planName: payment.planDetails?.name || payment.plan,
          });
          console.log("✅ [Pagar.me Webhook] Email de boas-vindas enviado!");
        } catch (emailError) {
          console.error("❌ [Pagar.me Webhook] Erro ao enviar email de boas-vindas:", emailError);
        }

        // Send admin notification
        try {
          await sendAdminPurchaseNotification({
            userName: payment.user.name!,
            userEmail: payment.user.email!,
            planName: payment.planDetails?.name || payment.plan,
            planPrice: payment.amount,
          });
          console.log("✅ [Pagar.me Webhook] Notificação de compra enviada ao admin!");
        } catch (emailError) {
          console.error("❌ [Pagar.me Webhook] Erro ao enviar notificação ao admin:", emailError);
        }
      }

      // If payment failed or was refunded, revoke access
      if (newStatus === "failed" || type === "charge.refunded") {
        console.log("⚠️ [Pagar.me Webhook] Pagamento falhou ou foi estornado. Revogando acesso...");

        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            hasAccess: false,
            leadStatus: "payment_failed",
          },
        });

        console.log("✅ [Pagar.me Webhook] Acesso revogado!");
      }

      console.log("✅ [Pagar.me Webhook] Webhook processado com sucesso!\n");
      return NextResponse.json({ received: true });
    }

    // Unknown event type
    console.log("⚠️ [Pagar.me Webhook] Evento não tratado:", type);
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ [Pagar.me Webhook] Erro ao processar webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 }
    );
  }
}
