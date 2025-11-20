
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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

    console.log("✅ [Check Payment] Status:", payment.status);

    return NextResponse.json({
      status: payment.status,
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
