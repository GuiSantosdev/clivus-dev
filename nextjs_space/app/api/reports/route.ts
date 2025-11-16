
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = { userId };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: {
        date: "desc",
      },
    });

    // Calculate totals by account type
    const cpfIncome = transactions
      .filter((t: any) => t.accountType === "CPF" && t.type === "income")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const cpfExpense = transactions
      .filter((t: any) => t.accountType === "CPF" && t.type === "expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const cnpjIncome = transactions
      .filter((t: any) => t.accountType === "CNPJ" && t.type === "income")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const cnpjExpense = transactions
      .filter((t: any) => t.accountType === "CNPJ" && t.type === "expense")
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const report = {
      period: {
        start: startDate,
        end: endDate,
      },
      cpf: {
        income: cpfIncome,
        expense: cpfExpense,
        balance: cpfIncome - cpfExpense,
      },
      cnpj: {
        income: cnpjIncome,
        expense: cnpjExpense,
        balance: cnpjIncome - cnpjExpense,
      },
      total: {
        income: cpfIncome + cnpjIncome,
        expense: cpfExpense + cnpjExpense,
        balance: cpfIncome + cnpjIncome - (cpfExpense + cnpjExpense),
      },
      transactions,
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Get report error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar relatório" },
      { status: 500 }
    );
  }
}

