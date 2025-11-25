
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Mail,
  Calendar,
  User,
  Package,
  CreditCard,
  Filter,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Payment {
  id: string;
  amount: number;
  status: string;
  gateway: string;
  stripePaymentId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  planDetails: {
    id: string;
    name: string;
    price: number;
  } | null;
}

interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  completedSales: number;
  pendingSales: number;
}

export default function AdminSalesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchSalesData();
    }
  }, [status, router]);

  const fetchSalesData = async () => {
    try {
      const response = await fetch("/api/admin/sales");
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments);
        setStats(data.stats);
      } else {
        toast.error("Erro ao carregar dados de vendas");
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCredentials = async (userId: string) => {
    try {
      const response = await fetch("/api/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast.success("Credenciais reenviadas com sucesso!");
      } else {
        toast.error("Erro ao reenviar credenciais");
      }
    } catch (error) {
      console.error("Error resending credentials:", error);
      toast.error("Erro ao reenviar credenciais");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-accent bg-opacity-20 text-accent",
      failed: "bg-red-100 text-red-800",
      expired: "bg-muted-soft text-gray-800",
    };

    const labels = {
      completed: "Concluído",
      pending: "Pendente",
      failed: "Falhou",
      expired: "Expirado",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || "bg-muted-soft text-gray-800"
        }`}
      >
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const filteredPayments = filterStatus === "all" 
    ? payments 
    : payments.filter(p => p.status === filterStatus);

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-muted-soft flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-theme-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted-soft">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-theme">Gestão de Vendas</h1>
                <p className="text-theme-muted mt-1">Controle completo de pagamentos e clientes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSales ?? 0}</div>
              <p className="text-xs text-muted-foreground">Todas as transações</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {stats?.totalRevenue?.toFixed(2) ?? "0,00"}
              </div>
              <p className="text-xs text-muted-foreground">Total arrecadado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Concluídas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.completedSales ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Pagamentos confirmados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {stats?.pendingSales ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">Aguardando confirmação</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setFilterStatus("all")}
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
              >
                Todas
              </Button>
              <Button
                onClick={() => setFilterStatus("completed")}
                variant={filterStatus === "completed" ? "default" : "outline"}
                size="sm"
                className={filterStatus === "completed" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Concluídas
              </Button>
              <Button
                onClick={() => setFilterStatus("pending")}
                variant={filterStatus === "pending" ? "default" : "outline"}
                size="sm"
                className={filterStatus === "pending" ? "bg-accent hover:bg-accent hover:brightness-90" : ""}
              >
                Pendentes
              </Button>
              <Button
                onClick={() => setFilterStatus("failed")}
                variant={filterStatus === "failed" ? "default" : "outline"}
                size="sm"
                className={filterStatus === "failed" ? "bg-red-600 hover:bg-red-700" : ""}
              >
                Falhadas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-theme">Cliente</th>
                    <th className="text-left p-3 font-medium text-theme">Plano</th>
                    <th className="text-center p-3 font-medium text-theme">Valor</th>
                    <th className="text-center p-3 font-medium text-theme">Status</th>
                    <th className="text-center p-3 font-medium text-theme">Gateway</th>
                    <th className="text-left p-3 font-medium text-theme">Data</th>
                    <th className="text-center p-3 font-medium text-theme">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments && filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <tr key={payment?.id} className="border-b hover:bg-muted-soft">
                        <td className="p-3">
                          <div>
                            <div className="font-medium text-theme">
                              {payment?.user?.name || "—"}
                            </div>
                            <div className="text-sm text-theme-muted">
                              {payment?.user?.email}
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-theme">
                          {payment?.planDetails?.name || "—"}
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-semibold text-green-600">
                            R$ {payment?.amount?.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {getStatusBadge(payment?.status)}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-blue-800">
                            <CreditCard className="h-3 w-3 mr-1" />
                            {payment?.gateway || "N/A"}
                          </span>
                        </td>
                        <td className="p-3 text-theme-muted">
                          {new Date(payment?.createdAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="p-3 text-center">
                          {payment?.status === "completed" && (
                            <Button
                              onClick={() => handleResendCredentials(payment.user.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Reenviar Credenciais
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-theme-muted">
                        Nenhuma venda encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
