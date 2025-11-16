

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET - Buscar anúncios ativos para uma posição e página
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const page = searchParams.get("page") || "dashboard";
    const userPlan = searchParams.get("plan") || "basic";

    if (!position) {
      return NextResponse.json(
        { error: "Posição é obrigatória" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Buscar anúncios ativos
    const ads = await prisma.advertisement.findMany({
      where: {
        AND: [
          { isActive: true },
          { position },
          {
            OR: [
              { pages: { has: page } },
              { pages: { has: "all" } },
            ],
          },
          {
            OR: [
              { targetPlans: { has: userPlan } },
              { targetPlans: { has: "all" } },
            ],
          },
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
      take: 1, // Retorna apenas o anúncio de maior prioridade
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Error fetching active ads:", error);
    return NextResponse.json(
      { error: "Erro ao carregar anúncios" },
      { status: 500 }
    );
  }
}
