
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import prisma from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(request: Request) {
  try {
    // Verificar se o Stripe está configurado
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("YOUR_STRIPE")) {
      return NextResponse.json(
        { error: "Sistema de pagamento não configurado. Por favor, configure as chaves do Stripe no painel administrativo." },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { plan: planSlug, amount } = body;

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

    // Create payment record with plan relationship
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: plan.price,
        currency: "brl",
        status: "pending",
        plan: planSlug,
        planId: plan.id,
      },
    });

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
      data: { stripeSessionId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
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

