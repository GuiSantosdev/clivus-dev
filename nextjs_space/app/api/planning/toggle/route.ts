
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "Campo 'enabled' é obrigatório" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        planningEnabled: enabled,
      },
    });

    return NextResponse.json({
      planningEnabled: user.planningEnabled,
      message: enabled
        ? "Planejamento financeiro ativado"
        : "Planejamento financeiro desativado",
    });
  } catch (error) {
    console.error("Erro ao alternar planejamento:", error);
    return NextResponse.json(
      { error: "Erro ao alternar planejamento" },
      { status: 500 }
    );
  }
}
