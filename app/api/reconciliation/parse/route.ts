
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OFXParser from "ofx-js";

// Função auxiliar para categorização automática
function categorizeTransaction(description: string): string {
  const descLower = description.toLowerCase();

  if (descLower.includes("salario") || descLower.includes("salário")) {
    return "Salário";
  } else if (descLower.includes("freelance") || descLower.includes("consultoria")) {
    return "Freelance";
  } else if (descLower.includes("aluguel")) {
    return "Moradia";
  } else if (descLower.includes("supermercado") || descLower.includes("alimentação")) {
    return "Alimentação";
  } else if (descLower.includes("combustivel") || descLower.includes("transporte")) {
    return "Transporte";
  } else if (descLower.includes("venda") || descLower.includes("receita")) {
    return "Vendas";
  } else if (descLower.includes("fornecedor")) {
    return "Fornecedores";
  } else if (descLower.includes("marketing") || descLower.includes("anuncio")) {
    return "Marketing";
  } else if (descLower.includes("imposto") || descLower.includes("das")) {
    return "Impostos";
  }

  return "Outros";
}

// Parser CSV
function parseCSV(text: string) {
  const lines = text.split("\n").filter((line) => line.trim());
  const dataLines = lines[0].toLowerCase().includes("data") ? lines.slice(1) : lines;
  const transactions = [];

  for (const line of dataLines) {
    const parts = line.split(",").map((p) => p.trim());

    if (parts.length < 3) continue;

    const [dateStr, description, amountStr] = parts;

    // Parse da data (aceita formatos dd/mm/yyyy ou yyyy-mm-dd)
    let date: Date;
    if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/");
      date = new Date(`${year}-${month}-${day}`);
    } else {
      date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) continue;

    // Parse do valor (remove R$, pontos e troca vírgula por ponto)
    const amount = parseFloat(
      amountStr.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
    );

    if (isNaN(amount)) continue;

    const category = categorizeTransaction(description);

    transactions.push({
      date: date.toISOString().split("T")[0],
      description,
      amount: Math.abs(amount),
      type: amount >= 0 ? "income" : "expense",
      category,
      matched: false,
      bankStatementId: null,
    });
  }

  return transactions;
}

// Parser OFX
function parseOFX(text: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const transactions: any[] = [];

    const parser = new OFXParser();

    parser.parse(text, (error: any, data: any) => {
      if (error) {
        reject(error);
        return;
      }

      try {
        // Navega pela estrutura OFX
        const bankTransactions =
          data?.body?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN || [];

        // Garante que seja um array
        const transArray = Array.isArray(bankTransactions)
          ? bankTransactions
          : [bankTransactions];

        for (const trans of transArray) {
          if (!trans || !trans.DTPOSTED || !trans.TRNAMT) continue;

          // Parse da data OFX (formato YYYYMMDD ou YYYYMMDDHHMMSS)
          const dateStr = String(trans.DTPOSTED).substring(0, 8);
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);
          const date = new Date(`${year}-${month}-${day}`);

          if (isNaN(date.getTime())) continue;

          // Valor da transação
          const amount = parseFloat(trans.TRNAMT);

          if (isNaN(amount)) continue;

          // Descrição (usa MEMO ou NAME)
          const description = trans.MEMO || trans.NAME || "Transação Importada";

          // ID único da transação (FITID)
          const bankStatementId = trans.FITID || null;

          // Categorização automática
          const category = categorizeTransaction(description);

          transactions.push({
            date: date.toISOString().split("T")[0],
            description,
            amount: Math.abs(amount),
            type: amount >= 0 ? "income" : "expense",
            category,
            matched: false,
            bankStatementId,
          });
        }

        resolve(transactions);
      } catch (err) {
        reject(err);
      }
    });
  });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const accountType = formData.get("accountType") as string;

    if (!file) {
      return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
    }

    // Lê o conteúdo do arquivo
    const text = await file.text();
    const fileName = file.name.toLowerCase();

    let transactions = [];

    // Detecta o formato automaticamente
    if (fileName.endsWith(".ofx") || text.includes("<OFX>")) {
      // Parse OFX
      console.log("Detectado formato OFX");
      transactions = await parseOFX(text);
    } else {
      // Parse CSV (padrão)
      console.log("Detectado formato CSV");
      transactions = parseCSV(text);
    }

    return NextResponse.json({
      transactions,
      total: transactions.length,
      format: fileName.endsWith(".ofx") || text.includes("<OFX>") ? "OFX" : "CSV",
    });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Erro ao processar arquivo", message: String(error) },
      { status: 500 }
    );
  }
}
