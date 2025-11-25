
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "superadmin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        hasAccess: true, // Apenas clientes pagantes
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cpf: true,
        cnpj: true,
        businessArea: true,
        hasAccess: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true,
            payments: true,
          },
        },
        payments: {
          where: {
            status: "completed",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            status: true,
            gateway: true,
            amount: true,
            planDetails: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

