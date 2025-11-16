
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
  UserCheck,
  UserX
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  users: Array<{
    id: string;
    name: string;
    email: string;
    hasAccess: boolean;
    createdAt: string;
    _count: {
      transactions: number;
      payments: number;
    };
  }>;
}

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
      if (session?.user?.role !== "admin") {
        // Se não for admin, redireciona para o dashboard
        router.push("/dashboard");
      } else {
        fetchAdminData();
      }
    }
  }, [status, session, router]);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
      ]);

      if (statsResponse.ok && usersResponse.ok) {
        const statsData = await statsResponse.json();
        const usersData = await usersResponse.json();
        
        setStats({
          ...statsData,
          users: usersData,
        });
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          </div>
          <div className="flex space-x-3">
            <Link href="/admin/sales">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Gestão de Vendas
              </Button>
            </Link>
            <Link href="/admin/plans">
              <Button className="bg-green-600 hover:bg-green-700">
                Gerenciar Planos
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Usuários
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
              <p className="text-xs text-muted-foreground">
                Cadastrados no sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuários Ativos
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.activeUsers ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Com acesso pago
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {stats?.totalRevenue?.toFixed(2) ?? "0,00"}
              </div>
              <p className="text-xs text-muted-foreground">
                Total arrecadado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-gray-700">Nome</th>
                    <th className="text-left p-3 font-medium text-gray-700">Email</th>
                    <th className="text-center p-3 font-medium text-gray-700">Status</th>
                    <th className="text-center p-3 font-medium text-gray-700">Transações</th>
                    <th className="text-center p-3 font-medium text-gray-700">Pagamentos</th>
                    <th className="text-left p-3 font-medium text-gray-700">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.users && stats.users.length > 0 ? (
                    stats.users.map((user) => (
                      <tr key={user?.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 text-gray-900">{user?.name}</td>
                        <td className="p-3 text-gray-600">{user?.email}</td>
                        <td className="p-3 text-center">
                          {user?.hasAccess ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <UserX className="h-3 w-3 mr-1" />
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center text-gray-900">
                          {user?._count?.transactions ?? 0}
                        </td>
                        <td className="p-3 text-center text-gray-900">
                          {user?._count?.payments ?? 0}
                        </td>
                        <td className="p-3 text-gray-600">
                          {new Date(user?.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-600">
                        Nenhum usuário cadastrado ainda
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
