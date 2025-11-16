

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST - Registrar impressão ou clique
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adId, event } = body; // event: "impression" ou "click"

    if (!adId || !event) {
      return NextResponse.json(
        { error: "Campos obrigatórios: adId, event" },
        { status: 400 }
      );
    }

    if (event !== "impression" && event !== "click") {
      return NextResponse.json(
        { error: "Evento deve ser 'impression' ou 'click'" },
        { status: 400 }
      );
    }

    // Incrementa o contador apropriado
    const updateData =
      event === "impression"
        ? { impressions: { increment: 1 } }
        : { clicks: { increment: 1 } };

    await prisma.advertisement.update({
      where: { id: adId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking ad event:", error);
    return NextResponse.json(
      { error: "Erro ao registrar evento" },
      { status: 500 }
    );
  }
}
