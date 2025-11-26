import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/gateways/[name]
 * Atualiza configurações de um gateway
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name } = params;

    // Verificar se o gateway existe
    const existingGateway = await prisma.gateway.findUnique({
      where: { name },
    });

    const updateData: any = {};

    // Atualizar isEnabled se fornecido
    if (typeof body.isEnabled === "boolean") {
      updateData.isEnabled = body.isEnabled;
    }

    // Atualizar environment se fornecido
    if (body.environment) {
      updateData.environment = body.environment;
    }

    // Atualizar configurações se fornecidas
    if (body.sandboxConfig !== undefined) {
      updateData.sandboxConfig = body.sandboxConfig;
    }

    if (body.productionConfig !== undefined) {
      updateData.productionConfig = body.productionConfig;
    }

    if (body.sandboxWebhook !== undefined) {
      updateData.sandboxWebhook = body.sandboxWebhook || null;
    }

    if (body.productionWebhook !== undefined) {
      updateData.productionWebhook = body.productionWebhook || null;
    }

    // Se o gateway não existe, criar um novo
    if (!existingGateway) {
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      
      const newGateway = await prisma.gateway.create({
        data: {
          name,
          displayName,
          ...updateData,
        },
      });

      return NextResponse.json(newGateway);
    }

    // Atualizar gateway existente
    const updatedGateway = await prisma.gateway.update({
      where: { name },
      data: updateData,
    });

    return NextResponse.json(updatedGateway);
  } catch (error: any) {
    console.error("[Gateway PUT Error]", error);
    return NextResponse.json(
      { error: "Erro ao atualizar gateway" },
      { status: 500 }
    );
  }
}
