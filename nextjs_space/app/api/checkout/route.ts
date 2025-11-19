// Updated: 2024-11-19 03:40 UTC - Fixed Asaas token format
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import prisma from "@/lib/db";
import {
  createOrGetAsaasCustomer,
  createAsaasPaymentLink,
  validateCpfCnpj as validateCpfCnpjAsaas,
} from "@/lib/asaas";
import {
  createCoraBoleto,
  getDefaultAddress,
  validateCpfCnpj as validateCpfCnpjCora,
} from "@/lib/cora";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-11-17.clover",
});

export async function POST(request: Request) {
  try {
    console.log("🛒 [Checkout API] Iniciando processamento...");
    
    const session = await getServerSession(authOptions);
    console.log("👤 [Checkout API] Sessão:", { 
      temSessao: !!session, 
      temUser: !!session?.user,
      userEmail: session?.user?.email 
    });

    if (!session?.user) {
      console.error("❌ [Checkout API] Não autorizado - sem sessão");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { plan: planSlug, gateway = "asaas" } = body; // Default para Asaas
    console.log("📦 [Checkout API] Dados recebidos:", { planSlug, gateway });

    if (!planSlug) {
      console.error("❌ [Checkout API] Plano não especificado");
      return NextResponse.json({ error: "Plano não especificado" }, { status: 400 });
    }

    // Buscar informações do plano no banco de dados
    const plan = await prisma.plan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan || !plan.isActive) {
      console.error("❌ [Checkout API] Plano não encontrado ou inativo:", planSlug);
      return NextResponse.json({ error: "Plano não encontrado ou inativo" }, { status: 404 });
    }

    console.log("✅ [Checkout API] Plano encontrado:", { nome: plan.name, preco: plan.price });

    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "";
    const userId = (session.user as any).id;
    const userEmail = session.user.email || "";
    const userName = session.user.name || "";

    // Buscar dados completos do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    console.log("👤 [Checkout API] Dados do usuário:", { 
      userId, 
      userName, 
      userEmail,
      temCpf: !!user?.cpf,
      temCnpj: !!user?.cnpj
    });

    // IMPORTANTE: Verificar se já existe um pagamento pendente recente (últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingPendingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        planId: plan.id,
        status: "pending",
        createdAt: { gte: fiveMinutesAgo },
      },
      orderBy: { createdAt: "desc" },
    });

    let payment;

    if (existingPendingPayment) {
      console.log("⚠️ [Checkout API] Pagamento pendente encontrado, reutilizando:", existingPendingPayment.id);
      payment = existingPendingPayment;
    } else {
      // Create payment record with plan relationship
      console.log("💳 [Checkout API] Criando novo registro de pagamento...");
      payment = await prisma.payment.create({
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
      console.log("✅ [Checkout API] Pagamento criado:", payment.id);
    }

    // Processar com Asaas (padrão)
    if (gateway === "asaas") {
      console.log("💳 [Checkout API] Processando com Asaas...");
      
      // Verificar se Asaas está configurado
      console.log("🔑 [Checkout API] Verificando token Asaas...");
      console.log("Token presente?", !!process.env.ASAAS_API_KEY);
      
      if (!process.env.ASAAS_API_KEY) {
        console.error("❌ [Checkout API] Token Asaas não configurado!");
        return NextResponse.json(
          { 
            error: "Sistema de pagamento Asaas não configurado. Entre em contato com o suporte.",
            details: "Variável ASAAS_API_KEY não encontrada"
          },
          { status: 503 }
        );
      }
      
      console.log("✅ [Checkout API] Token Asaas encontrado!");

      try {
        // Marcar lastCheckoutAttempt para remarketing
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            lastCheckoutAttempt: new Date(),
            leadStatus: "checkout_started",
          },
        });
        console.log("✅ [Checkout API] lastCheckoutAttempt atualizado");
        
        // Criar ou buscar cliente no Asaas
        console.log("👤 [Checkout API] Criando/buscando cliente no Asaas...");
        
        // Validar CPF/CNPJ com dígitos verificadores
        const cpfCnpj = user?.cpf || user?.cnpj || "";
        const validation = validateCpfCnpjAsaas(cpfCnpj);
        
        console.log("🔍 [Checkout API] Validando CPF/CNPJ:", { 
          original: cpfCnpj,
          cleaned: validation.cleaned,
          valid: validation.valid,
          message: validation.valid 
            ? "CPF/CNPJ válido - SERÁ ENVIADO ao Asaas" 
            : "CPF/CNPJ inválido ou vazio - NÃO SERÁ ENVIADO ao Asaas"
        });
        
        const asaasCustomerId = await createOrGetAsaasCustomer({
          name: userName,
          email: userEmail,
          cpfCnpj: validation.valid ? validation.cleaned : undefined,
        });
        console.log("✅ [Checkout API] Cliente Asaas:", asaasCustomerId);

        // Criar link de pagamento
        console.log("🔗 [Checkout API] Criando link de pagamento...");
        const paymentLink = await createAsaasPaymentLink({
          name: `Clivus - ${plan.name}`,
          description: `Acesso completo ao Clivus - Plano ${plan.name}`,
          billingType: "UNDEFINED", // Permite PIX, Boleto ou Cartão
          chargeType: "DETACHED",
          value: plan.price,
          externalReference: payment.id,
        });
        console.log("✅ [Checkout API] Link criado:", { id: paymentLink.id, url: paymentLink.url });

        // Atualizar pagamento com ID do Asaas
        console.log("💾 [Checkout API] Atualizando registro de pagamento...");
        await prisma.payment.update({
          where: { id: payment.id },
          data: { 
            stripeSessionId: paymentLink.id, // Reutilizamos este campo para o Asaas ID
            gateway: "asaas",
          },
        });
        console.log("✅ [Checkout API] Pagamento atualizado com sucesso!");

        console.log("🎉 [Checkout API] Checkout concluído com sucesso!");
        return NextResponse.json({ 
          url: paymentLink.url,
          gateway: "asaas",
          paymentId: payment.id,
        });
      } catch (asaasError: any) {
        console.error("❌ [Checkout API] Erro ao processar com Asaas:", asaasError);
        return NextResponse.json(
          { 
            error: "Erro ao processar pagamento com Asaas",
            details: asaasError.message || "Erro desconhecido"
          },
          { status: 500 }
        );
      }
    }

    // Processar com CORA (Boleto + PIX)
    if (gateway === "cora") {
      console.log("💳 [Checkout API] Processando com CORA...");
      
      // Verificar se CORA está configurado
      console.log("🔑 [Checkout API] Verificando token CORA...");
      console.log("Token presente?", !!process.env.CORA_API_KEY);
      
      if (!process.env.CORA_API_KEY) {
        console.error("❌ [Checkout API] Token CORA não configurado!");
        return NextResponse.json(
          { 
            error: "Sistema de pagamento CORA não configurado. Entre em contato com o suporte.",
            details: "Variável CORA_API_KEY não encontrada"
          },
          { status: 503 }
        );
      }
      
      console.log("✅ [Checkout API] Token CORA encontrado!");

      try {
        // Marcar lastCheckoutAttempt para remarketing
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            lastCheckoutAttempt: new Date(),
            leadStatus: "checkout_started",
          },
        });
        console.log("✅ [Checkout API] lastCheckoutAttempt atualizado");
        
        // Validar CPF/CNPJ com dígitos verificadores
        const cpfCnpj = user?.cpf || user?.cnpj || "";
        const validation = validateCpfCnpjCora(cpfCnpj);
        
        console.log("🔍 [Checkout API] Validando CPF/CNPJ (CORA):", { 
          original: cpfCnpj,
          cleaned: validation.cleaned,
          isValid: validation.isValid,
          message: validation.isValid 
            ? "CPF/CNPJ válido - SERÁ ENVIADO ao CORA" 
            : "CPF/CNPJ inválido ou vazio - Checkout não prosseguirá"
        });

        // CORA exige CPF/CNPJ válido
        if (!validation.isValid) {
          console.error("❌ [Checkout API] CPF/CNPJ inválido ou não fornecido!");
          return NextResponse.json(
            { 
              error: "CPF/CNPJ é obrigatório para pagamento via CORA",
              details: "Por favor, atualize seu cadastro com um CPF/CNPJ válido antes de prosseguir."
            },
            { status: 400 }
          );
        }

        // Calcular data de vencimento (5 dias úteis a partir de hoje)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 5);
        const dueDateString = dueDate.toISOString().split("T")[0]; // YYYY-MM-DD

        // Criar boleto no CORA
        console.log("📄 [Checkout API] Criando boleto no CORA...");
        const boleto = await createCoraBoleto({
          customer: {
            name: userName,
            document: validation.cleaned,
            email: userEmail,
          },
          address: getDefaultAddress(), // Endereço padrão (pode ser customizado depois)
          amount: Math.round(plan.price * 100), // CORA usa centavos
          dueDate: dueDateString,
          description: `Clivus - ${plan.name}`,
          reference: payment.id,
          notifications: {
            email: true,
            sms: false,
          },
        });
        
        console.log("✅ [Checkout API] Boleto criado:", { 
          id: boleto.id, 
          digitableLine: boleto.digitableLine,
          pixQrCode: !!boleto.pixQrCode
        });

        // Atualizar pagamento com ID do CORA
        console.log("💾 [Checkout API] Atualizando registro de pagamento...");
        await prisma.payment.update({
          where: { id: payment.id },
          data: { 
            stripeSessionId: boleto.id, // Reutilizamos este campo para o CORA ID
            gateway: "cora",
          },
        });
        console.log("✅ [Checkout API] Pagamento atualizado com sucesso!");

        // Retornar URL do PDF do boleto para visualização
        console.log("🎉 [Checkout API] Checkout concluído com sucesso (CORA)!");
        return NextResponse.json({ 
          url: boleto.pdfUrl, // URL do PDF do boleto
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
      } catch (coraError: any) {
        console.error("❌ [Checkout API] Erro ao processar com CORA:", coraError);
        return NextResponse.json(
          { 
            error: "Erro ao processar pagamento com CORA",
            details: coraError.message || "Erro desconhecido"
          },
          { status: 500 }
        );
      }
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

