
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  List,
  Settings,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Infinity,
} from "lucide-react";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  features: string[];
  order: number;
  isActive: boolean;
}

interface PlanFeature {
  id?: string;
  featureKey: string;
  featureName: string;
  limit: number;
  enabled: boolean;
}

// Definição das funcionalidades disponíveis no sistema
const AVAILABLE_FEATURES = [
  {
    key: "transactions_monthly",
    name: "Transações por Mês",
    description: "Número máximo de transações que podem ser criadas por mês",
  },
  {
    key: "team_members",
    name: "Membros da Equipe",
    description: "Número máximo de usuários que podem acessar a conta",
  },
  {
    key: "dre_reports_monthly",
    name: "Relatórios DRE por Mês",
    description: "Número máximo de relatórios DRE que podem ser gerados por mês",
  },
  {
    key: "attachments_per_transaction",
    name: "Anexos por Transação",
    description: "Número máximo de arquivos que podem ser anexados por transação",
  },
  {
    key: "export_csv",
    name: "Exportação de Dados (CSV)",
    description: "Permite exportar dados financeiros em formato CSV",
  },
  {
    key: "export_pdf",
    name: "Exportação de Dados (PDF)",
    description: "Permite exportar relatórios em formato PDF",
  },
  {
    key: "prolabore_calculator",
    name: "Calculadora de Pró-labore",
    description: "Acesso à calculadora de pró-labore com recomendações fiscais",
  },
  {
    key: "compliance_alerts",
    name: "Alertas de Compliance",
    description: "Notificações automáticas sobre obrigações fiscais",
  },
  {
    key: "investment_tracking",
    name: "Controle de Investimentos",
    description: "Gestão separada de investimentos CPF e CNPJ",
  },
  {
    key: "custom_categories",
    name: "Categorias Personalizadas no DRE",
    description: "Permite criar categorias personalizadas no plano de contas do DRE",
  },
  {
    key: "priority_support",
    name: "Suporte Prioritário",
    description: "Atendimento com prioridade por email",
  },
];

