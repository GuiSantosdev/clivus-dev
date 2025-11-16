
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Listar todas as funcionalidades de um plano específico
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    const features = await prisma.planFeature.findMany({
      where: { planId },
      orderBy: { featureName: "asc" },
    });

    return NextResponse.json(features);
  } catch (error) {
    console.error("Error fetching plan features:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan features" },
      { status: 500 }
    );
  }
}

// POST - Criar ou atualizar múltiplas funcionalidades de um plano
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { planId, features } = body;

    if (!planId || !Array.isArray(features)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Atualizar ou criar cada funcionalidade
    const results = await Promise.all(
      features.map(async (feature: any) => {
        return prisma.planFeature.upsert({
          where: {
            planId_featureKey: {
              planId,
              featureKey: feature.featureKey,
            },
          },
          update: {
            featureName: feature.featureName,
            limit: feature.limit,
            enabled: feature.enabled,
          },
          create: {
            planId,
            featureKey: feature.featureKey,
            featureName: feature.featureName,
            limit: feature.limit,
            enabled: feature.enabled,
          },
        });
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error updating plan features:", error);
    return NextResponse.json(
      { error: "Failed to update plan features" },
      { status: 500 }
    );
  }
}
