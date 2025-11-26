import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/gateways
 * Lista todos os gateways configurados
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const gateways = await prisma.gateway.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(gateways);
  } catch (error: any) {
    console.error("[Gateways GET Error]", error);
    return NextResponse.json(
      { error: "Erro ao buscar gateways" },
      { status: 500 }
    );
  }
}
