import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Obter hierarquia de temas do usuário
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    // Buscar configurações globais
    let globalSettings = await prisma.globalSettings.findUnique({
      where: { id: 1 },
    });

    if (!globalSettings) {
      // Criar configurações padrão se não existir
      globalSettings = await prisma.globalSettings.create({
        data: {
          id: 1,
          superadminThemePreset: "simples",
          allowOfficeOverride: false,
          allowUserOverride: true,
        },
      });
    }

    // Buscar dados do usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        themePreset: true,
        officeId: true,
        allowThemeOverride: true,
      },
    });

    // TODO: Buscar tema do escritório quando implementado
    const officeTheme = null; // Placeholder para futura implementação

    // Determinar tema efetivo usando prioridade
    const effectiveTheme =
      user?.themePreset ||
      officeTheme ||
      globalSettings.superadminThemePreset ||
      "simples";

    return NextResponse.json(
      {
        effectiveTheme,
        userTheme: user?.themePreset || null,
        officeTheme: officeTheme,
        superadminTheme: globalSettings.superadminThemePreset,
        canChangeTheme: globalSettings.allowUserOverride,
        // Permissões para futura implementação de escritório
        isOfficeOwner: user?.allowThemeOverride || false,
        allowOfficeOverride: globalSettings.allowOfficeOverride,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar tema do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar tema" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar tema do usuário
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { themePreset } = body;

    // Verificar se usuário tem permissão para alterar tema
    const globalSettings = await prisma.globalSettings.findUnique({
      where: { id: 1 },
    });

    if (globalSettings && !globalSettings.allowUserOverride) {
      return NextResponse.json(
        { error: "Alteração de tema desabilitada pelo administrador" },
        { status: 403 }
      );
    }

    // Validar tema (sistema oficial - 3 temas únicos)
    const validThemes = ["simples", "moderado", "moderno", null];
    if (themePreset !== null && !validThemes.includes(themePreset)) {
      return NextResponse.json(
        { error: "Tema inválido" },
        { status: 400 }
      );
    }

    // Atualizar tema do usuário
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        themePreset: themePreset,
      },
      select: {
        themePreset: true,
      },
    });

    return NextResponse.json(
      {
        message: "Tema atualizado com sucesso",
        themePreset: updatedUser.themePreset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar tema do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar tema" },
      { status: 500 }
    );
  }
}
