
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Buscar formas de pagamento do usuário
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error("Erro ao buscar formas de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar formas de pagamento" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se já existe
    const existing = await prisma.paymentMethod.findFirst({
      where: {
        userId,
        name,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Forma de pagamento já existe" },
        { status: 400 }
      );
    }

    // Criar forma de pagamento
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        name,
        userId,
      },
    });

    return NextResponse.json({ paymentMethod });
  } catch (error) {
    console.error("Erro ao criar forma de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar forma de pagamento" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da forma de pagamento é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se pertence ao usuário
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id, userId },
    });

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Forma de pagamento não encontrada" },
        { status: 404 }
      );
    }

    await prisma.paymentMethod.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Forma de pagamento excluída" });
  } catch (error) {
    console.error("Erro ao excluir forma de pagamento:", error);
    return NextResponse.json(
      { error: "Erro ao excluir forma de pagamento" },
      { status: 500 }
    );
  }
}
