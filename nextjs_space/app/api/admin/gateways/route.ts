
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "superadmin") {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    // Buscar todos os gateways
    const gateways = await prisma.gateway.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ gateways });
  } catch (error) {
    console.error("Erro ao buscar gateways:", error);
    return NextResponse.json(
      { error: "Erro ao buscar gateways" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "superadmin") {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { envVars } = body;

    if (!envVars || typeof envVars !== "object") {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Caminho para o arquivo .env
    const envPath = join(process.cwd(), ".env");
    
    // Ler o arquivo .env atual
    let envContent = "";
    try {
      envContent = readFileSync(envPath, "utf-8");
    } catch (error) {
      // Se não existir, criar novo
      envContent = "";
    }

    // Atualizar ou adicionar variáveis
    const envLines = envContent.split("\n");
    const updatedVars = new Set<string>();

    for (const [key, value] of Object.entries(envVars)) {
      let found = false;
      
      for (let i = 0; i < envLines.length; i++) {
        // Verifica se a linha começa com a variável (ignorando espaços)
        const line = envLines[i].trim();
        if (line.startsWith(`${key}=`) || line.startsWith(`#${key}=`)) {
          // Atualizar linha existente
          envLines[i] = `${key}="${value}"`;
          found = true;
          updatedVars.add(key);
          break;
        }
      }

      if (!found) {
        // Adicionar nova variável ao final
        envLines.push(`${key}="${value}"`);
        updatedVars.add(key);
      }
    }

    // Escrever de volta no arquivo
    const newEnvContent = envLines.join("\n");
    writeFileSync(envPath, newEnvContent, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Configurações salvas com sucesso! Reinicie o servidor para aplicar as mudanças.",
      updatedVars: Array.from(updatedVars),
    });
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 }
    );
  }
}