export default function AdminPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showFeatureManager, setShowFeatureManager] = useState(false);
  const [selectedPlanForFeatures, setSelectedPlanForFeatures] = useState<Plan | null>(null);
  const [planFeatures, setPlanFeatures] = useState<PlanFeature[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    price: "",
    features: "",
    order: "",
    isActive: true,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.user?.role !== "admin" && session?.user?.role !== "superadmin") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchPlans();
    }
  }, [session]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/plans");
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      toast.error("Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanFeatures = async (planId: string) => {
    setLoadingFeatures(true);
    try {
      const response = await fetch(`/api/admin/plan-features?planId=${planId}`);
      const data: PlanFeature[] = await response.json();
      
      // Criar um mapa com as funcionalidades existentes
      const existingFeatures = new Map<string, PlanFeature>(
        data.map((f) => [f.featureKey, f])
      );
      
      // Criar array completo com todas as funcionalidades disponíveis
      const allFeatures: PlanFeature[] = [];
      
      for (const af of AVAILABLE_FEATURES) {
        const existing = existingFeatures.get(af.key);
        if (existing) {
          allFeatures.push(existing);
        } else {
          allFeatures.push({
            featureKey: af.key,
            featureName: af.name,
            limit: 0,
            enabled: false,
          });
        }
      }
      
      setPlanFeatures(allFeatures);
    } catch (error) {
      toast.error("Erro ao carregar funcionalidades");
    } finally {
      setLoadingFeatures(false);
    }
  };

  const savePlanFeatures = async () => {
    if (!selectedPlanForFeatures) return;

    try {
      const response = await fetch("/api/admin/plan-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlanForFeatures.id,
          features: planFeatures,
        }),
      });

      if (response.ok) {
        toast.success("Funcionalidades atualizadas com sucesso!");
        setShowFeatureManager(false);
      } else {
        toast.error("Erro ao salvar funcionalidades");
      }
    } catch (error) {
      toast.error("Erro ao salvar funcionalidades");
    }
  };

  const handleCreatePlan = () => {
    setIsCreating(true);
    setEditingPlan(null);
    setFormData({
      name: "",
      slug: "",
      price: "",
      features: "",
      order: "",
      isActive: true,
    });
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setIsCreating(false);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      price: plan.price.toString(),
      features: plan.features.join("\n"),
      order: plan.order.toString(),
      isActive: plan.isActive,
    });
  };

  const handleManageFeatures = async (plan: Plan) => {
    setSelectedPlanForFeatures(plan);
    setShowFeatureManager(true);
    await fetchPlanFeatures(plan.id);
  };

  const handleSavePlan = async () => {
    try {
      const featuresArray = formData.features
        .split("\n")
        .filter((f) => f.trim())
        .map((f) => f.trim());

      const planData = {
        name: formData.name,
        slug: formData.slug,
        price: parseFloat(formData.price),
        features: featuresArray,
        order: parseInt(formData.order) || 0,
        isActive: formData.isActive,
      };

      const url = editingPlan
        ? `/api/admin/plans/${editingPlan.id}`
        : "/api/admin/plans";
      const method = editingPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
      });

      if (response.ok) {
        toast.success(
          editingPlan ? "Plano atualizado!" : "Plano criado com sucesso!"
        );
        setEditingPlan(null);
        setIsCreating(false);
        fetchPlans();
      } else {
        toast.error("Erro ao salvar plano");
      }
    } catch (error) {
      toast.error("Erro ao salvar plano");
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) return;

    try {
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Plano excluído com sucesso!");
        fetchPlans();
      } else {
        toast.error("Erro ao excluir plano");
      }
    } catch (error) {
      toast.error("Erro ao excluir plano");
    }
  };

  const updateFeatureLimit = (featureKey: string, limit: number) => {
    setPlanFeatures(prev =>
      prev.map(f =>
        f.featureKey === featureKey ? { ...f, limit } : f
      )
    );
  };

  const toggleFeatureEnabled = (featureKey: string) => {
    setPlanFeatures(prev =>
      prev.map(f =>
        f.featureKey === featureKey ? { ...f, enabled: !f.enabled } : f
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Modal de gerenciamento de funcionalidades
  if (showFeatureManager && selectedPlanForFeatures) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowFeatureManager(false)}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Settings className="w-8 h-8 text-blue-600" />
                  Gerenciar Funcionalidades
                </h1>
                <p className="text-gray-600 mt-1">
                  Plano: <span className="font-semibold">{selectedPlanForFeatures.name}</span> 
                  {" "}(R$ {selectedPlanForFeatures.price.toFixed(2)})
                </p>
              </div>
            </div>
            <Button onClick={savePlanFeatures} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Funcionalidades
            </Button>
          </div>

          {loadingFeatures ? (
            <Card className="p-8 text-center">
              <p className="text-gray-600">Carregando funcionalidades...</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {AVAILABLE_FEATURES.map((feature) => {
                const planFeature = planFeatures.find(
                  (pf) => pf.featureKey === feature.key
                );
                
                return (
                  <Card key={feature.key} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {feature.name}
                        </h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`limit-${feature.key}`} className="text-sm">
                            Limite
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id={`limit-${feature.key}`}
                              type="number"
                              min="-1"
                              value={planFeature?.limit ?? 0}
                              onChange={(e) =>
                                updateFeatureLimit(
                                  feature.key,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-24"
                            />
                            {planFeature?.limit === -1 && (
                              <Infinity className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            -1 = Ilimitado | 0 = Desabilitado
                          </p>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Label className="text-sm">Status</Label>
                          <Button
                            onClick={() => toggleFeatureEnabled(feature.key)}
                            variant={planFeature?.enabled ? "default" : "outline"}
                            size="sm"
                            className={
                              planFeature?.enabled
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }
                          >
                            {planFeature?.enabled ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Ativado
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-2" />
                                Desativado
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Dicas:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>-1</strong> = Ilimitado (sem restrições)</li>
              <li>• <strong>0</strong> = Desabilitado (funcionalidade não disponível)</li>
              <li>• <strong>&gt;0</strong> = Limite específico (ex: 50 transações por mês)</li>
              <li>• Use o botão de status para ativar/desativar funcionalidades rapidamente</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Modo de criação/edição de plano
  if (isCreating || editingPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPlan ? "Editar Plano" : "Criar Novo Plano"}
              </h2>
              <Button
                onClick={() => {
                  setIsCreating(false);
                  setEditingPlan(null);
                }}
                variant="ghost"
                size="sm"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Plano *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Básico"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (identificador único) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="Ex: basic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="97.00"
                  />
                </div>

                <div>
                  <Label htmlFor="order">Ordem de Exibição</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="features">Funcionalidades (uma por linha)</Label>
                <textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                  placeholder="Separação completa entre CPF e CNPJ&#10;Controle de receitas e despesas&#10;Relatórios financeiros mensais"
                  className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Estas funcionalidades aparecerão na landing page como texto descritivo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Plano Ativo (visível na landing page)
                </Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSavePlan}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingPlan(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Lista de planos
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Admin
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              Gerenciar Planos
            </h1>
          </div>
          <Button
            onClick={handleCreatePlan}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Novo Plano
          </Button>
        </div>

        {plans.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum plano cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece criando seu primeiro plano de assinatura.
            </p>
            <Button onClick={handleCreatePlan} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Plano
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                      {plan.isActive ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Ativo
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                          Inativo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-lg text-gray-900">
                          R$ {plan.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <List className="w-4 h-4" />
                        <span>Slug: {plan.slug}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>Ordem: {plan.order}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Funcionalidades (Landing Page):
                      </h4>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <Button
                      onClick={() => handleManageFeatures(plan)}
                      className="bg-purple-600 hover:bg-purple-700"
                      size="sm"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Gerenciar Limites
                    </Button>
                    <Button
                      onClick={() => handleEditPlan(plan)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDeletePlan(plan.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
