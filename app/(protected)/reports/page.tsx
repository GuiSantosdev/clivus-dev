
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown,
  ArrowLeft,
  PieChart,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface ReportData {
  cpf: {
    balance: number;
    income: number;
    expenses: number;
    categories: Array<{ category: string; total: number }>;
  };
  cnpj: {
    balance: number;
    income: number;
    expenses: number;
    categories: Array<{ category: string; total: number }>;
  };
  monthly: Array<{
    month: string;
    cpfIncome: number;
    cpfExpenses: number;
    cnpjIncome: number;
    cnpjExpenses: number;
  }>;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchReports();
    }
  }, [status, router]);

  const fetchReports = async () => {
    try {
      const response = await fetch("/api/reports");
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      }
    } catch (error) {
      toast.error("Erro ao carregar relatórios");
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-theme-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-theme">Relatórios Financeiros</h1>
        <p className="text-theme text-base mt-2">Visualize e exporte seus relatórios financeiros</p>
      </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center space-x-2 text-theme">
                <PieChart className="h-5 w-5 text-primary" />
                <span>CPF - Finanças Pessoais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-theme-muted">Saldo Atual</p>
                  <p className="text-3xl font-bold text-theme">
                    R$ {reportData?.cpf?.balance?.toFixed(2) ?? "0,00"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-theme-muted flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      Receitas
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      R$ {reportData?.cpf?.income?.toFixed(2) ?? "0,00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-theme-muted flex items-center">
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      Despesas
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      R$ {reportData?.cpf?.expenses?.toFixed(2) ?? "0,00"}
                    </p>
                  </div>
                </div>

                {reportData?.cpf?.categories && reportData.cpf.categories.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-theme mb-2">
                      Principais Categorias
                    </p>
                    <div className="space-y-2">
                      {reportData.cpf.categories.slice(0, 5).map((cat, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-theme-muted">{cat?.category}</span>
                          <span className="font-medium text-theme">
                            R$ {cat?.total?.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-secondary/5">
              <CardTitle className="flex items-center space-x-2 text-theme">
                <BarChart3 className="h-5 w-5 text-secondary" />
                <span>CNPJ - Finanças Empresariais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-theme-muted">Saldo Atual</p>
                  <p className="text-3xl font-bold text-theme">
                    R$ {reportData?.cnpj?.balance?.toFixed(2) ?? "0,00"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-theme-muted flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      Receitas
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      R$ {reportData?.cnpj?.income?.toFixed(2) ?? "0,00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-theme-muted flex items-center">
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      Despesas
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      R$ {reportData?.cnpj?.expenses?.toFixed(2) ?? "0,00"}
                    </p>
                  </div>
                </div>

                {reportData?.cnpj?.categories && reportData.cnpj.categories.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-theme mb-2">
                      Principais Categorias
                    </p>
                    <div className="space-y-2">
                      {reportData.cnpj.categories.slice(0, 5).map((cat, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-theme-muted">{cat?.category}</span>
                          <span className="font-medium text-theme">
                            R$ {cat?.total?.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Overview */}
        {reportData?.monthly && reportData.monthly.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Visão Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-theme">
                      <th className="text-left p-3 font-medium text-theme">Mês</th>
                      <th className="text-right p-3 font-medium text-theme">CPF Receitas</th>
                      <th className="text-right p-3 font-medium text-theme">CPF Despesas</th>
                      <th className="text-right p-3 font-medium text-theme">CNPJ Receitas</th>
                      <th className="text-right p-3 font-medium text-theme">CNPJ Despesas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.monthly.map((month, index) => (
                      <tr key={index} className="border-b border-theme hover:bg-muted-soft">
                        <td className="p-3 text-theme">{month?.month}</td>
                        <td className="p-3 text-right text-green-600 font-medium">
                          R$ {month?.cpfIncome?.toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-red-600 font-medium">
                          R$ {month?.cpfExpenses?.toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-green-600 font-medium">
                          R$ {month?.cnpjIncome?.toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-red-600 font-medium">
                          R$ {month?.cnpjExpenses?.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
