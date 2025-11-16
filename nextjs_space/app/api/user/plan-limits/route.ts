
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserPlanLimits } from '@/lib/plan-limits';
import { prisma } from '@/lib/db';

// GET - Buscar limites do plano do usuário
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        payments: {
          where: { status: "completed" },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            planDetails: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Buscar limites do plano
    const limits = await getUserPlanLimits(user.id);

    // Informações do plano
    const planInfo = user.payments[0]?.planDetails || null;

    return NextResponse.json({ 
      limits,
      planName: planInfo?.name || "Sem Plano",
      planSlug: planInfo?.slug || null,
    });
  } catch (error) {
    console.error('Error fetching plan limits:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar limites do plano' },
      { status: 500 }
    );
  }
}
