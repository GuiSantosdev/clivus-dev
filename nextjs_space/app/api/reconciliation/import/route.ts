
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { transactions, accountType } = body;

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json(
        { error: "Transações inválidas" },
        { status: 400 }
      );
    }

    let imported = 0;
    let skipped = 0;

    for (const trans of transactions) {
      // Verifica se já existe transação similar (mesmo valor, data e descrição)
      const existing = await prisma.transaction.findFirst({
        where: {
          userId,
          date: new Date(trans.date),
          amount: trans.amount,
          description: {
            contains: trans.description.substring(0, 20),
          },
          accountType,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Cria nova transação
      await prisma.transaction.create({
        data: {
          userId,
          type: trans.type,
          category: trans.category || "Outros",
          description: trans.description,
          amount: trans.amount,
          date: new Date(trans.date),
          accountType,
          autoImported: true,
          reconciled: true,
          reconciliationDate: new Date(),
        },
      });

      imported++;
    }

    return NextResponse.json({
      imported,
      skipped,
      total: transactions.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Erro ao importar transações", message: String(error) },
      { status: 500 }
    );
  }
}
