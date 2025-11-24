
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Settings,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Download,
} from "lucide-react";

interface DreCategory {
  id: string;
  name: string;
  type: "receita" | "despesa";
  group: string;
  order: number;
  customizable: boolean;
}

interface DreData {
  receitas: { [key: string]: number };
  despesas: { [key: string]: number };
  receitaBruta: number;
  despesaTotal: number;
  lucroLiquido: number;
}

const DEFAULT_PLANO_CONTAS: DreCategory[] = [
  // Receitas
  { id: "1", name: "Vendas de Produtos", type: "receita", group: "Receita Operacional", order: 1, customizable: false },
  { id: "2", name: "Prestação de Serviços", type: "receita", group: "Receita Operacional", order: 2, customizable: false },
  { id: "3", name: "Receitas Financeiras", type: "receita", group: "Receita Não Operacional", order: 3, customizable: false },
  
  // Despesas
  { id: "4", name: "Custos de Produtos Vendidos (CPV)", type: "despesa", group: "Custos Diretos", order: 10, customizable: false },
  { id: "5", name: "Despesas com Pessoal", type: "despesa", group: "Despesas Operacionais", order: 11, customizable: false },
  { id: "6", name: "Despesas com Marketing", type: "despesa", group: "Despesas Operacionais", order: 12, customizable: false },
  { id: "7", name: "Despesas Administrativas", type: "despesa", group: "Despesas Operacionais", order: 13, customizable: false },
  { id: "8", name: "Despesas com Infraestrutura", type: "despesa", group: "Despesas Operacionais", order: 14, customizable: false },
  { id: "9", name: "Impostos e Taxas", type: "despesa", group: "Despesas Tributárias", order: 15, customizable: false },
  { id: "10", name: "Despesas Financeiras", type: "despesa", group: "Despesas Financeiras", order: 16, customizable: false },
];

