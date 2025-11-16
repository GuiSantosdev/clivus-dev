

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET - Listar todos os anúncios
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "superadmin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const ads = await prisma.advertisement.findMany({
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      { error: "Erro ao carregar anúncios" },
      { status: 500 }
    );
  }
}

// POST - Criar novo anúncio
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user as any).role !== "superadmin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      type,
      adsenseCode,
      bannerUrl,
      linkUrl,
      position,
      pages,
      targetPlans,
      priority,
      startDate,
      endDate,
    } = body;

    // Validações
    if (!title || !type || !position) {
      return NextResponse.json(
        { error: "Campos obrigatórios: title, type, position" },
        { status: 400 }
      );
    }

    if (type === "adsense" && !adsenseCode) {
      return NextResponse.json(
        { error: "Código do AdSense é obrigatório para tipo 'adsense'" },
        { status: 400 }
      );
    }

    if (type === "banner" && (!bannerUrl || !linkUrl)) {
      return NextResponse.json(
        { error: "URL do banner e link são obrigatórios para tipo 'banner'" },
        { status: 400 }
      );
    }

    const ad = await prisma.advertisement.create({
      data: {
        title,
        type,
        adsenseCode: type === "adsense" ? adsenseCode : null,
        bannerUrl: type === "banner" ? bannerUrl : null,
        linkUrl: type === "banner" ? linkUrl : null,
        position,
        pages: pages || ["all"],
        targetPlans: targetPlans || ["all"],
        priority: priority || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
      },
    });

    return NextResponse.json({ ad }, { status: 201 });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json(
      { error: "Erro ao criar anúncio" },
      { status: 500 }
    );
  }
}
