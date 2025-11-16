
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // Lê o conteúdo do arquivo CSV
    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    // Remove cabeçalho se existir
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

      if (isNaN(date.getTime())) {
        continue; // Pula linhas com data inválida
      }

      // Parse do valor (remove R$, pontos e troca vírgula por ponto)
      const amount = parseFloat(
        amountStr.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()
      );

      if (isNaN(amount)) {
        continue; // Pula linhas com valor inválido
      }

      // Categorização automática baseada em palavras-chave
      let category = "Outros";
      const descLower = description.toLowerCase();

      if (descLower.includes("salario") || descLower.includes("salário")) {
        category = "Salário";
      } else if (descLower.includes("freelance") || descLower.includes("consultoria")) {
        category = "Freelance";
      } else if (descLower.includes("aluguel")) {
        category = "Moradia";
      } else if (descLower.includes("supermercado") || descLower.includes("alimentação")) {
        category = "Alimentação";
      } else if (descLower.includes("combustivel") || descLower.includes("transporte")) {
        category = "Transporte";
      } else if (descLower.includes("venda") || descLower.includes("receita")) {
        category = "Vendas";
      } else if (descLower.includes("fornecedor")) {
        category = "Fornecedores";
      } else if (descLower.includes("marketing") || descLower.includes("anuncio")) {
        category = "Marketing";
      } else if (descLower.includes("imposto") || descLower.includes("das")) {
        category = "Impostos";
      }

      transactions.push({
        date: date.toISOString().split("T")[0],
        description,
        amount: Math.abs(amount),
        type: amount >= 0 ? "income" : "expense",
        category,
        matched: false,
      });
    }

    return NextResponse.json({
      transactions,
      total: transactions.length,
    });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Erro ao processar arquivo", message: String(error) },
      { status: 500 }
    );
  }
}
