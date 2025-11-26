
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  ArrowLeft,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterSource, setFilterSource] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [deletingMultiple, setDeletingMultiple] = useState(false);

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

    // Filtro por status (múltiplos)
    if (filterStatus.length > 0) {
      result = result.filter((lead) => {
        if (filterStatus.includes("novo") && lead.status === "novo") return true;
        if (filterStatus.includes("registered") && lead.status === "registered") return true;
        if (filterStatus.includes("checkout_started") && lead.lastCheckoutAttempt) return true;
        if (filterStatus.includes("payment_pending") && lead.status === "payment_pending") return true;
        return false;
      });
    }

    // Filtro por origem (múltiplos)
    if (filterSource.length > 0) {
      result = result.filter((lead) => filterSource.includes(lead.source));
    }

    // Filtro por data
    if (startDate) {
      result = result.filter(
        (lead) => new Date(lead.createdAt) >= new Date(startDate)
      );
    }
    if (endDate) {
      result = result.filter(
        (lead) => new Date(lead.createdAt) <= new Date(endDate)
      );
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
  }, [searchTerm, filterStatus, filterSource, startDate, endDate, leads]);

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

  const handleToggleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((lead) => lead.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((leadId) => leadId !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedLeads.length === 0) {
      toast.error("Nenhum lead selecionado");
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir ${selectedLeads.length} lead(s)? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setDeletingMultiple(true);
      
      // Deletar cada lead selecionado
      const deletePromises = selectedLeads.map((id) => {
        const lead = leads.find((l) => l.id === id);
        if (!lead) return Promise.resolve();
        
        return fetch(`/api/admin/leads?id=${id}&type=${lead.type}`, {
          method: "DELETE",
        });
      });

      await Promise.all(deletePromises);

      toast.success(`${selectedLeads.length} lead(s) excluído(s) com sucesso!`);
      setSelectedLeads([]);
      fetchLeads();
    } catch (error) {
      console.error("Erro ao excluir leads:", error);
      toast.error("Erro ao excluir alguns leads");
    } finally {
      setDeletingMultiple(false);
    }
  };

  const handleToggleStatus = (status: string) => {
    setFilterStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleToggleSource = (source: string) => {
    setFilterSource((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const exportToCSV = () => {
    try {
      const headers = ["Nome", "Email", "CPF/CNPJ", "Origem", "Status", "Cadastro", "Último Checkout"];
      const data = filteredLeads.map((lead) => [
        lead.name,
        lead.email,
        lead.cpf || lead.cnpj || "-",
        lead.source === "landing_page" ? "Landing Page" : "Cadastro Completo",
        lead.status,
        new Date(lead.createdAt).toLocaleDateString("pt-BR"),
        lead.lastCheckoutAttempt
          ? new Date(lead.lastCheckoutAttempt).toLocaleDateString("pt-BR")
          : "-",
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...data.map((row) => row.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `leads_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      toast.error("Erro ao exportar CSV");
    }
  };

  const exportToXLSX = () => {
    try {
      const data = filteredLeads.map((lead) => ({
        Nome: lead.name,
        Email: lead.email,
        "CPF/CNPJ": lead.cpf || lead.cnpj || "-",
        Origem: lead.source === "landing_page" ? "Landing Page" : "Cadastro Completo",
        Status: lead.status,
        Cadastro: new Date(lead.createdAt).toLocaleDateString("pt-BR"),
        "Último Checkout": lead.lastCheckoutAttempt
          ? new Date(lead.lastCheckoutAttempt).toLocaleDateString("pt-BR")
          : "-",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads");
      XLSX.writeFile(wb, `leads_${new Date().toISOString().split("T")[0]}.xlsx`);

      toast.success("XLSX exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar XLSX:", error);
      toast.error("Erro ao exportar XLSX");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();

      // Título
      doc.setFontSize(18);
      doc.text("Relatório de Leads & Remarketing", 14, 20);

      // Data
      doc.setFontSize(11);
      doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);

      // Estatísticas
      doc.text(`Total de Leads: ${stats.totalLeads}`, 14, 40);
      doc.text(`Landing Page: ${stats.landingPageLeads}`, 14, 46);
      doc.text(`Cadastrados: ${stats.registeredUsers}`, 14, 52);
      doc.text(`Checkout Iniciado: ${stats.checkoutStarted}`, 14, 58);
      doc.text(`Pagamento Pendente: ${stats.paymentPending}`, 14, 64);

      // Tabela
      const tableData = filteredLeads.map((lead) => [
        lead.name,
        lead.email,
        lead.source === "landing_page" ? "Landing" : "Cadastro",
        lead.status,
        new Date(lead.createdAt).toLocaleDateString("pt-BR"),
      ]);

      autoTable(doc, {
        startY: 75,
        head: [["Nome", "Email", "Origem", "Status", "Cadastro"]],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      doc.save(`leads_${new Date().toISOString().split("T")[0]}.pdf`);

      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  const getStatusBadge = (lead: Lead) => {
    if (lead.status === "novo") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary">
          <UserPlus className="h-3 w-3" />
          Novo Lead
        </span>
      );
    }

    if (lead.status === "registered") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-accent bg-opacity-20 text-accent">
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
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
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
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
        Cadastro Completo
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-theme-muted">Carregando leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-theme mb-2">
              Gestão de Leads & Remarketing
            </h1>
            <p className="text-theme-muted">
              Gerencie leads da landing page e usuários que ainda não completaram o pagamento
            </p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-theme-muted flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total de Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-theme">{stats.totalLeads}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-theme-muted flex items-center gap-2">
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
            <CardTitle className="text-sm font-medium text-theme-muted flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent">{stats.registeredUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-theme-muted flex items-center gap-2">
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
            <CardTitle className="text-sm font-medium text-theme-muted flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pag. Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.paymentPending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Linha 1: Busca e Botões */}
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

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
                
                <div className="flex gap-2 border-l pl-2">
                  <Button
                    variant="outline"
                    onClick={exportToCSV}
                    className="flex items-center gap-2"
                    title="Exportar CSV"
                  >
                    <FileText className="h-4 w-4" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportToXLSX}
                    className="flex items-center gap-2"
                    title="Exportar XLSX"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    XLSX
                  </Button>
                  <Button
                    variant="outline"
                    onClick={exportToPDF}
                    className="flex items-center gap-2"
                    title="Exportar PDF"
                  >
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Filtros Avançados (Expansível) */}
            {showFilters && (
              <div className="pt-4 border-t space-y-4">
                {/* Filtros por Data */}
                <div>
                  <Label className="text-sm font-medium text-theme mb-2 block">
                    Período de Cadastro
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-xs text-theme-muted">
                        Data Início
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-xs text-theme-muted">
                        Data Fim
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Filtros por Origem */}
                <div>
                  <Label className="text-sm font-medium text-theme mb-2 block">
                    Origem
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="source-landing"
                        checked={filterSource.includes("landing_page")}
                        onCheckedChange={() => handleToggleSource("landing_page")}
                      />
                      <Label
                        htmlFor="source-landing"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Landing Page
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="source-cadastro"
                        checked={filterSource.includes("cadastro")}
                        onCheckedChange={() => handleToggleSource("cadastro")}
                      />
                      <Label
                        htmlFor="source-cadastro"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Cadastro Completo
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Filtros por Status */}
                <div>
                  <Label className="text-sm font-medium text-theme mb-2 block">
                    Status
                  </Label>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-novo"
                        checked={filterStatus.includes("novo")}
                        onCheckedChange={() => handleToggleStatus("novo")}
                      />
                      <Label
                        htmlFor="status-novo"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Novos Leads
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-registered"
                        checked={filterStatus.includes("registered")}
                        onCheckedChange={() => handleToggleStatus("registered")}
                      />
                      <Label
                        htmlFor="status-registered"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Cadastrados
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-checkout"
                        checked={filterStatus.includes("checkout_started")}
                        onCheckedChange={() => handleToggleStatus("checkout_started")}
                      />
                      <Label
                        htmlFor="status-checkout"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Checkout Iniciado
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="status-pending"
                        checked={filterStatus.includes("payment_pending")}
                        onCheckedChange={() => handleToggleStatus("payment_pending")}
                      />
                      <Label
                        htmlFor="status-pending"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Pagamento Pendente
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Botão Limpar Filtros */}
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFilterStatus([]);
                      setFilterSource([]);
                      setStartDate("");
                      setEndDate("");
                      setSearchTerm("");
                    }}
                    className="text-sm"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Leads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Lista de Leads ({filteredLeads.length})
              {selectedLeads.length > 0 && (
                <span className="ml-2 text-sm font-normal text-primary">
                  ({selectedLeads.length} selecionado{selectedLeads.length > 1 ? 's' : ''})
                </span>
              )}
            </CardTitle>
            {selectedLeads.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={deletingMultiple}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deletingMultiple ? "Excluindo..." : `Excluir ${selectedLeads.length} lead(s)`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-theme">
                  <th className="text-left py-3 px-4 font-medium text-theme-muted w-12">
                    <Checkbox
                      checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                      onCheckedChange={handleToggleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-theme-muted">Lead</th>
                  <th className="text-left py-3 px-4 font-medium text-theme-muted">Origem</th>
                  <th className="text-left py-3 px-4 font-medium text-theme-muted">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-theme-muted">Cadastro</th>
                  <th className="text-left py-3 px-4 font-medium text-theme-muted">Último Checkout</th>
                  <th className="text-right py-3 px-4 font-medium text-theme-muted">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-theme-muted">
                      Nenhum lead encontrado
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-muted-soft">
                      <td className="py-4 px-4">
                        <Checkbox
                          checked={selectedLeads.includes(lead.id)}
                          onCheckedChange={() => handleToggleSelect(lead.id)}
                          aria-label={`Selecionar ${lead.name}`}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-theme">{lead.name}</p>
                          <p className="text-sm text-theme-muted">{lead.email}</p>
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
                        <div className="flex items-center gap-1 text-sm text-theme-muted">
                          <Calendar className="h-3 w-3" />
                          {new Date(lead.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {lead.lastCheckoutAttempt ? (
                          <div className="flex items-center gap-1 text-sm text-theme-muted">
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
      <Card className="mt-6 bg-primary bg-opacity-5 border-primary border-opacity-30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                💡 Dicas para Remarketing
              </h3>
              <ul className="text-sm text-primary space-y-1">
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
