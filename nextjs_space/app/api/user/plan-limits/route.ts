
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Busca o pagamento mais recente do usuário
    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        status: "completed",
      },
      include: {
        planDetails: {
          include: {
            planFeatures: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!payment?.planDetails) {
      return NextResponse.json({
        limits: [],
        planName: "Nenhum",
        message: "Usuário sem plano ativo",
      });
    }

    return NextResponse.json({
      limits: payment.planDetails.planFeatures,
      planName: payment.planDetails.name,
      planSlug: payment.planDetails.slug,
    });
  } catch (error) {
    console.error("Get plan limits error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar limites do plano" },
      { status: 500 }
    );
  }
}
