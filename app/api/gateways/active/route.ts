
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Buscar gateways ativos no banco
    const activeGateways = await prisma.gateway.findMany({
      where: {
        isEnabled: true,
      },
      select: {
        name: true,
        displayName: true,
        isEnabled: true,
      },
    });

    return NextResponse.json(activeGateways);
  } catch (error) {
    console.error("Error fetching active gateways:", error);
    return NextResponse.json([], { status: 500 });
  }
}
