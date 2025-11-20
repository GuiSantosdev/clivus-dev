
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { 
  getEfiAccessToken,
  createEfiCharge,
  getEfiConfig 
} from "@/lib/efi";
import {
  createOrGetAsaasCustomer,
  createAsaasPixQrCode
} from "@/lib/asaas";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa estar logado para fazer uma compra" },
        { status: 401 }
      );
    }

    const { plan: planSlug, gateway, amount } = await request.json();

    console.log("📱 [Checkout PIX] Iniciando:", { planSlug, gateway, amount, userId: session.user.id });

    // Buscar plano
    const plan = await prisma.plan.findFirst({
      where: { slug: planSlug },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Plano não encontrado" },
        { status: 404 }
      );
    }

    // Buscar usuário completo
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Criar registro de pagamento pendente com ID temporário único
    const tempId = `temp_pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        planId: plan.id,
        amount: plan.price,
        status: "pending",
        gateway: gateway || "efi",
        stripeSessionId: tempId, // ID temporário único para evitar conflitos
      },
    });

    console.log("✅ [Checkout PIX] Payment criado:", payment.id);

    // Gerar PIX baseado no gateway
    let qrCode = "";
    let qrCodeText = "";
    let externalId = "";

    try {
      if (gateway === "efi") {
        // Gerar PIX com EFI (Gerencianet)
        const efiConfig = getEfiConfig();
        
        if (!efiConfig.clientId || !efiConfig.clientSecret) {
          throw new Error("Credenciais EFI não configuradas");
        }

        // Criar cobrança EFI com PIX
        const efiCharge = await createEfiCharge({
          userName: user.name,
          userEmail: user.email,
          userCpfCnpj: user.cpf || user.cnpj || "",
          planName: plan.name,
          amount: plan.price,
          paymentMethod: "pix",
        });

        // Gerar PIX para a cobrança
        const tokenEfi = await getEfiAccessToken();
        
        const baseUrl = efiConfig.environment === "production" 
          ? "https://cobrancas.api.efipay.com.br/v1"
          : "https://cobrancas-h.api.efipay.com.br/v1";
        
        const pixResponse = await fetch(
          `${baseUrl}/pix/${efiCharge.chargeId}/qrcode`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${tokenEfi}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!pixResponse.ok) {
          const errorData = await pixResponse.json();
          console.error("❌ [EFI PIX] Erro ao gerar QR Code:", errorData);
          throw new Error(`Erro EFI: ${errorData.error_description || 'Erro ao gerar PIX'}`);
        }

        const pixData = await pixResponse.json();
        qrCode = pixData.imagemQrcode || "";
        qrCodeText = pixData.qrcode || "";
        externalId = String(efiCharge.chargeId);

        console.log("✅ [Checkout PIX EFI] QR Code gerado");

      } else if (gateway === "asaas") {
        // Gerar PIX com Asaas
        const asaasCustomerId = await createOrGetAsaasCustomer({
          name: user.name,
          email: user.email,
          cpfCnpj: user.cpf || user.cnpj || ""
        });

        const asaasPix = await createAsaasPixQrCode(
          asaasCustomerId,
          plan.price,
          plan.name,
          payment.id
        );

        qrCode = asaasPix.encodedImage || "";
        qrCodeText = asaasPix.payload || "";
        externalId = asaasPix.id;

        console.log("✅ [Checkout PIX Asaas] QR Code gerado");

      } else {
        throw new Error(`Gateway ${gateway} não suporta PIX ou não está implementado`);
      }

      // Atualizar payment com dados do PIX
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          stripeSessionId: externalId,
        },
      });

      return NextResponse.json({
        success: true,
        qrCode: qrCode,
        qrCodeText: qrCodeText,
        paymentId: payment.id,
        externalId: externalId,
      });

    } catch (gatewayError: any) {
      console.error("❌ [Checkout PIX] Erro no gateway:", gatewayError);
      
      // Atualizar payment como falho
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });

      return NextResponse.json(
        { error: gatewayError.message || "Erro ao gerar PIX" },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("❌ [Checkout PIX] Erro geral:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar checkout PIX" },
      { status: 500 }
    );
  }
}
