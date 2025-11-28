
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar quais gateways têm credenciais configuradas
    const gatewayConfigs = {
      asaas: !!(process.env.ASAAS_API_KEY),
      stripe: !!(process.env.STRIPE_SECRET_KEY),
      cora: !!(process.env.CORA_API_KEY),
      pagarme: !!(process.env.PAGARME_API_KEY),
      efi: !!(process.env.EFI_CLIENT_ID && process.env.EFI_CLIENT_SECRET),
    };

    console.log("✅ [Check Gateway Config]:", gatewayConfigs);

    return NextResponse.json(gatewayConfigs);
  } catch (error: any) {
    console.error("❌ [Check Gateway Config] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao verificar configurações" },
      { status: 500 }
    );
  }
}
