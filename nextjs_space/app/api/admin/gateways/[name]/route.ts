
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "superadmin") {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { isEnabled } = body;

    if (typeof isEnabled !== "boolean") {
      return NextResponse.json(
        { error: "isEnabled deve ser um booleano" },
        { status: 400 }
      );
    }

    // Verificar se o gateway existe
    const existingGateway = await prisma.gateway.findUnique({
      where: { name: params.name },
    });

    if (!existingGateway) {
      // Se não existe, criar
      const gateway = await prisma.gateway.create({
        data: {
          name: params.name,
          displayName: capitalizeFirstLetter(params.name),
          isEnabled,
        },
      });
      return NextResponse.json({ gateway });
    }

    // Atualizar gateway existente
    const gateway = await prisma.gateway.update({
      where: { name: params.name },
      data: { isEnabled },
    });

    return NextResponse.json({ gateway });
  } catch (error) {
    console.error("Erro ao atualizar gateway:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar gateway" },
      { status: 500 }
    );
  }
}

function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
