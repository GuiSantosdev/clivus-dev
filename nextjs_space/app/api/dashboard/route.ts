
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 10,
    });

    // Calculate stats for CPF
    const cpfTransactions = transactions.filter((t) => t?.accountType === "CPF");
    const cpfIncome = cpfTransactions
      .filter((t) => t?.type === "income")
      .reduce((sum, t) => sum + (t?.amount ?? 0), 0);
    const cpfExpenses = cpfTransactions
      .filter((t) => t?.type === "expense")
      .reduce((sum, t) => sum + (t?.amount ?? 0), 0);

    // Calculate stats for CNPJ
    const cnpjTransactions = transactions.filter((t) => t?.accountType === "CNPJ");
    const cnpjIncome = cnpjTransactions
      .filter((t) => t?.type === "income")
      .reduce((sum, t) => sum + (t?.amount ?? 0), 0);
    const cnpjExpenses = cnpjTransactions
      .filter((t) => t?.type === "expense")
      .reduce((sum, t) => sum + (t?.amount ?? 0), 0);

    return NextResponse.json({
      cpf: {
        balance: cpfIncome - cpfExpenses,
        income: cpfIncome,
        expenses: cpfExpenses,
      },
      cnpj: {
        balance: cnpjIncome - cnpjExpenses,
        income: cnpjIncome,
        expenses: cnpjExpenses,
      },
      recentTransactions: transactions.map((t) => ({
        id: t?.id,
        type: t?.type,
        category: t?.category,
        description: t?.description,
        amount: t?.amount,
        date: t?.date,
        accountType: t?.accountType,
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar dados" },
      { status: 500 }
    );
  }
}