export default function DrePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dreData, setDreData] = useState<DreData | null>(null);
  const [planoContas, setPlanoContas] = useState<DreCategory[]>([]);
  const [customCategories, setCustomCategories] = useState<DreCategory[]>([]);
  const [isEditingPlano, setIsEditingPlano] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    type: "receita" as "receita" | "despesa",
    group: "",
  });
  const [selectedPeriod, setSelectedPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadData();
    }
  }, [status, router, selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar plano de contas personalizado do localStorage
      const savedPlano = localStorage.getItem("clivus_plano_contas");
      const savedCustom = localStorage.getItem("clivus_custom_categories");
      
      if (savedPlano) {
        setPlanoContas(JSON.parse(savedPlano));
      } else {
        setPlanoContas(DEFAULT_PLANO_CONTAS);
      }
      
      if (savedCustom) {
        setCustomCategories(JSON.parse(savedCustom));
      }

      // Buscar transações do período
      const response = await fetch(
    </div>
        `/api/transactions?startDate=${selectedPeriod.startDate}&endDate=${selectedPeriod.endDate}`
      );
      
      if (!response.ok) throw new Error("Erro ao carregar transações");
      
      const data = await response.json();
      const transactions = data.transactions || [];

      // Calcular DRE baseado nas transações
      const receitas: { [key: string]: number } = {};
      const despesas: { [key: string]: number } = {};
      let receitaBruta = 0;
      let despesaTotal = 0;

      transactions.forEach((tx: any) => {
        if (tx.accountType === "cnpj") {
          if (tx.type === "income") {
            receitas[tx.category] = (receitas[tx.category] || 0) + tx.amount;
            receitaBruta += tx.amount;
          } else if (tx.type === "expense") {
            despesas[tx.category] = (despesas[tx.category] || 0) + Math.abs(tx.amount);
            despesaTotal += Math.abs(tx.amount);
          }
        }
      });

      setDreData({
        receitas,
        despesas,
        receitaBruta,
        despesaTotal,
        lucroLiquido: receitaBruta - despesaTotal,
      });
    } catch (error) {
      console.error("Error loading DRE data:", error);
      toast.error("Erro ao carregar dados do DRE");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlanoContas = () => {
    localStorage.setItem("clivus_plano_contas", JSON.stringify(planoContas));
    localStorage.setItem("clivus_custom_categories", JSON.stringify(customCategories));
    toast.success("Plano de contas salvo com sucesso!");
    setIsEditingPlano(false);
  };

  const handleAddCustomCategory = () => {
    if (!newCategoryForm.name || !newCategoryForm.group) {
      toast.error("Preencha todos os campos");
      return;
    }

    const newCategory: DreCategory = {
      id: `custom_${Date.now()}`,
      name: newCategoryForm.name,
      type: newCategoryForm.type,
      group: newCategoryForm.group,
      order: (customCategories.length + 100),
      customizable: true,
    };

    setCustomCategories([...customCategories, newCategory]);
    setNewCategoryForm({ name: "", type: "receita", group: "" });
    toast.success("Categoria adicionada!");
  };

  const handleDeleteCustomCategory = (id: string) => {
    setCustomCategories(customCategories.filter((cat) => cat.id !== id));
    toast.success("Categoria removida!");
  };

  const handleExportDRE = () => {
    if (!dreData) return;

    let csvContent = "DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)\n";
    csvContent += `Período: ${selectedPeriod.startDate} a ${selectedPeriod.endDate}\n\n`;
    csvContent += "RECEITAS\n";
    
    Object.entries(dreData.receitas).forEach(([category, value]) => {
      csvContent += `${category},R$ ${value.toFixed(2)}\n`;
    });
    
    csvContent += `\nRECEITA BRUTA,R$ ${dreData.receitaBruta.toFixed(2)}\n\n`;
    csvContent += "DESPESAS\n";
    
    Object.entries(dreData.despesas).forEach(([category, value]) => {
      csvContent += `${category},-R$ ${value.toFixed(2)}\n`;
    });
    
    csvContent += `\nDESPESA TOTAL,-R$ ${dreData.despesaTotal.toFixed(2)}\n`;
    csvContent += `\nLUCRO LÍQUIDO,R$ ${dreData.lucroLiquido.toFixed(2)}\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `DRE_${selectedPeriod.startDate}_${selectedPeriod.endDate}.csv`;
    link.click();

    toast.success("DRE exportado com sucesso!");
  };

  const handleResetToDefault = () => {
    if (confirm("Tem certeza que deseja restaurar o plano de contas padrão? Suas personalizações serão perdidas.")) {
      setPlanoContas(DEFAULT_PLANO_CONTAS);
      setCustomCategories([]);
      localStorage.removeItem("clivus_plano_contas");
      localStorage.removeItem("clivus_custom_categories");
      toast.success("Plano de contas restaurado!");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  const allCategories = [...planoContas, ...customCategories].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8 text-blue-600" />
              DRE - Demonstração do Resultado do Exercício
            </h1>
            <p className="text-gray-600 mt-1">
              Visualize o desempenho financeiro do seu CNPJ de forma clara e profissional
            </p>
          </div>
          <Button onClick={() => router.push("/dashboard")} variant="outline">
            Voltar
          </Button>
        </div>

        {/* Período e Controles */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Período e Configurações</span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsEditingPlano(!isEditingPlano)}
                  variant={isEditingPlano ? "destructive" : "outline"}
                  size="sm"
                >
                  {isEditingPlano ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Personalizar Plano de Contas
                    </>
                  )}
                </Button>
                {dreData && (
                  <Button onClick={handleExportDRE} variant="default" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar CSV
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={selectedPeriod.startDate}
                  onChange={(e) =>
                    setSelectedPeriod({ ...selectedPeriod, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={selectedPeriod.endDate}
                  onChange={(e) =>
                    setSelectedPeriod({ ...selectedPeriod, endDate: e.target.value })
                  }
                />
              </div>
              <div className="flex items-end">
                <Button onClick={loadData} className="w-full">
                  Atualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personalização do Plano de Contas */}
        {isEditingPlano && (
          <Card className="mb-6 border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-blue-600">
                Personalizar Plano de Contas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categorias Padrão */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Categorias Padrão (Não Editáveis)
                </h3>
                <div className="grid gap-2">
                  {planoContas.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({cat.group})</span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          cat.type === "receita"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {cat.type === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorias Personalizadas */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Categorias Personalizadas
                </h3>
                
                {customCategories.length > 0 && (
                  <div className="grid gap-2 mb-4">
                    {customCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="p-3 bg-blue-50 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <span className="font-medium">{cat.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({cat.group})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              cat.type === "receita"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {cat.type === "receita" ? "Receita" : "Despesa"}
                          </span>
                          <Button
                            onClick={() => handleDeleteCustomCategory(cat.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formulário de Nova Categoria */}
                <div className="p-4 bg-white border-2 border-dashed border-blue-300 rounded-lg">
                  <h4 className="font-medium mb-3">Adicionar Nova Categoria</h4>
                  <div className="grid gap-3">
                    <div>
                      <Label>Nome da Categoria</Label>
                      <Input
                        placeholder="Ex: Despesas com Eventos"
                        value={newCategoryForm.name}
                        onChange={(e) =>
                          setNewCategoryForm({ ...newCategoryForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={newCategoryForm.type}
                        onChange={(e) =>
                          setNewCategoryForm({
                            ...newCategoryForm,
                            type: e.target.value as "receita" | "despesa",
                          })
                        }
                      >
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                      </select>
                    </div>
                    <div>
                      <Label>Grupo</Label>
                      <Input
                        placeholder="Ex: Despesas Operacionais"
                        value={newCategoryForm.group}
                        onChange={(e) =>
                          setNewCategoryForm({ ...newCategoryForm, group: e.target.value })
                        }
                      />
                    </div>
                    <Button onClick={handleAddCustomCategory}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Categoria
                    </Button>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSavePlanoContas} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Personalizações
                </Button>
                <Button onClick={handleResetToDefault} variant="outline">
                  Restaurar Padrão
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* DRE Report */}
        {dreData && !isEditingPlano && (
          <div className="space-y-6">
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5" />
                    Receita Bruta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    R$ {dreData.receitaBruta.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingDown className="h-5 w-5" />
                    Despesa Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    R$ {dreData.despesaTotal.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`bg-gradient-to-br ${
                  dreData.lucroLiquido >= 0
                    ? "from-blue-500 to-indigo-600"
                    : "from-orange-500 to-red-600"
                } text-white`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <DollarSign className="h-5 w-5" />
                    Lucro Líquido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    R$ {dreData.lucroLiquido.toFixed(2)}
                  </p>
                  <p className="text-sm opacity-90 mt-1">
                    {dreData.lucroLiquido >= 0 ? "Lucro" : "Prejuízo"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detalhamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Receitas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Receitas Detalhadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(dreData.receitas).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(dreData.receitas).map(([category, value]) => (
                        <div
                          key={category}
                          className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                        >
                          <span className="font-medium text-gray-700">{category}</span>
                          <span className="text-green-600 font-bold">
                            R$ {value.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-green-200">
                        <div className="flex items-center justify-between font-bold">
                          <span>Total de Receitas</span>
                          <span className="text-green-600">
                            R$ {dreData.receitaBruta.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma receita registrada no período
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Despesas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5" />
                    Despesas Detalhadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(dreData.despesas).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(dreData.despesas).map(([category, value]) => (
                        <div
                          key={category}
                          className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                        >
                          <span className="font-medium text-gray-700">{category}</span>
                          <span className="text-red-600 font-bold">
                            R$ {value.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-red-200">
                        <div className="flex items-center justify-between font-bold">
                          <span>Total de Despesas</span>
                          <span className="text-red-600">
                            R$ {dreData.despesaTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Nenhuma despesa registrada no período
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
