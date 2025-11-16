
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  User,
  Building2,
  Calendar,
  ArrowRight,
  CheckCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

interface DashboardStats {
  cpf: {
    balance: number;
    income: number;
    expenses: number;
  };
  cnpj: {
    balance: number;
    income: number;
    expenses: number;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    category: string;
    description: string;
    amount: number;
    date: string;
    accountType: string;
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        toast.error("Erro ao carregar dados");
      }
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react");
    await signOut({ redirect: true, callbackUrl: "/" });
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

  // @ts-ignore
  const hasAccess = session?.user?.hasAccess;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo-clivus.png"
                alt="Clivus"
                width={120}
                height={51}
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Olá, {session?.user?.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!hasAccess ? (
          <Card className="border-yellow-200 bg-yellow-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <XCircle className="h-6 w-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Acesso Restrito</h3>
                    <p className="text-sm text-gray-600">
                      Complete o pagamento para acessar todas as funcionalidades do Clivus
                    </p>
                  </div>
                </div>
                <Link href="/checkout">
                  <Button className="bg-yellow-600 hover:bg-yellow-700">
                    Liberar Acesso
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-green-200 bg-green-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Acesso Liberado</h3>
                  <p className="text-sm text-gray-600">
                    Você tem acesso completo a todas as funcionalidades
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* CPF Card */}
          <Card>
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Finanças Pessoais (CPF)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Saldo</p>
                  <p className="text-3xl font-bold text-gray-900">
                    R$ {stats?.cpf?.balance?.toFixed(2) ?? "0,00"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      Receitas
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      R$ {stats?.cpf?.income?.toFixed(2) ?? "0,00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      Despesas
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      R$ {stats?.cpf?.expenses?.toFixed(2) ?? "0,00"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CNPJ Card */}
          <Card>
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-green-600" />
                <span>Finanças Empresariais (CNPJ)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Saldo</p>
                  <p className="text-3xl font-bold text-gray-900">
                    R$ {stats?.cnpj?.balance?.toFixed(2) ?? "0,00"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                      Receitas
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      R$ {stats?.cnpj?.income?.toFixed(2) ?? "0,00"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center">
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                      Despesas
                    </p>
                    <p className="text-lg font-semibold text-red-600">
                      R$ {stats?.cnpj?.expenses?.toFixed(2) ?? "0,00"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/transactions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Transações</h3>
                    <p className="text-sm text-gray-600">Gerenciar entradas e saídas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Relatórios</h3>
                    <p className="text-sm text-gray-600">Visualizar análises</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Configurações</h3>
                    <p className="text-sm text-gray-600">Gerenciar conta</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {stats.recentTransactions.map((transaction) => (
                  <div
                    key={transaction?.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {transaction?.type === "income" ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction?.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transaction?.category} • {transaction?.accountType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          transaction?.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction?.type === "income" ? "+" : "-"} R${" "}
                        {transaction?.amount?.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction?.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Nenhuma transação registrada ainda</p>
                <Link href="/transactions">
                  <Button className="mt-4" size="sm">
                    Adicionar Transação
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
