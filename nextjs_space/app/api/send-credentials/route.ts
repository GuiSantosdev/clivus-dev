
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

// POST - Enviar credenciais manualmente (apenas admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Verificar se é admin
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { userId, customPassword } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar último pagamento concluído do usuário
    const payment = await prisma.payment.findFirst({
      where: { 
        userId,
        status: 'completed' 
      },
      include: { planDetails: true },
      orderBy: { createdAt: 'desc' },
    });

    const planName = payment?.planDetails?.name || 'Clivus';
    
    // Gerar nova senha se fornecida, ou usar a senha padrão
    let password = customPassword;
    if (!password) {
      // Gerar senha aleatória
      password = Math.random().toString(36).slice(-8);
    }

    // Atualizar senha do usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Enviar e-mail com credenciais
    const emailResult = await sendWelcomeEmail({
      to: user.email,
      name: user.name || 'Cliente',
      email: user.email,
      password,
      planName,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Erro ao enviar e-mail' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Credenciais enviadas com sucesso',
    });
  } catch (error) {
    console.error('Error sending credentials:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar credenciais' },
      { status: 500 }
    );
  }
}
