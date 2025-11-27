
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAsaasPayment, mapAsaasStatus } from "@/lib/asaas";
import { getEfiChargeStatus, mapEfiStatus } from "@/lib/efi";
import { sendWelcomeEmail, sendAdminPurchaseNotification } from "@/lib/email";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// Função auxiliar para processar pagamento confirmado
async function processCompletedPayment(payment: any, tempPassword: string) {
  try {
    await sendWelcomeEmail({
      to: payment.user.email,
      name: payment.user.name || "Cliente",
      email: payment.user.email,
      password: tempPassword || "use sua senha atual",
      planName: payment.planDetails?.name || "Plano",
    });

    await sendAdminPurchaseNotification({
      userName: payment.user.name || "Cliente",
      userEmail: payment.user.email,
      planName: payment.planDetails?.name || "Plano",
      planPrice: payment.amount,
    });

    console.log("📧 [Check Payment] Emails enviados com sucesso");
  } catch (emailError) {
    console.error("⚠️ [Check Payment] Erro ao enviar emails:", emailError);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID não fornecido" },
        { status: 400 }
      );
    }

    console.log("🔄 [Check Payment] Verificando:", { paymentId, userId: session.user.id });

    // Buscar pagamento
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: true,
        planDetails: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o pagamento pertence ao usuário logado
    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    let currentStatus = payment.status;
    let gatewayStatus = null;

    // Se o pagamento ainda está pendente, consultar o gateway em tempo real
    if (currentStatus === "pending" && payment.stripeSessionId) {
      try {
        console.log("🔍 [Check Payment] Consultando gateway:", payment.gateway);

        if (payment.gateway === "asaas") {
          // Consultar status no Asaas
          const asaasPayment = await getAsaasPayment(payment.stripeSessionId);
          gatewayStatus = asaasPayment.status;
          const mappedStatus = mapAsaasStatus(gatewayStatus);

          console.log("📊 [Check Payment] Status Asaas:", { 
            original: gatewayStatus, 
            mapped: mappedStatus 
          });

          // Se o status mudou, atualizar no banco
          if (mappedStatus !== currentStatus) {
            currentStatus = mappedStatus;

            await prisma.payment.update({
              where: { id: paymentId },
              data: { status: mappedStatus },
            });

            console.log("✅ [Check Payment] Status atualizado no banco:", mappedStatus);

            // Se foi confirmado, liberar acesso e enviar emails
            if (mappedStatus === "completed") {
              console.log("🎉 [Check Payment] Pagamento confirmado! Liberando acesso...");

              // Atualizar usuário
              await prisma.user.update({
                where: { id: payment.userId },
                data: { hasAccess: true },
              });

              // Gerar senha temporária se necessário
              let tempPassword = "";
              if (!payment.user.password) {
                tempPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(tempPassword, 10);
                await prisma.user.update({
                  where: { id: payment.userId },
                  data: { password: hashedPassword },
                });
              }

              // Enviar emails
              await processCompletedPayment(payment, tempPassword);
            }
          }
        } else if (payment.gateway === "efi") {
          // Consultar status no EFI
          const efiCharge = await getEfiChargeStatus(payment.stripeSessionId);
          gatewayStatus = efiCharge.status;
          const mappedStatus = mapEfiStatus(gatewayStatus);

          console.log("📊 [Check Payment] Status EFI:", { 
            original: gatewayStatus, 
            mapped: mappedStatus 
          });

          // Se o status mudou, atualizar no banco
          if (mappedStatus !== currentStatus) {
            currentStatus = mappedStatus;

            await prisma.payment.update({
              where: { id: paymentId },
              data: { status: mappedStatus },
            });

            console.log("✅ [Check Payment] Status atualizado no banco:", mappedStatus);

            // Se foi confirmado, liberar acesso e enviar emails
            if (mappedStatus === "completed") {
              console.log("🎉 [Check Payment] Pagamento confirmado! Liberando acesso...");

              // Atualizar usuário
              await prisma.user.update({
                where: { id: payment.userId },
                data: { hasAccess: true },
              });

              // Gerar senha temporária se necessário
              let tempPassword = "";
              if (!payment.user.password) {
                tempPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(tempPassword, 10);
                await prisma.user.update({
                  where: { id: payment.userId },
                  data: { password: hashedPassword },
                });
              }

              // Enviar emails
              await processCompletedPayment(payment, tempPassword);
            }
          }
        }
      } catch (gatewayError: any) {
        console.error("⚠️ [Check Payment] Erro ao consultar gateway:", gatewayError);
        // Não falhar a requisição, apenas continuar com o status do banco
      }
    }

    console.log("✅ [Check Payment] Status final:", currentStatus);

    return NextResponse.json({
      status: currentStatus,
      gatewayStatus,
      paymentId: payment.id,
      amount: payment.amount,
      gateway: payment.gateway,
      planName: payment.planDetails?.name || "Plano",
    });

  } catch (error: any) {
    console.error("❌ [Check Payment] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao verificar pagamento" },
      { status: 500 }
    );
  }
}
