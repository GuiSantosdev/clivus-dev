
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import prisma from "@/lib/db";
import {
  createOrGetAsaasCustomer,
  createAsaasPaymentLink,
} from "@/lib/asaas";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-10-29.clover",
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { plan: planSlug, gateway = "asaas" } = body; // Default para Asaas

    if (!planSlug) {
      return NextResponse.json({ error: "Plano não especificado" }, { status: 400 });
    }

    // Buscar informações do plano no banco de dados
    const plan = await prisma.plan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plano não encontrado ou inativo" }, { status: 404 });
    }

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";
    const userId = (session.user as any).id;
    const userEmail = session.user.email || "";
    const userName = session.user.name || "";

    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Create payment record with plan relationship
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

    // Processar com Asaas (padrão)
    if (gateway === "asaas") {
      // Verificar se Asaas está configurado
      if (!process.env.ASAAS_API_KEY) {
        return NextResponse.json(
          { error: "Sistema de pagamento Asaas não configurado." },
          { status: 503 }
        );
      }

      // Criar ou buscar cliente no Asaas
      const asaasCustomerId = await createOrGetAsaasCustomer({
        name: userName,
        email: userEmail,
        cpfCnpj: user?.cpf || user?.cnpj || undefined,
      });

      // Criar link de pagamento
      const paymentLink = await createAsaasPaymentLink({
        name: `Clivus - ${plan.name}`,
        description: `Acesso completo ao Clivus - Plano ${plan.name}`,
        billingType: "UNDEFINED", // Permite PIX, Boleto ou Cartão
        chargeType: "DETACHED",
        value: plan.price,
        externalReference: payment.id,
      });

      // Atualizar pagamento com ID do Asaas
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          stripeSessionId: paymentLink.id, // Reutilizamos este campo para o Asaas ID
          gateway: "asaas",
        },
      });

      return NextResponse.json({ 
        url: paymentLink.url,
        gateway: "asaas",
        paymentId: payment.id,
      });
    }

    // Processar com Stripe (fallback)
    if (gateway === "stripe") {
      // Verificar se o Stripe está configurado
      if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("YOUR_STRIPE")) {
        return NextResponse.json(
          { error: "Sistema de pagamento Stripe não configurado." },
          { status: 503 }
        );
      }

      // Create Stripe checkout session
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: `Clivus - ${plan.name}`,
                description: `Acesso completo ao Clivus - Plano ${plan.name}`,
              },
              unit_amount: Math.round(plan.price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${origin}/dashboard?payment=success`,
        cancel_url: `${origin}/checkout?plan=${planSlug}&payment=canceled`,
        metadata: {
          userId,
          paymentId: payment.id,
          planId: plan.id,
          planSlug: planSlug,
        },
      });

      // Update payment with Stripe session ID
      await prisma.payment.update({
        where: { id: payment.id },
        data: { 
          stripeSessionId: checkoutSession.id,
          gateway: "stripe",
        },
      });

      return NextResponse.json({ 
        url: checkoutSession.url,
        gateway: "stripe",
        paymentId: payment.id,
      });
    }

    return NextResponse.json(
      { error: "Gateway de pagamento inválido" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Checkout error:", error);
    
    // Mensagem de erro mais específica
    let errorMessage = "Erro ao criar sessão de pagamento";
    
    if (error?.type === "StripeInvalidRequestError") {
      errorMessage = "Erro na configuração do Stripe. Verifique suas credenciais.";
    } else if (error?.code === "resource_missing") {
      errorMessage = "Configuração de pagamento incompleta.";
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}

