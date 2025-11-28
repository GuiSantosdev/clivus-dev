
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
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: any = { userId };

    if (month && year) {
      where.month = parseInt(month);
      where.year = parseInt(year);
    }

    const plannedTransactions = await prisma.plannedTransaction.findMany({
      where,
      include: {
        linkedTransactions: true,
      },
      orderBy: {
        expectedDate: "asc",
      },
    });

    return NextResponse.json({ plannedTransactions });
  } catch (error) {
    console.error("Erro ao buscar planejamento:", error);
    return NextResponse.json(
      { error: "Erro ao buscar planejamento" },
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
    const {
      type,
      accountType,
      category,
      description,
      expectedAmount,
      expectedDate,
      isRecurring,
    } = body;

    if (
      !type ||
      !accountType ||
      !category ||
      !description ||
      !expectedAmount ||
      !expectedDate
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const date = new Date(expectedDate);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const plannedTransaction = await prisma.plannedTransaction.create({
      data: {
        userId,
        type,
        accountType,
        category,
        description,
        expectedAmount: parseFloat(expectedAmount),
        expectedDate: new Date(expectedDate),
        isRecurring: isRecurring || false,
        month,
        year,
      },
    });

    return NextResponse.json({ plannedTransaction });
  } catch (error) {
    console.error("Erro ao criar planejamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar planejamento" },
      { status: 500 }
    );
  }
}
