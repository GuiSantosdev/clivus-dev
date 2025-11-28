
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Validar role de superadmin
    if (!session?.user || (session.user as any).role !== "superadmin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Datas de referência
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Total de usuários
    const totalUsers = await prisma.user.count();
    
    // Novos usuários nos últimos 30 dias
    const newUsersLast30Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    // Novos usuários nos últimos 7 dias
    const newUsersLast7Days = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });
    
    // Usuários com acesso pago
    const paidUsers = await prisma.user.count({
      where: { hasAccess: true }
    });
    
    // Buscar todos os pagamentos completados com data
    const completedPayments = await prisma.payment.findMany({
      where: { status: "completed" },
      select: { 
        amount: true,
        createdAt: true,
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const totalPayments = completedPayments.length;
    
    // Vendas nos últimos 30 dias
    const salesLast30Days = completedPayments.filter(
      (p: any) => p.createdAt >= thirtyDaysAgo
    ).length;
    
    // Vendas nos últimos 7 dias
    const salesLast7Days = completedPayments.filter(
      (p: any) => p.createdAt >= sevenDaysAgo
    ).length;
    
    // Receita total
    const totalRevenue = completedPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    
    // Receita últimos 30 dias
    const revenueLast30Days = completedPayments
      .filter((p: any) => p.createdAt >= thirtyDaysAgo)
      .reduce((sum: number, payment: any) => sum + payment.amount, 0);
    
    // Receita últimos 7 dias
    const revenueLast7Days = completedPayments
      .filter((p: any) => p.createdAt >= sevenDaysAgo)
      .reduce((sum: number, payment: any) => sum + payment.amount, 0);
    
    // Média de vendas por dia (últimos 30 dias)
    const avgSalesPerDay = salesLast30Days / 30;
    
    // Ticket médio
    const averageTicket = totalPayments > 0 ? totalRevenue / totalPayments : 0;
    
    // Histórico de vendas por dia (últimos 30 dias)
    const salesHistory: { date: string; sales: number; revenue: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const daySales = completedPayments.filter(
        (p: any) => p.createdAt >= startOfDay && p.createdAt <= endOfDay
      );
      
      salesHistory.push({
        date: dateStr,
        sales: daySales.length,
        revenue: daySales.reduce((sum: number, p: any) => sum + p.amount, 0)
      });
    }
    
    // Distribuição de vendas por plano
    const salesByPlan = await prisma.payment.groupBy({
      by: ['plan'],
      where: { status: 'completed' },
      _count: {
        id: true
      },
      _sum: {
        amount: true
      }
    });
    
    // Taxa de conversão (leads vs vendas)
    const totalLeads = await prisma.lead.count();
    const conversionRate = totalLeads > 0 ? (totalPayments / totalLeads) * 100 : 0;

    const stats = {
      totalUsers,
      paidUsers,
      freeUsers: totalUsers - paidUsers,
      newUsersLast30Days,
      newUsersLast7Days,
      totalPayments,
      salesLast30Days,
      salesLast7Days,
      totalRevenue,
      revenueLast30Days,
      revenueLast7Days,
      avgSalesPerDay,
      averageTicket,
      conversionRate,
      salesHistory,
      salesByPlan: salesByPlan.map((s: any) => ({
        plan: s.plan,
        count: s._count.id,
        revenue: s._sum.amount || 0
      })),
      totalLeads
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

