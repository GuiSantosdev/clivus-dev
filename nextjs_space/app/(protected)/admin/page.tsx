
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  UserPlus,
  ShoppingCart,
  Target,
  Percent,
  Calendar,
  BarChart3,
  Crown,
  Package
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AdminStats {
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  newUsersLast30Days: number;
  newUsersLast7Days: number;
  totalPayments: number;
  salesLast30Days: number;
  salesLast7Days: number;
  totalRevenue: number;
  revenueLast30Days: number;
  revenueLast7Days: number;
  avgSalesPerDay: number;
  averageTicket: number;
  conversionRate: number;
  salesHistory: { date: string; sales: number; revenue: number }[];
  salesByPlan: { plan: string; count: number; revenue: number }[];
  totalLeads: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // @ts-ignore
      if (session?.user?.role !== "superadmin") {
        router.push("/dashboard");
      } else {
        fetchAdminData();
      }
    }
  }, [status, session, router]);

  const fetchAdminData = async () => {
    try {
      const response = await fetch("/api/admin/stats");

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        toast.error("Erro ao carregar dados administrativos");
      }
    } catch (error) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-theme-muted">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-accent" />
                <h1 className="text-3xl font-bold text-theme">Dashboard SuperAdmin</h1>
              </div>
              <p className="text-theme-muted">Visão completa do negócio Clivus</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-theme-muted">Última atualização</p>
            <p className="text-sm font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        {/* Principais Indicadores - Linha 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-green-600 mt-1">
                +{stats?.newUsersLast30Days || 0} nos últimos 30 dias
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.paidUsers || 0} pagos • {stats?.freeUsers || 0} gratuitos
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Novos Clientes (30d)</CardTitle>
              <UserPlus className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.newUsersLast30Days || 0}</div>
              <p className="text-xs text-green-600 mt-1">
                {stats?.newUsersLast7Days || 0} nos últimos 7 dias
              </p>
              <p className="text-xs text-muted-foreground">
                Crescimento da base
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPayments || 0}</div>
              <p className="text-xs text-green-600 mt-1">
                +{stats?.salesLast30Days || 0} nos últimos 30 dias
              </p>
              <p className="text-xs text-muted-foreground">
                Pagamentos completados
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {(stats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-green-600 mt-1">
                +R$ {(stats?.revenueLast30Days || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (30d)
              </p>
              <p className="text-xs text-muted-foreground">
                Receita acumulada
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Indicadores de Performance - Linha 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas/Dia (Média 30d)</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.avgSalesPerDay || 0).toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.salesLast7Days || 0} vendas nos últimos 7 dias
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <Target className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {(stats?.averageTicket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Por transação
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <Percent className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.conversionRate || 0).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.totalLeads || 0} leads captados
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita (7 dias)</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {(stats?.revenueLast7Days || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Última semana
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Histórico de Vendas (30 dias) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Histórico de Vendas (30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats?.salesHistory || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => {
                      const date = new Date(value as string);
                      return date.toLocaleDateString('pt-BR');
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Receita por Dia (30 dias) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Receita Diária (30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.salesHistory || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => {
                      const date = new Date(value as string);
                      return date.toLocaleDateString('pt-BR');
                    }}
                    formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Receita (R$)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Vendas por Plano */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Distribuição de Vendas por Plano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Gráfico de Pizza */}
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.salesByPlan || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.plan}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(stats?.salesByPlan || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              {/* Tabela de Detalhes */}
              <div className="space-y-3">
                {(stats?.salesByPlan || []).map((plan, index) => (
                  <div 
                    key={plan.plan}
                    className="flex items-center justify-between p-3 bg-muted-soft rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-semibold capitalize">{plan.plan}</p>
                        <p className="text-xs text-theme-muted">{plan.count} vendas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        R$ {plan.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-theme-muted">
                        {((plan.count / (stats?.totalPayments || 1)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Gerenciar Planos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-theme-muted mb-4">
                Configure os planos de assinatura, preços e recursos.
              </p>
              <Link href="/admin/plans">
                <Button className="w-full">Acessar Planos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Gerenciar Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-theme-muted mb-4">
                Visualize vendas, pagamentos e envie credenciais.
              </p>
              <Link href="/admin/sales">
                <Button className="w-full">Acessar Vendas</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
