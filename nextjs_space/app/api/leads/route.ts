
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // Validação básica
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação de email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Verificar se o lead já existe
    const existingLead = await prisma?.lead?.findUnique?.({
      where: { email }
    });

    if (existingLead) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado em nossa lista' },
        { status: 400 }
      );
    }

    // Criar novo lead
    const newLead = await prisma?.lead?.create?.({
      data: {
        name: name?.trim?.(),
        email: email?.toLowerCase?.()?.trim?.(),
        source: 'landing_page'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Lead criado com sucesso',
      leadId: newLead?.id
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar lead:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const leadsCount = await prisma?.lead?.count?.();
    
    return NextResponse.json({
      total: leadsCount ?? 0,
      message: 'Estatísticas dos leads'
    });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
