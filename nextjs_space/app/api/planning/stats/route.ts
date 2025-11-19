
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

    if (!month || !year) {
      return NextResponse.json(
        { error: "Mês e ano são obrigatórios" },
        { status: 400 }
      );
    }

    const plannedTransactions = await prisma.plannedTransaction.findMany({
      where: {
        userId,
        month: parseInt(month),
        year: parseInt(year),
      },
      include: {
        linkedTransactions: true,
      },
    });

    // Calcular estatísticas
    const stats = {
      cpf: {
        income: {
          expected: 0,
          actual: 0,
          percentage: 0,
          difference: 0,
        },
        expense: {
          expected: 0,
          actual: 0,
          percentage: 0,
          difference: 0,
        },
      },
      cnpj: {
        income: {
          expected: 0,
          actual: 0,
          percentage: 0,
          difference: 0,
        },
        expense: {
          expected: 0,
          actual: 0,
          percentage: 0,
          difference: 0,
        },
      },
    };

    for (const planned of plannedTransactions) {
      const accountKey =
        planned.accountType === "CPF"
          ? "cpf"
          : planned.accountType === "CNPJ"
          ? "cnpj"
          : null;
      const typeKey =
        planned.type === "income"
          ? "income"
          : planned.type === "expense"
          ? "expense"
          : null;

      if (!accountKey || !typeKey) continue;

      stats[accountKey][typeKey].expected += planned.expectedAmount;
      stats[accountKey][typeKey].actual += planned.actualAmount || 0;
    }

    // Calcular percentuais e diferenças
    for (const accountType of ["cpf", "cnpj"] as const) {
      for (const transType of ["income", "expense"] as const) {
        const data = stats[accountType][transType];
        if (data.expected > 0) {
          data.percentage = (data.actual / data.expected) * 100;
          data.difference = data.actual - data.expected;
        }
      }
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}
