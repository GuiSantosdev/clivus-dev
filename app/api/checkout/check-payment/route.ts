
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
    let errorMessage = null;

    // Log detalhado do pagamento
    console.log("💳 [Check Payment] Dados do pagamento:", {
      paymentId: payment.id,
      gateway: payment.gateway,
      stripeSessionId: payment.stripeSessionId,
      currentStatus: payment.status,
      amount: payment.amount,
      createdAt: payment.createdAt
    });

    // Se o pagamento ainda está pendente, consultar o gateway em tempo real
    if (currentStatus === "pending" && payment.stripeSessionId) {
      try {
        console.log("🔍 [Check Payment] Iniciando consulta ao gateway:", {
          gateway: payment.gateway,
          externalId: payment.stripeSessionId
        });

        if (payment.gateway === "asaas") {
          // Consultar status no Asaas
          console.log("📞 [Check Payment] Chamando API Asaas com ID:", payment.stripeSessionId);
          
          const asaasPayment = await getAsaasPayment(payment.stripeSessionId);
          
          console.log("📥 [Check Payment] Resposta completa do Asaas:", {
            id: asaasPayment.id,
            status: asaasPayment.status,
            value: asaasPayment.value,
            billingType: asaasPayment.billingType,
            dateCreated: asaasPayment.dateCreated,
            dueDate: asaasPayment.dueDate,
            invoiceUrl: asaasPayment.invoiceUrl
          });
          
          gatewayStatus = asaasPayment.status;
          const mappedStatus = mapAsaasStatus(gatewayStatus);

          console.log("📊 [Check Payment] Status Asaas:", { 
            original: gatewayStatus, 
            mapped: mappedStatus,
            wouldUpdate: mappedStatus !== currentStatus
          });

          // Se o status mudou, atualizar no banco
          if (mappedStatus !== currentStatus) {
            currentStatus = mappedStatus;

            await prisma.payment.update({
              where: { id: paymentId },
              data: { status: mappedStatus },
            });

            console.log("✅ [Check Payment] Status atualizado no banco de PENDING para:", mappedStatus);

            // Se foi confirmado, liberar acesso e enviar emails
            if (mappedStatus === "completed") {
              console.log("🎉 [Check Payment] Pagamento confirmado! Liberando acesso...");

              // Atualizar usuário
              await prisma.user.update({
                where: { id: payment.userId },
                data: { hasAccess: true },
              });

              console.log("✅ [Check Payment] Acesso liberado para usuário:", payment.userId);

              // Gerar senha temporária se necessário
              let tempPassword = "";
              if (!payment.user.password) {
                tempPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(tempPassword, 10);
                await prisma.user.update({
                  where: { id: payment.userId },
                  data: { password: hashedPassword },
                });
                console.log("🔑 [Check Payment] Senha temporária gerada para usuário");
              }

              // Enviar emails
              await processCompletedPayment(payment, tempPassword);
            }
          } else {
            console.log("ℹ️ [Check Payment] Status não mudou, permanece como:", currentStatus);
          }
        } else if (payment.gateway === "efi") {
          // Consultar status no EFI
          console.log("📞 [Check Payment] Chamando API EFI com ID:", payment.stripeSessionId);
          
          const efiCharge = await getEfiChargeStatus(payment.stripeSessionId);
          
          console.log("📥 [Check Payment] Resposta completa do EFI:", {
            charge_id: efiCharge.charge_id,
            status: efiCharge.status,
            total: efiCharge.total
          });
          
          gatewayStatus = efiCharge.status;
          const mappedStatus = mapEfiStatus(gatewayStatus);

          console.log("📊 [Check Payment] Status EFI:", { 
            original: gatewayStatus, 
            mapped: mappedStatus,
            wouldUpdate: mappedStatus !== currentStatus
          });

          // Se o status mudou, atualizar no banco
          if (mappedStatus !== currentStatus) {
            currentStatus = mappedStatus;

            await prisma.payment.update({
              where: { id: paymentId },
              data: { status: mappedStatus },
            });

            console.log("✅ [Check Payment] Status atualizado no banco de PENDING para:", mappedStatus);

            // Se foi confirmado, liberar acesso e enviar emails
            if (mappedStatus === "completed") {
              console.log("🎉 [Check Payment] Pagamento confirmado! Liberando acesso...");

              // Atualizar usuário
              await prisma.user.update({
                where: { id: payment.userId },
                data: { hasAccess: true },
              });

              console.log("✅ [Check Payment] Acesso liberado para usuário:", payment.userId);

              // Gerar senha temporária se necessário
              let tempPassword = "";
              if (!payment.user.password) {
                tempPassword = Math.random().toString(36).slice(-8);
                const hashedPassword = await bcrypt.hash(tempPassword, 10);
                await prisma.user.update({
                  where: { id: payment.userId },
                  data: { password: hashedPassword },
                });
                console.log("🔑 [Check Payment] Senha temporária gerada para usuário");
              }

              // Enviar emails
              await processCompletedPayment(payment, tempPassword);
            }
          } else {
            console.log("ℹ️ [Check Payment] Status não mudou, permanece como:", currentStatus);
          }
        } else {
          console.log("⚠️ [Check Payment] Gateway não suportado para consulta:", payment.gateway);
        }
      } catch (gatewayError: any) {
        console.error("❌ [Check Payment] Erro COMPLETO ao consultar gateway:", {
          gateway: payment.gateway,
          externalId: payment.stripeSessionId,
          errorName: gatewayError.name,
          errorMessage: gatewayError.message,
          errorStack: gatewayError.stack,
          errorResponse: gatewayError.response?.data || gatewayError.response || "N/A"
        });
        errorMessage = gatewayError.message;
        // Não falhar a requisição, apenas continuar com o status do banco
      }
    } else if (!payment.stripeSessionId) {
      console.log("⚠️ [Check Payment] stripeSessionId não encontrado no pagamento");
    } else {
      console.log("ℹ️ [Check Payment] Pagamento não está pendente, status atual:", currentStatus);
    }

    console.log("✅ [Check Payment] Status final:", {
      currentStatus,
      gatewayStatus,
      errorMessage,
      hasStripeSessionId: !!payment.stripeSessionId
    });

    return NextResponse.json({
      status: currentStatus,
      gatewayStatus,
      paymentId: payment.id,
      amount: payment.amount,
      gateway: payment.gateway,
      planName: payment.planDetails?.name || "Plano",
      errorMessage,
      debug: {
        stripeSessionId: payment.stripeSessionId,
        gateway: payment.gateway,
        currentStatus: payment.status
      }
    });

  } catch (error: any) {
    console.error("❌ [Check Payment] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao verificar pagamento" },
      { status: 500 }
    );
  }
}
