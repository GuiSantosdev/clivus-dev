"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

interface PlannedTransaction {
  id: string;
  type: string;
  accountType: string;
  category: string;
  description: string;
  expectedAmount: number;
  expectedDate: string;
  actualAmount: number | null;
  actualDate: string | null;
  isRecurring: boolean;
  month: number;
  year: number;
  linkedTransactions: any[];
}

interface Category {
  id: string;
  name: string;
  type: string;
}

export default function PlanejPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [plannedTransactions, setPlannedTransactions] = useState<PlannedTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  const [formData, setFormData] = useState({
    type: "income",
    accountType: "CPF",
    category: "",
    newCategory: "",
    description: "",
    expectedAmount: "",
    expectedDate: "",
    isRecurring: false,
  });

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchPlannedTransactions();
      fetchCategories();
    }
  }, [status, router, selectedMonth, selectedYear]);

  const fetchPlannedTransactions = async () => {
    try {
      const response = await fetch(
        `/api/planning?month=${selectedMonth}&year=${selectedYear}`
      );
      if (response.ok) {
        const data = await response.json();
        setPlannedTransactions(data.plannedTransactions || []);
      }
    } catch (error) {
      console.error("Erro ao buscar planejamento:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (!formData.newCategory.trim()) {
      toast.error("Digite o nome da categoria");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.newCategory,
          type: formData.type,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCategories([...categories, data.category]);
        setFormData({ ...formData, category: data.category.name, newCategory: "" });
        setShowNewCategoryInput(false);
        toast.success("Categoria criada!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar categoria");
      }
    } catch (error) {
      toast.error("Erro ao criar categoria");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("Selecione ou crie uma categoria");
      return;
    }

    try {
      const url = editingId ? `/api/planning/${editingId}` : "/api/planning";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingId
            ? "Planejamento atualizado com sucesso!"
            : "Planejamento adicionado com sucesso!"
        );
        setShowForm(false);
        setEditingId(null);
        fetchPlannedTransactions();
        resetForm();
      } else {
        toast.error("Erro ao salvar planejamento");
      }
    } catch (error) {
      toast.error("Erro ao salvar planejamento");
    }
  };

  const handleEdit = (planned: PlannedTransaction) => {
    setFormData({
      type: planned.type,
      accountType: planned.accountType,
      category: planned.category,
      newCategory: "",
      description: planned.description,
      expectedAmount: planned.expectedAmount.toString(),
      expectedDate: new Date(planned.expectedDate).toISOString().split("T")[0],
      isRecurring: planned.isRecurring,
    });
    setEditingId(planned.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este planejamento?")) return;

    try {
      const response = await fetch(`/api/planning/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Planejamento excluído com sucesso!");
        fetchPlannedTransactions();
      } else {
        toast.error("Erro ao excluir planejamento");
      }
    } catch (error) {
      toast.error("Erro ao excluir planejamento");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "income",
      accountType: "CPF",
      category: "",
      newCategory: "",
      description: "",
      expectedAmount: "",
      expectedDate: "",
      isRecurring: false,
    });
    setEditingId(null);
  };

  const getStatusIndicator = (planned: PlannedTransaction) => {
    const actual = planned.actualAmount || 0;
    const expected = planned.expectedAmount;
    const percentage = expected > 0 ? (actual / expected) * 100 : 0;
    
    // Lógica INVERTIDA para despesas: reduzir despesa é bom (verde)
    const isExpense = planned.type === "expense";

    if (actual === 0) {
      return {
        icon: <XCircle className="w-5 h-5 text-gray-400" />,
        color: "text-theme-muted",
        label: "Pendente",
      };
    }

    // Para DESPESAS: quanto menor o percentual, melhor (verde)
    // Para RECEITAS: quanto maior o percentual, melhor (verde)
    if (isExpense) {
      if (percentage <= 80) {
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          color: "text-green-600",
          label: `${percentage.toFixed(1)}% ✓`,
        };
      } else if (percentage <= 100) {
        return {
          icon: <AlertCircle className="w-5 h-5 text-accent" />,
          color: "text-accent",
          label: `${percentage.toFixed(1)}% ⚠`,
        };
      } else {
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          color: "text-red-600",
          label: `${percentage.toFixed(1)}% ✗`,
        };
      }
    } else {
      // Receitas: lógica normal
      if (percentage >= 95) {
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          color: "text-green-600",
          label: `${percentage.toFixed(1)}% ✓`,
        };
      } else if (percentage >= 80) {
        return {
          icon: <AlertCircle className="w-5 h-5 text-accent" />,
          color: "text-accent",
          label: `${percentage.toFixed(1)}% ⚠`,
        };
      } else {
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          color: "text-red-600",
          label: `${percentage.toFixed(1)}% ✗`,
        };
      }
    }
  };

  const changeMonth = (direction: number) => {
    let newMonth = selectedMonth + direction;
    let newYear = selectedYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);
  const incomeTransactions = plannedTransactions.filter((t) => t.type === "income");
  const expenseTransactions = plannedTransactions.filter((t) => t.type === "expense");

  const totalIncomeExpected = incomeTransactions.reduce(
    (acc, t) => acc + t.expectedAmount,
    0
  );
  const totalIncomeActual = incomeTransactions.reduce(
    (acc, t) => acc + (t.actualAmount || 0),
    0
  );
  const totalExpenseExpected = expenseTransactions.reduce(
    (acc, t) => acc + t.expectedAmount,
    0
  );
  const totalExpenseActual = expenseTransactions.reduce(
    (acc, t) => acc + (t.actualAmount || 0),
    0
  );

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">📅 Planejamento Financeiro</h1>
          <Button onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              resetForm();
            }
          }} className="gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancelar" : "Nova Receita/Despesa"}
          </Button>
        </div>

        {/* Seleção de Mês/Ano */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-xl font-semibold min-w-[200px] text-center">
                {monthNames[selectedMonth - 1]} {selectedYear}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Formulário */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingId ? "Editar Planejamento" : "Adicionar Planejamento"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value, category: "" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Conta</Label>
                    <Select
                      value={formData.accountType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, accountType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF (Pessoal)</SelectItem>
                        <SelectItem value="CNPJ">CNPJ (Empresa)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Categoria</Label>
                  {!showNewCategoryInput ? (
                    <div className="flex gap-2">
                      <Select
                        value={formData.category}
                        onValueChange={(value) => {
                          if (value === "_new_") {
                            setShowNewCategoryInput(true);
                          } else {
                            setFormData({ ...formData, category: value });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="_new_">
                            ➕ Criar nova categoria
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nome da nova categoria"
                        value={formData.newCategory}
                        onChange={(e) =>
                          setFormData({ ...formData, newCategory: e.target.value })
                        }
                      />
                      <Button
                        type="button"
                        onClick={handleCreateCategory}
                        size="sm"
                      >
                        Salvar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewCategoryInput(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Ex: Salário, Aluguel, Conta de Luz"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Valor Previsto (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.expectedAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, expectedAmount: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Data Prevista</Label>
                    <Input
                      type="date"
                      value={formData.expectedDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expectedDate: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) =>
                      setFormData({ ...formData, isRecurring: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isRecurring" className="cursor-pointer">
                    ♻️ Repetir este planejamento todo mês
                  </Label>
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Atualizar" : "Adicionar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Receitas Planejadas */}
        <Card>
          <CardHeader className="bg-green-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                💰 RECEITAS PLANEJADAS
              </CardTitle>
              <div className="text-right">
                <div className="text-sm text-theme-muted">Previsto</div>
                <div className="text-2xl font-bold text-green-600">
                  R$ {totalIncomeExpected.toFixed(2)}
                </div>
                <div className="text-sm text-theme-muted mt-1">Realizado</div>
                <div className="text-xl font-semibold text-green-700">
                  R$ {totalIncomeActual.toFixed(2)} (
                  {totalIncomeExpected > 0
                    ? ((totalIncomeActual / totalIncomeExpected) * 100).toFixed(1)
                    : "0"}
                  %)
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {incomeTransactions.length === 0 ? (
              <p className="text-center text-theme-muted py-8">
                Nenhuma receita planejada para este mês
              </p>
            ) : (
              <div className="space-y-3">
                {incomeTransactions.map((planned) => {
                  const status = getStatusIndicator(planned);
                  return (
                    <div
                      key={planned.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {status.icon}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{planned.description}</p>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {planned.category}
                            </span>
                            <span className="text-xs text-theme-muted">
                              {planned.accountType}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm mt-1">
                            <span>
                              Previsto: R$ {planned.expectedAmount.toFixed(2)} •{" "}
                              {new Date(planned.expectedDate).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className={status.color}>
                              Realizado: R$ {(planned.actualAmount || 0).toFixed(2)}{" "}
                              {status.label}
                            </span>
                            {planned.actualAmount && planned.actualAmount !== planned.expectedAmount && (
                              <span
                                className={
                                  (planned.actualAmount || 0) >= planned.expectedAmount
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                Diferença: R${" "}
                                {((planned.actualAmount || 0) - planned.expectedAmount).toFixed(
                                  2
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(planned)}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(planned.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Despesas Planejadas */}
        <Card>
          <CardHeader className="bg-red-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-6 h-6 text-red-600" />
                💸 DESPESAS PLANEJADAS
              </CardTitle>
              <div className="text-right">
                <div className="text-sm text-theme-muted">Previsto</div>
                <div className="text-2xl font-bold text-red-600">
                  R$ {totalExpenseExpected.toFixed(2)}
                </div>
                <div className="text-sm text-theme-muted mt-1">Realizado</div>
                <div className="text-xl font-semibold text-red-700">
                  R$ {totalExpenseActual.toFixed(2)} (
                  {totalExpenseExpected > 0
                    ? ((totalExpenseActual / totalExpenseExpected) * 100).toFixed(1)
                    : "0"}
                  %)
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {expenseTransactions.length === 0 ? (
              <p className="text-center text-theme-muted py-8">
                Nenhuma despesa planejada para este mês
              </p>
            ) : (
              <div className="space-y-3">
                {expenseTransactions.map((planned) => {
                  const status = getStatusIndicator(planned);
                  return (
                    <div
                      key={planned.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {status.icon}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{planned.description}</p>
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              {planned.category}
                            </span>
                            <span className="text-xs text-theme-muted">
                              {planned.accountType}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm mt-1">
                            <span>
                              Previsto: R$ {planned.expectedAmount.toFixed(2)} •{" "}
                              {new Date(planned.expectedDate).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className={status.color}>
                              Realizado: R$ {(planned.actualAmount || 0).toFixed(2)}{" "}
                              {status.label}
                            </span>
                            {planned.actualAmount && planned.actualAmount !== planned.expectedAmount && (
                              <span
                                className={
                                  // Para despesas: gastar MENOS é bom (verde)
                                  (planned.actualAmount || 0) <= planned.expectedAmount
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                Diferença: R${" "}
                                {((planned.actualAmount || 0) - planned.expectedAmount).toFixed(
                                  2
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(planned)}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(planned.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
