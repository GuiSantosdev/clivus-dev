// Backup do dashboard original - $(date)

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
  XCircle,
  Calculator,
  ShieldCheck,
  PieChart,
  Users,
  FileText
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ProtectedLayout } from "@/components/protected-layout";
import { AdBanner } from "@/components/ads/ad-banner";
import { PlansModal } from "@/components/plans-modal";

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

interface PlanLimits {
  limits: {
    [key: string]: number;
  };
  planName: string;
  planSlug: string | null;
}

interface PlanningStats {
  cpf: {
    income: { expected: number; actual: number; percentage: number; difference: number };
    expense: { expected: number; actual: number; percentage: number; difference: number };
  };
  cnpj: {
    income: { expected: number; actual: number; percentage: number; difference: number };
    expense: { expected: number; actual: number; percentage: number; difference: number };
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [planningStats, setPlanningStats] = useState<PlanningStats | null>(null);
  const [planningEnabled, setPlanningEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPlansModal, setShowPlansModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchDashboardData();
      fetchPlanLimits();
      
      // Não mostrar modal para SuperAdmin
      if (session?.user?.role === "superadmin") {
        return;
      }
      
      // Verificar se é o primeiro acesso do usuário
      const hasSeenModal = localStorage.getItem("hasSeenPlansModal");
      if (!hasSeenModal) {
        // Mostrar modal após 1 segundo, mas verificar plano antes
        setTimeout(async () => {
          // Buscar plano do usuário
          const limitsResponse = await fetch("/api/user/plan-limits");
          if (limitsResponse.ok) {
            const limitsData = await limitsResponse.json();
            
            // Não mostrar se já tem o plano mais caro (Avançado)
            if (limitsData.planSlug !== "advanced") {
              setShowPlansModal(true);
            }
          }
          
          localStorage.setItem("hasSeenPlansModal", "true");
        }, 1000);
      }
    }
  }, [status, router, session]);

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

  const fetchPlanLimits = async () => {
    try {
      const response = await fetch("/api/user/plan-limits");
      if (response.ok) {
        const data = await response.json();
        setPlanLimits(data);
        
        // Verificar se o planejamento está habilitado
        const planningFeature = data.limits?.find((l: any) => l.featureKey === "financial_planning");
        if (planningFeature?.enabled && planningFeature?.limit !== 0) {
          setPlanningEnabled(true);
          fetchPlanningStats();
        }
      }
    } catch (error) {
      console.error("Erro ao carregar limites do plano:", error);
    }
  };

  const fetchPlanningStats = async () => {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      
      const response = await fetch(`/api/planning/stats?month=${month}&year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setPlanningStats(data.stats);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas de planejamento:", error);
    }
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
    <ProtectedLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Olá, {session?.user?.name}! Bem-vindo ao Clivus
        </p>
      </div>

      {/* Anúncio Topo */}
      <AdBanner position="top" className="mb-6" />
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

        {/* Planejamento Financeiro (Previsto vs Realizado) */}
        {planningEnabled && planningStats && (
          <Card className="mb-8">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span>📊 Planejamento vs Realizado - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                </CardTitle>
                <Link href="/planej">
                  <Button variant="outline" size="sm">
                    Ver Detalhes →
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CPF Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    CPF (Pessoal)
                  </h3>
                  
                  {/* CPF - Receitas */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">💰 Receitas</span>
                      <span className={`text-sm font-semibold ${
                        planningStats.cpf.income.percentage >= 95 ? 'text-green-600' :
                        planningStats.cpf.income.percentage >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {planningStats.cpf.income.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Previsto:</span>
                        <span className="font-medium">R$ {planningStats.cpf.income.expected.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Realizado:</span>
                        <span className="font-medium">R$ {planningStats.cpf.income.actual.toFixed(2)}</span>
                      </div>
                      {planningStats.cpf.income.difference !== 0 && (
                        <div className="flex justify-between pt-1 border-t border-green-300">
                          <span className="text-gray-600">Diferença:</span>
                          <span className={planningStats.cpf.income.difference >= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                            {planningStats.cpf.income.difference >= 0 ? '+' : ''}R$ {planningStats.cpf.income.difference.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CPF - Despesas */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">💸 Despesas</span>
                      <span className={`text-sm font-semibold ${
                        // Para despesas: menos é melhor (verde)
                        planningStats.cpf.expense.percentage <= 80 ? 'text-green-600' :
                        planningStats.cpf.expense.percentage <= 100 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {planningStats.cpf.expense.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Previsto:</span>
                        <span className="font-medium">R$ {planningStats.cpf.expense.expected.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Realizado:</span>
                        <span className="font-medium">R$ {planningStats.cpf.expense.actual.toFixed(2)}</span>
                      </div>
                      {planningStats.cpf.expense.difference !== 0 && (
                        <div className="flex justify-between pt-1 border-t border-red-300">
                          <span className="text-gray-600">Diferença:</span>
                          <span className={planningStats.cpf.expense.difference <= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                            {planningStats.cpf.expense.difference >= 0 ? '+' : ''}R$ {planningStats.cpf.expense.difference.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CNPJ Section */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-green-600" />
                    CNPJ (Empresa)
                  </h3>
                  
                  {/* CNPJ - Receitas */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">💰 Receitas</span>
                      <span className={`text-sm font-semibold ${
                        planningStats.cnpj.income.percentage >= 95 ? 'text-green-600' :
                        planningStats.cnpj.income.percentage >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {planningStats.cnpj.income.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Previsto:</span>
                        <span className="font-medium">R$ {planningStats.cnpj.income.expected.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Realizado:</span>
                        <span className="font-medium">R$ {planningStats.cnpj.income.actual.toFixed(2)}</span>
                      </div>
                      {planningStats.cnpj.income.difference !== 0 && (
                        <div className="flex justify-between pt-1 border-t border-green-300">
                          <span className="text-gray-600">Diferença:</span>
                          <span className={planningStats.cnpj.income.difference >= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                            {planningStats.cnpj.income.difference >= 0 ? '+' : ''}R$ {planningStats.cnpj.income.difference.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CNPJ - Despesas */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">💸 Despesas</span>
                      <span className={`text-sm font-semibold ${
                        // Para despesas: menos é melhor (verde)
                        planningStats.cnpj.expense.percentage <= 80 ? 'text-green-600' :
                        planningStats.cnpj.expense.percentage <= 100 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {planningStats.cnpj.expense.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Previsto:</span>
                        <span className="font-medium">R$ {planningStats.cnpj.expense.expected.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Realizado:</span>
                        <span className="font-medium">R$ {planningStats.cnpj.expense.actual.toFixed(2)}</span>
                      </div>
                      {planningStats.cnpj.expense.difference !== 0 && (
                        <div className="flex justify-between pt-1 border-t border-red-300">
                          <span className="text-gray-600">Diferença:</span>
                          <span className={planningStats.cnpj.expense.difference <= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
                            {planningStats.cnpj.expense.difference >= 0 ? '+' : ''}R$ {planningStats.cnpj.expense.difference.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legenda */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-600 flex items-center gap-4">
                <span>🟢 95-100% (Receitas) / 0-80% (Despesas): Ótimo</span>
                <span>🟡 80-94% (Receitas) / 81-100% (Despesas): Atenção</span>
                <span>🔴 {'<'}80% (Receitas) / {'>'}100% (Despesas): Crítico</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Anúncio Entre Conteúdo */}
        <AdBanner position="between_content" className="my-8" />

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/prolabore">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-400">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Calculadora de Pró-labore</h3>
                  <p className="text-xs text-gray-600">Calcule automaticamente o pró-labore ideal</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200 hover:border-green-400">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Gerador de Relatórios</h3>
                  <p className="text-xs text-gray-600">DRE, fluxo de caixa e balanço</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dre">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-teal-200 hover:border-teal-400">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">DRE</h3>
                  <p className="text-xs text-gray-600">Demonstração do Resultado do Exercício</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/transactions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-purple-200 hover:border-purple-400">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Dashboard Executivo</h3>
                  <p className="text-xs text-gray-600">Indicadores importantes do negócio</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/compliance">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-yellow-200 hover:border-yellow-400">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Compliance Fiscal</h3>
                  <p className="text-xs text-gray-600">Conformidade com obrigações fiscais</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/investments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-indigo-200 hover:border-indigo-400">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <PieChart className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Controle de Investimentos</h3>
                  <p className="text-xs text-gray-600">Investimentos pessoais e empresariais</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/team">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-pink-200 hover:border-pink-400">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Multi-usuário</h3>
                  <p className="text-xs text-gray-600">Acesso ao contador e sócios</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">100% Online</h3>
                <p className="text-xs text-gray-600">Acesse pelo computador ou celular</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-300">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Backup Automático</h3>
                <p className="text-xs text-gray-600">Seus dados sempre seguros na nuvem</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Limits Section */}
        {planLimits && (
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Seu Plano: {planLimits.planName}</span>
                {planLimits.planSlug !== "advanced" && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                    onClick={() => setShowPlansModal(true)}
                  >
                    Fazer Upgrade
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Transações Mensais */}
                {planLimits.limits.transactions_monthly !== undefined && (
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Transações por Mês</p>
                      <p className="text-xs text-gray-600">
                        {planLimits.limits.transactions_monthly === -1 
                          ? "Ilimitado" 
                          : `Até ${planLimits.limits.transactions_monthly}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Membros da Equipe */}
                {planLimits.limits.team_members !== undefined && (
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Membros da Equipe</p>
                      <p className="text-xs text-gray-600">
                        {planLimits.limits.team_members === -1 
                          ? "Ilimitado" 
                          : planLimits.limits.team_members === 0 
                          ? "Não disponível" 
                          : `Até ${planLimits.limits.team_members}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Relatórios DRE */}
                {planLimits.limits.dre_reports_monthly !== undefined && (
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <PieChart className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Relatórios DRE/Mês</p>
                      <p className="text-xs text-gray-600">
                        {planLimits.limits.dre_reports_monthly === -1 
                          ? "Ilimitado" 
                          : planLimits.limits.dre_reports_monthly === 0 
                          ? "Não disponível" 
                          : `Até ${planLimits.limits.dre_reports_monthly}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Calculadora de Pró-labore */}
                {planLimits.limits.prolabore_calculator !== undefined && (
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <Calculator className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Calculadora Pró-labore</p>
                      <p className="text-xs text-gray-600">
                        {planLimits.limits.prolabore_calculator === 0 
                          ? "Não disponível" 
                          : "Disponível"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Compliance Fiscal */}
                {planLimits.limits.compliance_alerts !== undefined && (
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <ShieldCheck className="h-5 w-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Alertas de Compliance</p>
                      <p className="text-xs text-gray-600">
                        {planLimits.limits.compliance_alerts === 0 
                          ? "Não disponível" 
                          : "Disponível"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Controle de Investimentos */}
                {planLimits.limits.investment_tracking !== undefined && (
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <TrendingUp className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Controle de Investimentos</p>
                      <p className="text-xs text-gray-600">
                        {planLimits.limits.investment_tracking === 0 
                          ? "Não disponível" 
                          : "Disponível"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Exportação PDF */}
                {planLimits.limits.export_pdf !== undefined && (
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <FileText className="h-5 w-5 text-pink-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Exportação PDF</p>
                      <p className="text-xs text-gray-600">
                        {planLimits.limits.export_pdf === 0 
                          ? "Não disponível" 
                          : "Disponível"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Categorias Personalizadas DRE */}
                {planLimits.limits.custom_categories !== undefined && (
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <PieChart className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Categorias Personalizadas DRE</p>
                      <p className="text-xs text-gray-600">
                        {planLimits.limits.custom_categories === -1 
                          ? "Ilimitado" 
                          : planLimits.limits.custom_categories === 0 
                          ? "Não disponível" 
                          : `Até ${planLimits.limits.custom_categories}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Suporte Prioritário */}
                {planLimits.limits.priority_support !== undefined && (
                  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">Suporte Prioritário</p>
                      <p className="text-xs text-gray-600">
                        {planLimits.limits.priority_support === 0 
                          ? "Não disponível" 
                          : "Disponível"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Anúncio Modal (Pop-up) */}
        <AdBanner position="modal" />

        {/* Modal de Planos */}
        <PlansModal 
          show={showPlansModal} 
          onClose={() => setShowPlansModal(false)} 
        />
    </ProtectedLayout>
  );
}