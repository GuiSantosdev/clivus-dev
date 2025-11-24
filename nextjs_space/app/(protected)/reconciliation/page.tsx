
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Crown
} from "lucide-react";
import toast from "react-hot-toast";

interface ParsedTransaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
  matched?: boolean;
  transactionId?: string;
}

export default function ReconciliationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [accountType, setAccountType] = useState<"cpf" | "cnpj">("cpf");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      checkPlanAccess();
    }
  }, [status, router]);

  const checkPlanAccess = async () => {
    try {
      const response = await fetch("/api/user/plan-limits");
      if (response.ok) {
        const data = await response.json();
        const reconciliationFeature = data.limits?.find(
    </div>
          (l: any) => l.featureKey === "bank_reconciliation"
        );
        setHasAccess(reconciliationFeature?.enabled || false);
      }
    } catch (error) {
      console.error("Erro ao verificar acesso:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verifica se é CSV ou OFX
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    const isOFX = file.name.toLowerCase().endsWith('.ofx');
    
    if (!isCSV && !isOFX) {
      toast.error("Por favor, envie um arquivo CSV ou OFX");
      return;
    }

    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("accountType", accountType);

      const response = await fetch("/api/reconciliation/parse", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setParsedTransactions(data.transactions || []);
        const format = data.format || (isOFX ? "OFX" : "CSV");
        toast.success(`✓ ${data.transactions?.length || 0} transações encontradas (formato ${format})`);
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao processar arquivo");
      }
    } catch (error) {
      toast.error("Erro ao processar extrato bancário");
    } finally {
      setProcessing(false);
    }
  };

  const handleEditTransaction = (index: number, field: string, value: string) => {
    const updated = [...parsedTransactions];
    updated[index] = { ...updated[index], [field]: value };
    setParsedTransactions(updated);
  };

  const handleSaveEdit = (index: number) => {
    setEditingIndex(null);
    toast.success("Alteração salva");
  };

  const handleImportTransactions = async () => {
    if (parsedTransactions.length === 0) {
      toast.error("Nenhuma transação para importar");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch("/api/reconciliation/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions: parsedTransactions,
          accountType: accountType.toUpperCase(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.imported} transações importadas com sucesso!`);
        setParsedTransactions([]);
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao importar transações");
      }
    } catch (error) {
      toast.error("Erro ao importar transações");
    } finally {
      setProcessing(false);
    }
  };

  if (loading || status === "loading") {
    return (
    <div className="p-8">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
    </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-600" />
              Funcionalidade Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Conciliação Bancária Automática
              </h3>
              <p className="text-gray-600 mb-6">
                Esta funcionalidade está disponível apenas no <strong>Plano Avançado</strong>.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Com a conciliação automática você pode:
              </p>
              <ul className="text-left max-w-md mx-auto space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Importar extratos bancários (CSV)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Categorização automática de transações
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Editar categorizações incorretas
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Evitar duplicações inteligentes
                </li>
              </ul>
              <Button
                onClick={() => router.push("/checkout?plan=advanced")}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                <Crown className="h-4 w-4 mr-2" />
                Fazer Upgrade para Plano Avançado
              </Button>
            </div>
          </CardContent>
    </div>
        </Card>
    );
  }

  return (
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Conciliação Bancária Automática</h1>
        <p className="text-gray-600 mt-2">
          Importe extratos bancários em CSV ou OFX e categorize automaticamente suas transações
        </p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700 font-medium">Suporte a OFX de todos os bancos brasileiros</span>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enviar Extrato Bancário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Conta</label>
              <Select
                value={accountType}
                onValueChange={(value: "cpf" | "cnpj") => setAccountType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF (Pessoal)</SelectItem>
                  <SelectItem value="cnpj">CNPJ (Empresarial)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Arquivo do Extrato (CSV ou OFX)
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".csv,.ofx"
                  onChange={handleFileUpload}
                  disabled={processing}
                  className="flex-1"
                />
                <FileSpreadsheet className="h-6 w-6 text-gray-400" />
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">
                  <strong>CSV:</strong> Data, Descrição, Valor (separado por vírgula)
                </p>
                <p className="text-xs text-gray-500">
                  <strong>OFX:</strong> Formato padrão de bancos (Bradesco, Itaú, Santander, etc.)
                </p>
                <p className="text-xs text-green-600 font-medium">
                  ✓ OFX oferece maior precisão e previne duplicatas automaticamente
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parsed Transactions */}
      {parsedTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transações do Extrato</CardTitle>
              <Button
                onClick={handleImportTransactions}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Importar {parsedTransactions.length} Transações
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parsedTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {editingIndex === index ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Descrição
                          </label>
                          <Input
                            value={transaction.description}
                            onChange={(e) =>
                              handleEditTransaction(index, "description", e.target.value)
                            }
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Categoria
                          </label>
                          <Input
                            value={transaction.category || ""}
                            onChange={(e) =>
                              handleEditTransaction(index, "category", e.target.value)
                            }
                            placeholder="Ex: Alimentação, Vendas"
                            className="text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Tipo</label>
                          <Select
                            value={transaction.type}
                            onValueChange={(value) =>
                              handleEditTransaction(index, "type", value)
                            }
                          >
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(index)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingIndex(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {transaction.type === "income" ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-600">
                            {transaction.category || "Sem categoria"} •{" "}
                            {new Date(transaction.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p
                          className={`font-semibold text-lg ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"} R${" "}
                          {Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        {transaction.matched && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Já existe
                          </span>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingIndex(index)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </div>
    </div>
  );
}
