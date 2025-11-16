
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users,
  ArrowLeft,
  Plus,
  Trash2,
  Mail,
  Shield,
  UserCheck,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ProtectedLayout } from "@/components/protected-layout";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
  addedDate: string;
}

export default function TeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "viewer",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadTeamMembers();
    }
  }, [status, router]);

  const loadTeamMembers = () => {
    // Simulação de membros da equipe
    const mockTeam: TeamMember[] = [
      {
        id: "1",
        name: session?.user?.name || "Você",
        email: session?.user?.email || "",
        role: "admin",
        permissions: ["Leitura", "Escrita", "Excluir", "Gerenciar Equipe"],
        status: "active",
        addedDate: "2024-01-01",
      },
      {
        id: "2",
        name: "João Silva",
        email: "joao@exemplo.com",
        role: "editor",
        permissions: ["Leitura", "Escrita"],
        status: "active",
        addedDate: "2024-02-15",
      },
      {
        id: "3",
        name: "Maria Santos",
        email: "maria@exemplo.com",
        role: "viewer",
        permissions: ["Leitura"],
        status: "pending",
        addedDate: "2024-03-10",
      },
    ];
    setTeamMembers(mockTeam);
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const permissions = 
      formData.role === "admin"
        ? ["Leitura", "Escrita", "Excluir", "Gerenciar Equipe"]
        : formData.role === "editor"
        ? ["Leitura", "Escrita"]
        : ["Leitura"];

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      permissions,
      status: "pending",
      addedDate: new Date().toISOString().split("T")[0],
    };

    setTeamMembers([...teamMembers, newMember]);
    toast.success("Convite enviado com sucesso!");
    setShowForm(false);
    setFormData({
      name: "",
      email: "",
      role: "viewer",
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja remover este membro?")) return;
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
    toast.success("Membro removido com sucesso!");
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

  const activeMembers = teamMembers.filter((m) => m.status === "active").length;
  const pendingMembers = teamMembers.filter((m) => m.status === "pending").length;

  return (
    <ProtectedLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Equipe</h1>
          <p className="text-gray-600 mt-2">Controle de acesso multi-usuário</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Convidar Membro
          </Button>
        </div>

        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">Multi-usuário - Colaboração Segura</p>
                <p>
                  Convide membros da sua equipe e defina permissões específicas.
                  Administradores têm acesso total, editores podem modificar dados, e
                  visualizadores apenas consultam informações.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Membros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{teamMembers.length}</p>
                  <p className="text-xs text-gray-500 mt-1">na equipe</p>
                </div>
                <Users className="h-12 w-12 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Membros Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">{activeMembers}</p>
                  <p className="text-xs text-gray-500 mt-1">com acesso</p>
                </div>
                <UserCheck className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Convites Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-yellow-600">{pendingMembers}</p>
                  <p className="text-xs text-gray-500 mt-1">aguardando</p>
                </div>
                <Mail className="h-12 w-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Convidar Novo Membro</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nível de Acesso</label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                      <SelectItem value="editor">Editor (Leitura e Escrita)</SelectItem>
                      <SelectItem value="viewer">Visualizador (Apenas Leitura)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.role === "admin" && "Pode gerenciar equipe, transações e configurações"}
                    {formData.role === "editor" && "Pode adicionar e editar transações"}
                    {formData.role === "viewer" && "Pode apenas visualizar informações"}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Enviar Convite
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span>Membros da Equipe</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className={`p-4 rounded-lg border-2 ${
                    member.status === "active"
                      ? "bg-white border-gray-200"
                      : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-lg">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          {member.status === "pending" && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                              Pendente
                            </span>
                          )}
                          {member.role === "admin" && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.permissions.map((perm, index) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    {member.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(member.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Permissões por Nível de Acesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Administrador</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Visualizar todas as informações financeiras</li>
                  <li>✓ Adicionar, editar e excluir transações</li>
                  <li>✓ Gerenciar membros da equipe</li>
                  <li>✓ Configurar integrações e preferências</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Editor</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Visualizar todas as informações financeiras</li>
                  <li>✓ Adicionar e editar transações</li>
                  <li>✗ Excluir transações</li>
                  <li>✗ Gerenciar equipe</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Visualizador</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Visualizar informações financeiras</li>
                  <li>✓ Gerar relatórios</li>
                  <li>✗ Adicionar ou modificar dados</li>
                  <li>✗ Gerenciar equipe</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
    </ProtectedLayout>
  );
}
