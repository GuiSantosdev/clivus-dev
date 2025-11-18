
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  X
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: string;
}

interface PaymentMethod {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  accountType: string;
  paymentMethod?: string | null;
  isInstallment: boolean;
  installmentNumber?: number | null;
  totalInstallments?: number | null;
  installmentAmount?: number | null;
  dueDate?: string | null;
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  
  const [formData, setFormData] = useState({
    type: "income",
    category: "",
    newCategory: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    accountType: "CPF",
    paymentMethod: "",
    newPaymentMethod: "",
    isInstallment: false,
    installmentNumber: "1",
    totalInstallments: "1",
    installmentAmount: "",
    dueDate: "",
  });

  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showNewPaymentMethodInput, setShowNewPaymentMethodInput] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchTransactions();
      fetchCategories();
      fetchPaymentMethods();
    }
  }, [status, router]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/transactions");
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
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

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payment-methods");
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
      }
    } catch (error) {
      console.error("Erro ao buscar formas de pagamento:", error);
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

  const handleCreatePaymentMethod = async () => {
    if (!formData.newPaymentMethod.trim()) {
      toast.error("Digite o nome da forma de pagamento");
      return;
    }

    try {
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.newPaymentMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentMethods([...paymentMethods, data.paymentMethod]);
        setFormData({ ...formData, paymentMethod: data.paymentMethod.name, newPaymentMethod: "" });
        setShowNewPaymentMethodInput(false);
        toast.success("Forma de pagamento criada!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Erro ao criar forma de pagamento");
      }
    } catch (error) {
      toast.error("Erro ao criar forma de pagamento");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      toast.error("Selecione ou crie uma categoria");
      return;
    }

    try {
      const transactionData: any = {
        type: formData.type,
        category: formData.category,
        description: formData.description,
        amount: formData.amount,
        date: formData.date,
        accountType: formData.accountType,
        paymentMethod: formData.paymentMethod || null,
      };

      if (formData.isInstallment) {
        transactionData.isInstallment = true;
        transactionData.installmentNumber = formData.installmentNumber;
        transactionData.totalInstallments = formData.totalInstallments;
        transactionData.installmentAmount = formData.installmentAmount || formData.amount;
        transactionData.dueDate = formData.dueDate || formData.date;
      }

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        toast.success("Transação adicionada com sucesso!");
        setShowForm(false);
        fetchTransactions();
        setFormData({
          type: "income",
          category: "",
          newCategory: "",
          description: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          accountType: "CPF",
          paymentMethod: "",
          newPaymentMethod: "",
          isInstallment: false,
          installmentNumber: "1",
          totalInstallments: "1",
          installmentAmount: "",
          dueDate: "",
        });
      } else {
        toast.error("Erro ao adicionar transação");
      }
    } catch (error) {
      toast.error("Erro ao adicionar transação");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Transação excluída com sucesso!");
        fetchTransactions();
      } else {
        const data = await response.json();
        toast.error(data.error || "Erro ao excluir transação");
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
      toast.error("Erro ao excluir transação");
    }
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Transações</h1>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancelar" : "Nova Transação"}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Transação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Tipo e Conta */}
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

                {/* Categoria */}
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

                {/* Descrição */}
                <div>
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Ex: Salário, Venda, Aluguel, etc."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Valor e Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div>
                  <Label>Forma de Pagamento (Opcional)</Label>
                  {!showNewPaymentMethodInput ? (
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => {
                        if (value === "_new_") {
                          setShowNewPaymentMethodInput(true);
                        } else {
                          setFormData({ ...formData, paymentMethod: value });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((pm) => (
                          <SelectItem key={pm.id} value={pm.name}>
                            {pm.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="_new_">
                          ➕ Criar nova forma de pagamento
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nome da forma de pagamento"
                        value={formData.newPaymentMethod}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            newPaymentMethod: e.target.value,
                          })
                        }
                      />
                      <Button
                        type="button"
                        onClick={handleCreatePaymentMethod}
                        size="sm"
                      >
                        Salvar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewPaymentMethodInput(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>

                {/* Parcelamento */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="isInstallment"
                      checked={formData.isInstallment}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isInstallment: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isInstallment" className="cursor-pointer">
                      É uma compra/venda a prazo (parcelada)?
                    </Label>
                  </div>

                  {formData.isInstallment && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Parcela Atual</Label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.installmentNumber}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                installmentNumber: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label>Total de Parcelas</Label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.totalInstallments}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                totalInstallments: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <Label>Valor da Parcela</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Opcional (usa valor total)"
                            value={formData.installmentAmount}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                installmentAmount: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Data de Vencimento da Parcela</Label>
                        <Input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) =>
                            setFormData({ ...formData, dueDate: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Adicionar
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Todas as Transações</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhuma transação encontrada
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      {transaction.type === "income" ? (
                        <ArrowUpCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="w-8 h-8 text-red-600" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{transaction.description}</p>
                          {transaction.isInstallment && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {transaction.installmentNumber}/{transaction.totalInstallments}x
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {transaction.category}
                          </span>
                          <span className="flex items-center gap-1">
                            {transaction.accountType}
                          </span>
                          {transaction.paymentMethod && (
                            <span className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              {transaction.paymentMethod}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p
                          className={`text-lg font-bold ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"} R${" "}
                          {transaction.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedLayout>
  );
}
