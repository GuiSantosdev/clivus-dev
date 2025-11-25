
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import {
  Users,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Search,
  Filter,
  Package,
  DollarSign,
  Send,
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  hasAccess: boolean;
  createdAt: string;
  _count?: {
    transactions: number;
    payments: number;
  };
  payments?: Array<{
    id: string;
    status: string;
    gateway: string;
    amount: number;
    planDetails: {
      name: string;
    };
  }>;
}

export default function ClientsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sendingCredentials, setSendingCredentials] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "superadmin") {
        router.push("/dashboard");
        return;
      }
      fetchUsers();
    }
  }, [status, session, router]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterStatus, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Erro ao carregar usuários");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Erro ao carregar usuários");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por status
    if (filterStatus === "active") {
      filtered = filtered.filter((user) => user.hasAccess);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((user) => !user.hasAccess);
    }

    setFilteredUsers(filtered);
  };

  const handleResendCredentials = async (userId: string) => {
    try {
      setSendingCredentials(userId);
      const response = await fetch("/api/send-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao enviar credenciais");
      }

      toast.success("Credenciais enviadas com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao enviar credenciais");
    } finally {
      setSendingCredentials(null);
    }
  };

  const getStatusBadge = (hasAccess: boolean) => {
    if (hasAccess) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Ativo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
        <XCircle className="w-4 h-4" />
        Inativo
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      superadmin: "bg-purple-100 text-purple-800",
      admin: "bg-primary bg-opacity-10 text-blue-800",
      user: "bg-muted-soft text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          colors[role] || colors.user
        }`}
      >
        {role === "superadmin" ? "SuperAdmin" : role === "admin" ? "Admin" : "Cliente"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.hasAccess).length;
  const inactiveUsers = users.filter((u) => !u.hasAccess).length;

  return (
    <div className="min-h-screen bg-muted-soft p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-theme">
                Gestão de Clientes Pagantes
              </h1>
              <p className="text-theme-muted">
                Clientes com acesso ativo ao sistema (hasAccess: true)
              </p>
            </div>
          </div>
        </div>

        {/* Info sobre Leads */}
        <div className="bg-primary bg-opacity-5 border border-primary border-opacity-30 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Dica:</strong> Para ver leads e usuários que ainda não completaram o pagamento, 
            acesse <Link href="/admin/leads" className="underline font-semibold text-blue-900">Leads & Remarketing</Link>
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-theme-muted">
                Total de Clientes
              </CardTitle>
              <Users className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-theme">{totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-theme-muted">
                Clientes Ativos
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{activeUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-theme-muted">
                Clientes Inativos
              </CardTitle>
              <XCircle className="w-5 h-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{inactiveUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Todos
                </Button>
                <Button
                  variant={filterStatus === "active" ? "default" : "outline"}
                  onClick={() => setFilterStatus("active")}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Ativos
                </Button>
                <Button
                  variant={filterStatus === "inactive" ? "default" : "outline"}
                  onClick={() => setFilterStatus("inactive")}
                  className="gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Inativos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lista de Clientes ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-theme">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-theme">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-theme">
                      Função
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-theme">
                      Plano
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-theme">
                      Cadastro
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm text-theme">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-theme-muted">
                        Nenhum cliente encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const lastPayment = user.payments?.[0];
                      return (
                        <tr
                          key={user.id}
                          className="border-b border-gray-100 hover:bg-muted-soft"
                        >
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-theme">
                                {user.name || "Sem nome"}
                              </span>
                              <span className="text-sm text-theme-muted flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(user.hasAccess)}
                          </td>
                          <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                          <td className="py-3 px-4">
                            {lastPayment ? (
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-blue-600" />
                                <span className="text-sm text-theme">
                                  {lastPayment.planDetails?.name || "N/A"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-theme-muted">
                                Sem plano
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 text-sm text-theme-muted">
                              <Calendar className="w-4 h-4" />
                              {new Date(user.createdAt).toLocaleDateString(
                                "pt-BR"
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleResendCredentials(user.id)}
                                disabled={
                                  sendingCredentials === user.id ||
                                  !user.hasAccess
                                }
                                className="gap-2"
                              >
                                <Send className="w-4 h-4" />
                                {sendingCredentials === user.id
                                  ? "Enviando..."
                                  : "Enviar Acesso"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
