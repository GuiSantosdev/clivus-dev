import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Obter configurações de tema
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    // Buscar ou criar configurações globais
    let settings = await prisma.globalSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      // Criar configurações padrão se não existir
      settings = await prisma.globalSettings.create({
        data: {
          id: 1,
          superadminThemePreset: "padrao",
          allowOfficeOverride: false,
          allowUserOverride: true,
        },
      });
    }

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar configurações de tema:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar configurações de tema
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { superadminThemePreset, allowOfficeOverride, allowUserOverride } = body;

    // Validar tema
    const validThemes = ["padrao", "simples", "moderado", "moderno"];
    if (superadminThemePreset && !validThemes.includes(superadminThemePreset)) {
      return NextResponse.json(
        { error: "Tema inválido" },
        { status: 400 }
      );
    }

    // Atualizar ou criar configurações
    const settings = await prisma.globalSettings.upsert({
      where: { id: 1 },
      update: {
        superadminThemePreset: superadminThemePreset || "padrao",
        allowOfficeOverride: allowOfficeOverride ?? false,
        allowUserOverride: allowUserOverride ?? true,
        updatedAt: new Date(),
      },
      create: {
        id: 1,
        superadminThemePreset: superadminThemePreset || "padrao",
        allowOfficeOverride: allowOfficeOverride ?? false,
        allowUserOverride: allowUserOverride ?? true,
      },
    });

    return NextResponse.json(
      { message: "Configurações atualizadas com sucesso", settings },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar configurações de tema:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}
