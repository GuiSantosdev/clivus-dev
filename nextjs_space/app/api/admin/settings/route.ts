
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "superadmin") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Retorna configurações mascaradas
    const config = {
      smtpHost: process.env.SMTP_HOST || "",
      smtpPort: process.env.SMTP_PORT || "",
      smtpUser: process.env.SMTP_USER || "",
      smtpPass: process.env.SMTP_PASS 
        ? `${process.env.SMTP_PASS.substring(0, 4)}...` 
        : "",
      emailFrom: process.env.EMAIL_FROM || "",
      adminEmail: process.env.ADMIN_EMAIL || "",
      appUrl: process.env.NEXT_PUBLIC_APP_URL || ""
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error("❌ [Admin Settings] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao carregar configurações" },
      { status: 500 }
    );
  }
}
