
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Listar todos os planos (incluindo inativos)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const plans = await prisma.plan.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar planos' },
      { status: 500 }
    );
  }
}

// POST - Criar novo plano
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { name, slug, price, features, order, isActive } = await req.json();

    // Validar campos obrigatórios
    if (!name || !slug || price === undefined) {
      return NextResponse.json(
        { error: 'Nome, slug e preço são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar plano
    const plan = await prisma.plan.create({
      data: {
        name,
        slug,
        price: parseFloat(price),
        features: features || [],
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Error creating plan:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Já existe um plano com este slug' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar plano' },
      { status: 500 }
    );
  }
}
