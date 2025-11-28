
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// Retorna planejamentos disponíveis para vincular a uma transação
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // income ou expense
    const accountType = searchParams.get("accountType"); // CPF ou CNPJ
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    if (!type || !accountType || !month || !year) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios faltando" },
        { status: 400 }
      );
    }

    const plannedTransactions = await prisma.plannedTransaction.findMany({
      where: {
        userId,
        type,
        accountType,
        month: parseInt(month),
        year: parseInt(year),
      },
      include: {
        linkedTransactions: true,
      },
      orderBy: {
        expectedDate: "asc",
      },
    });

    return NextResponse.json({ plannedTransactions });
  } catch (error) {
    console.error("Erro ao buscar planejamentos disponíveis:", error);
    return NextResponse.json(
      { error: "Erro ao buscar planejamentos" },
      { status: 500 }
    );
  }
}
