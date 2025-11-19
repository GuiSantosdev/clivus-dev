
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
  Users,
  Mail,
  Calendar,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  ShoppingCart,
  UserPlus,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  cnpj?: string;
  businessArea?: string;
  source: string;
  status: string;
  createdAt: string;
  lastCheckoutAttempt?: string | null;
  lastPaymentStatus?: string;
  lastPaymentAmount?: number;
  type: string;
}

interface Stats {
  totalLeads: number;
  landingPageLeads: number;
  registeredUsers: number;
  checkoutStarted: number;
  paymentPending: number;
}

export default function LeadsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    landingPageLeads: 0,
    registeredUsers: 0,
    checkoutStarted: 0,
    paymentPending: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session?.user?.role !== "superadmin") {
        router.push("/dashboard");
      } else {
        fetchLeads();
      }
    }
  }, [status, session, router]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/leads");

      if (!response.ok) {
        throw new Error("Erro ao carregar leads");
      }

      const data = await response.json();
      setLeads(data.leads);
      setFilteredLeads(data.leads);
      setStats(data.stats);
    } catch (error) {
      console.error("Erro ao carregar leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Aplicar filtros
    let result = [...leads];

    // Filtro por status
    if (filterStatus !== "all") {
      result = result.filter((lead) => {
        if (filterStatus === "novo") return lead.status === "novo";
        if (filterStatus === "registered") return lead.status === "registered";
        if (filterStatus === "checkout_started") return lead.lastCheckoutAttempt;
        if (filterStatus === "payment_pending") return lead.status === "payment_pending";
        return true;
      });
    }

    // Filtro por busca
    if (searchTerm) {
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeads(result);
  }, [searchTerm, filterStatus, leads]);

  const handleDelete = async (id: string, type: string) => {
    if (!confirm("Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`/api/admin/leads?id=${id}&type=${type}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir lead");
      }

      toast.success("Lead excluído com sucesso!");
      fetchLeads();
    } catch (error) {
      console.error("Erro ao excluir lead:", error);
      toast.error("Erro ao excluir lead");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (lead: Lead) => {
    if (lead.status === "novo") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <UserPlus className="h-3 w-3" />
          Novo Lead
        </span>
      );
    }

    if (lead.status === "registered") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <UserPlus className="h-3 w-3" />
          Cadastrado
        </span>
      );
    }

    if (lead.lastCheckoutAttempt) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          <ShoppingCart className="h-3 w-3" />
          Checkout Iniciado
        </span>
      );
    }

    if (lead.status === "payment_pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Clock className="h-3 w-3" />
          Pagamento Pendente
        </span>
      );
    }

    if (lead.status === "payment_failed") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3" />
          Pagamento Falhou
        </span>
      );
    }

    return null;
  };

  const getSourceBadge = (source: string) => {
    if (source === "landing_page") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Landing Page
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
        Cadastro Completo
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestão de Leads & Remarketing
        </h1>
        <p className="text-gray-600">
          Gerencie leads da landing page e usuários que ainda não completaram o pagamento
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Landing Page
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.landingPageLeads}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats.registeredUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Checkout Iniciado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{stats.checkoutStarted}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pag. Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{stats.paymentPending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por status */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos os Status</option>
                <option value="novo">Novos Leads</option>
                <option value="registered">Cadastrados</option>
                <option value="checkout_started">Checkout Iniciado</option>
                <option value="payment_pending">Pagamento Pendente</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Leads */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Leads ({filteredLeads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Lead</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Origem</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Cadastro</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Último Checkout</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum lead encontrado
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{lead.name}</p>
                          <p className="text-sm text-gray-500">{lead.email}</p>
                          {lead.cnpj && (
                            <p className="text-xs text-gray-400">CNPJ: {lead.cnpj}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getSourceBadge(lead.source)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(lead)}
                        {lead.lastPaymentStatus && (
                          <p className="text-xs text-gray-400 mt-1">
                            Último pagamento: {lead.lastPaymentStatus}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {lead.lastCheckoutAttempt ? (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock className="h-3 w-3" />
                            {new Date(lead.lastCheckoutAttempt).toLocaleDateString("pt-BR")}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(lead.id, lead.type)}
                            disabled={deletingId === lead.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Info sobre Remarketing */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Dicas para Remarketing
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • <strong>Novos Leads:</strong> Ainda não se cadastraram. Envie emails de boas-vindas e benefícios.
                </li>
                <li>
                  • <strong>Cadastrados:</strong> Criaram conta mas não iniciaram checkout. Ofereça desconto ou benefício extra.
                </li>
                <li>
                  • <strong>Checkout Iniciado:</strong> Alta intenção de compra! Envie lembrete com urgência.
                </li>
                <li>
                  • <strong>Pagamento Pendente:</strong> Aguardando confirmação. Acompanhe de perto!
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
