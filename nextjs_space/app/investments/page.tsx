
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp,
  ArrowLeft,
  Plus,
  Trash2,
  DollarSign,
  PieChart,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ProtectedLayout } from "@/components/protected-layout";

interface Investment {
  id: string;
  name: string;
  type: string;
  amount: number;
  accountType: string;
  returns: number;
  date: string;
}

export default function InvestmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "cdb",
    amount: "",
    accountType: "CPF",
    returns: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadInvestments();
    }
  }, [status, router]);

  const loadInvestments = () => {
    // Simulação de investimentos
    const mockInvestments: Investment[] = [
      {
        id: "1",
        name: "Tesouro Direto IPCA+ 2026",
        type: "tesouro",
        amount: 5000,
        accountType: "CPF",
        returns: 6.5,
        date: "2024-01-15",
      },
      {
        id: "2",
        name: "CDB Banco XYZ",
        type: "cdb",
        amount: 10000,
        accountType: "CPF",
        returns: 7.2,
        date: "2024-03-20",
      },
      {
        id: "3",
        name: "Fundo de Renda Fixa",
        type: "fundo",
        amount: 15000,
        accountType: "CNPJ",
        returns: 5.8,
        date: "2024-02-10",
      },
    ];
    setInvestments(mockInvestments);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newInvestment: Investment = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      amount: parseFloat(formData.amount),
      accountType: formData.accountType,
      returns: parseFloat(formData.returns),
      date: formData.date,
    };

    setInvestments([...investments, newInvestment]);
    toast.success("Investimento adicionado com sucesso!");
    setShowForm(false);
    setFormData({
      name: "",
      type: "cdb",
      amount: "",
      accountType: "CPF",
      returns: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este investimento?")) return;
    setInvestments(investments.filter((inv) => inv.id !== id));
    toast.success("Investimento excluído com sucesso!");
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const cpfInvestments = investments.filter((inv) => inv.accountType === "CPF");
  const cnpjInvestments = investments.filter((inv) => inv.accountType === "CNPJ");
  const cpfTotal = cpfInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const cnpjTotal = cnpjInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalInvestments = cpfTotal + cnpjTotal;

  return (
    <ProtectedLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle de Investimentos</h1>
          <p className="text-gray-600 mt-2">Separe e acompanhe investimentos CPF e CNPJ</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Investimento
          </Button>
        </div>

        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Por que separar investimentos PF e PJ?</p>
                <p>
                  Investimentos pessoais (CPF) e empresariais (CNPJ) têm tributações diferentes.
                  Manter essa separação garante conformidade fiscal e facilita a declaração.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Investido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    R$ {totalInvestments.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">CPF + CNPJ</p>
                </div>
                <DollarSign className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Investimentos CPF
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    R$ {cpfTotal.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{cpfInvestments.length} ativos</p>
                </div>
                <PieChart className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Investimentos CNPJ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-600">
                    R$ {cnpjTotal.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{cnpjInvestments.length} ativos</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Adicionar Investimento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Investimento</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ex: CDB Banco XYZ"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cdb">CDB</SelectItem>
                        <SelectItem value="tesouro">Tesouro Direto</SelectItem>
                        <SelectItem value="lci">LCI/LCA</SelectItem>
                        <SelectItem value="fundo">Fundo de Investimento</SelectItem>
                        <SelectItem value="acoes">Ações</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Conta</label>
                    <Select
                      value={formData.accountType}
                      onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPF">CPF (Pessoal)</SelectItem>
                        <SelectItem value="CNPJ">CNPJ (Empresarial)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor Investido (R$)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Rentabilidade (% a.a.)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.returns}
                      onChange={(e) => setFormData({ ...formData, returns: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Data</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Adicionar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-green-600" />
                <span>Investimentos CPF (Pessoal)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {cpfInvestments.length > 0 ? (
                <div className="space-y-3">
                  {cpfInvestments.map((investment) => (
                    <div
                      key={investment.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{investment.name}</p>
                          <p className="text-sm text-gray-600">
                            {investment.type.toUpperCase()} • {investment.returns}% a.a.
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(investment.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                          <div>
                            <p className="text-lg font-semibold text-green-600">
                              R$ {investment.amount.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(investment.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum investimento pessoal registrado</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span>Investimentos CNPJ (Empresarial)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {cnpjInvestments.length > 0 ? (
                <div className="space-y-3">
                  {cnpjInvestments.map((investment) => (
                    <div
                      key={investment.id}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{investment.name}</p>
                          <p className="text-sm text-gray-600">
                            {investment.type.toUpperCase()} • {investment.returns}% a.a.
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(investment.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                          <div>
                            <p className="text-lg font-semibold text-purple-600">
                              R$ {investment.amount.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(investment.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum investimento empresarial registrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
    </ProtectedLayout>
  );
}
