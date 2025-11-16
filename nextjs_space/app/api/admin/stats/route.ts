
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const totalUsers = await prisma.user.count();
    const paidUsers = await prisma.user.count({
      where: { hasAccess: true },
    });
    const totalPayments = await prisma.payment.count({
      where: { status: "completed" },
    });
    const totalRevenue = await prisma.payment.aggregate({
      where: { status: "completed" },
      _sum: { amount: true },
    });

    const stats = {
      totalUsers,
      paidUsers,
      freeUsers: totalUsers - paidUsers,
      totalPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}

