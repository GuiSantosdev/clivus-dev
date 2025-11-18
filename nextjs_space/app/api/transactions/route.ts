
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
    const accountType = searchParams.get("accountType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = { userId };

    if (accountType) {
      where.accountType = accountType;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        attachments: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar transações" },
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
      category, 
      description, 
      amount, 
      date, 
      accountType,
      paymentMethod,
      isInstallment,
      installmentNumber,
      totalInstallments,
      installmentAmount,
      dueDate
    } = body;

    if (!type || !category || !description || !amount || !date || !accountType) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        category,
        description,
        amount: parseFloat(amount),
        date: new Date(date),
        accountType,
        paymentMethod: paymentMethod || null,
        isInstallment: isInstallment || false,
        installmentNumber: installmentNumber ? parseInt(installmentNumber) : null,
        totalInstallments: totalInstallments ? parseInt(totalInstallments) : null,
        installmentAmount: installmentAmount ? parseFloat(installmentAmount) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Create transaction error:", error);
    return NextResponse.json(
      { error: "Erro ao criar transação" },
      { status: 500 }
    );
  }
}

