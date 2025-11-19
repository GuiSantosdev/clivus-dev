
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = params;
    const body = await request.json();

    // Verificar se o item pertence ao usuário
    const existing = await prisma.plannedTransaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Planejamento não encontrado" },
        { status: 404 }
      );
    }

    const {
      type,
      accountType,
      category,
      description,
      expectedAmount,
      expectedDate,
      isRecurring,
    } = body;

    const date = new Date(expectedDate);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const plannedTransaction = await prisma.plannedTransaction.update({
      where: { id },
      data: {
        type,
        accountType,
        category,
        description,
        expectedAmount: parseFloat(expectedAmount),
        expectedDate: new Date(expectedDate),
        isRecurring,
        month,
        year,
      },
    });

    return NextResponse.json({ plannedTransaction });
  } catch (error) {
    console.error("Erro ao atualizar planejamento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar planejamento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id } = params;

    // Verificar se o item pertence ao usuário
    const existing = await prisma.plannedTransaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Planejamento não encontrado" },
        { status: 404 }
      );
    }

    await prisma.plannedTransaction.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Planejamento excluído" });
  } catch (error) {
    console.error("Erro ao excluir planejamento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir planejamento" },
      { status: 500 }
    );
  }
}
