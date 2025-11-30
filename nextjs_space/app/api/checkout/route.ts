export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import prisma from "@/lib/db";

teste
import {
  createOrGetAsaasCustomer,
  createAsaasPayment,
  validateCpfCnpj as validateCpfCnpjAsaas,
  getAsaasConfig,
} from "@/lib/asaas";

import {
  createCoraBoleto,
  getDefaultAddress,
  validateCpfCnpj as validateCpfCnpjCora,
} from "@/lib/cora";
import {
  createPagarmeOrder,
  validateCpfCnpj as validateCpfCnpjPagarme,
} from "@/lib/pagarme";
import {
  createEfiCharge,
  validateCpfCnpj as validateCpfCnpjEfi,
} from "@/lib/efi";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover", // Ajuste a versão conforme necessário
});

export async function POST(request: Request) {
  try {
    console.log("🛒 [Checkout API] Iniciando processamento...");

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { plan: planSlug, gateway = "asaas", paymentMethod } = body;

    // Validação inicial do Asaas (Banco ou Env)
    if (gateway === "asaas") {
      const config = await getAsaasConfig();
      if (!config.apiKey) {
        console.error("ERRO CRÍTICO: Configuração do Asaas não encontrada");
        return NextResponse.json(
            { error: "Erro de configuração no servidor", details: "Chave API do Asaas ausente" },
            { status: 500 }
        );
      }
    }

    if (!planSlug) {
      return NextResponse.json({ error: "Plano não especificado" }, { status: 400 });
    }

    // Buscar Plano
    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    // Buscar Usuário
    const userId = (session.user as any).id;
    const userEmail = session.user.email || "";
    const userName = session.user.name || "";
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // 1. Criar Registro de Pagamento (Pendente)
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: plan.price,
        currency: "brl",
        status: "pending",
        plan: planSlug,
        planId: plan.id,
        gateway: gateway,
      },
    });
    console.log("✅ [Checkout API] Pagamento criado no DB:", payment.id);

    // ============================================================
    //  PROCESSAMENTO ASAAS (CORRIGIDO PARA CARTÃO NO LINK)
    // ============================================================
    if (gateway === "asaas") {
      console.log("💳 [Checkout API] Processando com Asaas...");

      try {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { lastCheckoutAttempt: new Date() },
        });

        // Validação de CPF/CNPJ
        const cpfCnpj = user?.cpf || user?.cnpj || "";
        const validation = validateCpfCnpjAsaas(cpfCnpj);

        // Criar Cliente no Asaas
        const asaasCustomerId = await createOrGetAsaasCustomer({
          name: userName,
          email: userEmail,
          cpfCnpj: validation.valid ? validation.cleaned : undefined,
        });

        // 👇 LÓGICA DE TIPO DE COBRANÇA 👇
        // UNDEFINED = O cliente escolhe na tela do Asaas (Boleto, Pix ou Cartão)
        // CREDIT_CARD = Processamento transparente (usuário digitou cartão no seu site)

        let billingType = "UNDEFINED";

        if (paymentMethod === "credit_card") {
          billingType = "CREDIT_CARD";
        } else if (paymentMethod === "pix") {
          billingType = "PIX";
        } else if (paymentMethod === "boleto") {
          billingType = "BOLETO";
        }
        // Se paymentMethod for "boleto_cartao" (seu frontend), ele cai no default "UNDEFINED"

        console.log(`📝 [Asaas] Criando cobrança com billingType: ${billingType}`);

        const paymentPayload: any = {
          customer: asaasCustomerId,
          billingType: billingType,
          value: plan.price,
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +3 dias
          description: `Clivus - ${plan.name}`,
          externalReference: payment.id,
        };

        // Se for cartão transparente, adicionar dados do cartão
        if (billingType === "CREDIT_CARD" && body.creditCard) {
          paymentPayload.creditCard = body.creditCard;
          paymentPayload.creditCardHolderInfo = body.creditCardHolderInfo;
        }

        // Criar Cobrança
        const asaasPayment = await createAsaasPayment(paymentPayload);

        console.log("✅ [Checkout API] Cobrança gerada com sucesso:", {
          id: asaasPayment.id,
          url: asaasPayment.invoiceUrl,
          status: asaasPayment.status
        });

        // Salvar o ID correto (pay_...) no banco para o webhook/check-payment funcionar
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            stripeSessionId: asaasPayment.id,
            gateway: "asaas",
          },
        });

        return NextResponse.json({
          url: asaasPayment.invoiceUrl, // Link da fatura (agora com opção de cartão se UNDEFINED)
          gateway: "asaas",
          paymentId: payment.id,
          status: asaasPayment.status
        });

      } catch (asaasError: any) {
        console.error("❌ [Checkout API] Erro Asaas:", asaasError);
        return NextResponse.json(
            { error: "Erro ao processar pagamento", details: asaasError.message },
            { status: 500 }
        );
      }
    }

    // ============================================================
    //  OUTROS GATEWAYS (CORA, PAGARME, EFI, STRIPE) - Mantidos
    // ============================================================

    // Processar com CORA
    if (gateway === "cora") {
      if (!process.env.CORA_API_KEY) return NextResponse.json({ error: "Cora não configurado" }, { status: 503 });

      try {
        const cpfCnpj = user?.cpf || user?.cnpj || "";
        const validation = validateCpfCnpjCora(cpfCnpj);
        if (!validation.isValid) return NextResponse.json({ error: "CPF/CNPJ inválido" }, { status: 400 });

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 5);

        const boleto = await createCoraBoleto({
          customer: { name: userName, document: validation.cleaned, email: userEmail },
          address: getDefaultAddress(),
          amount: Math.round(plan.price * 100),
          dueDate: dueDate.toISOString().split("T")[0],
          description: `Clivus - ${plan.name}`,
          reference: payment.id,
          notifications: { email: true, sms: false },
        });

        await prisma.payment.update({
          where: { id: payment.id },
          data: { stripeSessionId: boleto.id, gateway: "cora" },
        });

        return NextResponse.json({
          url: boleto.pdfUrl,
          gateway: "cora",
          paymentId: payment.id,
          boletoData: {
            digitableLine: boleto.digitableLine,
            barCode: boleto.barCode,
            pixQrCode: boleto.pixQrCode,
            pixKey: boleto.pixKey,
            dueDate: boleto.dueDate,
          },
        });
      } catch (error: any) {
        return NextResponse.json({ error: "Erro Cora", details: error.message }, { status: 500 });
      }
    }

    // Processar com Pagar.me
    if (gateway === "pagarme") {
      if (!process.env.PAGARME_API_KEY) return NextResponse.json({ error: "Pagar.me não configurado" }, { status: 503 });

      try {
        const cpfCnpj = user?.cpf || user?.cnpj || "";
        const validation = validateCpfCnpjPagarme(cpfCnpj);

        const paymentMethod = (body.paymentMethod as "pix" | "boleto" | "credit_card") || "pix";

        const order = await createPagarmeOrder({
          customerId: userId,
          customerName: userName,
          customerEmail: userEmail,
          customerDocument: validation.isValid ? validation.cleanValue : undefined,
          amount: Math.round(plan.price * 100),
          planName: plan.name,
          paymentMethod,
          installments: body.installments || 1,
          cardToken: body.cardToken,
        });

        await prisma.payment.update({
          where: { id: payment.id },
          data: { stripeSessionId: order.id, gateway: "pagarme" },
        });

        let responseData: any = { gateway: "pagarme", paymentId: payment.id, orderId: order.id, status: order.status };

        if (paymentMethod === "pix" && order.charges?.[0]?.last_transaction?.qr_code) {
          const pixData = order.charges[0].last_transaction;
          responseData.pixData = { qrCode: pixData.qr_code, qrCodeUrl: pixData.qr_code_url, expiresAt: pixData.expires_at };
        }
        if (paymentMethod === "boleto" && order.charges?.[0]?.last_transaction?.url) {
          const boletoData = order.charges[0].last_transaction;
          responseData.boletoData = { url: boletoData.url, barcode: boletoData.barcode, line: boletoData.line, dueAt: boletoData.boleto_due_at };
          responseData.url = boletoData.url;
        }
        if (paymentMethod === "credit_card" && order.charges?.[0]?.last_transaction) {
          const cardData = order.charges[0].last_transaction;
          responseData.cardData = { status: cardData.status, acquirerMessage: cardData.acquirer_message, authorizationCode: cardData.acquirer_auth_code };
          if (cardData.status === "paid") responseData.url = `${origin}/dashboard?payment=success`;
        }

        return NextResponse.json(responseData);
      } catch (error: any) {
        return NextResponse.json({ error: "Erro Pagar.me", details: error.message }, { status: 500 });
      }
    }

    // Processar com EFI
    if (gateway === "efi") {
      if (!process.env.EFI_CLIENT_ID) return NextResponse.json({ error: "EFI não configurado" }, { status: 503 });

      try {
        const cpfCnpj = user?.cpf || user?.cnpj || "";
        const validation = validateCpfCnpjEfi(cpfCnpj);
        const paymentMethod = (body.paymentMethod as "pix" | "boleto" | "card") || "pix";

        const charge = await createEfiCharge({
          userName,
          userEmail,
          userCpfCnpj: validation.isValid ? validation.cleanValue : undefined,
          planName: plan.name,
          amount: Math.round(plan.price * 100),
          paymentMethod,
          cardToken: body.cardToken,
          installments: body.installments || 1,
        });

        await prisma.payment.update({
          where: { id: payment.id },
          data: { stripeSessionId: String(charge.chargeId), gateway: "efi" },
        });

        return NextResponse.json({
          gateway: "efi",
          paymentId: payment.id,
          chargeId: charge.chargeId,
          url: charge.paymentUrl,
        });
      } catch (error: any) {
        return NextResponse.json({ error: "Erro EFI", details: error.message }, { status: 500 });
      }
    }

    // Processar com Stripe
    if (gateway === "stripe") {
      if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 });

      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "brl",
            product_data: { name: `Clivus - ${plan.name}`, description: `Acesso completo ao Clivus` },
            unit_amount: Math.round(plan.price * 100),
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/dashboard?payment=success`,
        cancel_url: `${origin}/checkout?plan=${planSlug}&payment=canceled`,
        metadata: { userId, paymentId: payment.id, planId: plan.id, planSlug: planSlug },
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: { stripeSessionId: checkoutSession.id, gateway: "stripe" },
      });

      return NextResponse.json({ url: checkoutSession.url, gateway: "stripe", paymentId: payment.id });
    }

    return NextResponse.json({ error: "Gateway inválido" }, { status: 400 });

  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Erro interno", details: error.message }, { status: 500 });
  }
}