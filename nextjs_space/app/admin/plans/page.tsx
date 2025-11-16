
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export default function AdminPlansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
    } else if (status === "authenticated") {
      fetchPlans();
    }
  }, [status, router]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/plans");
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      } else {
        toast.error("Erro ao carregar planos");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Erro ao carregar planos");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      price: plan.price.toString(),
      features: plan.features.join("\n"),
      order: plan.order.toString(),
      isActive: plan.isActive,
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: "",
      slug: "",
      price: "",
      features: "",
      order: "0",
      isActive: true,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setIsCreating(false);
    setFormData({
      name: "",
      slug: "",
      price: "",
      features: "",
      order: "0",
      isActive: true,
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.slug || !formData.price) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      const featuresArray = formData.features
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        name: formData.name,
        slug: formData.slug,
        price: parseFloat(formData.price),
        features: featuresArray,
        order: parseInt(formData.order) || 0,
        isActive: formData.isActive,
      };

      let response;
      if (isCreating) {
        response = await fetch("/api/admin/plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else if (editingPlan) {
        response = await fetch(`/api/admin/plans/${editingPlan.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (response && response.ok) {
        toast.success(
          isCreating ? "Plano criado com sucesso!" : "Plano atualizado com sucesso!"
        );
        fetchPlans();
        handleCancel();
      } else {
        const data = await response?.json();
        toast.error(data?.error || "Erro ao salvar plano");
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error("Erro ao salvar plano");
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) {
      return;
    }

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
      console.error("Error deleting plan:", error);
      toast.error("Erro ao excluir plano");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package className="h-8 w-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Gerenciar Planos
              </h1>
            </div>
            <Button
              onClick={() => router.push("/admin")}
              variant="outline"
            >
              Voltar ao Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Button onClick={handleCreate} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Criar Novo Plano
          </Button>
        </div>

        {(isCreating || editingPlan) && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isCreating ? "Criar Novo Plano" : "Editar Plano"}
              </h2>
              <Button onClick={handleCancel} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Nome do Plano *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Básico, Intermediário, Avançado"
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
                  placeholder="Ex: basic, intermediate, advanced"
                />
              </div>

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
                  placeholder="Ex: 97.00"
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

              <div className="md:col-span-2">
                <Label htmlFor="features">Funcionalidades (uma por linha)</Label>
                <textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                  className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Digite cada funcionalidade em uma linha separada..."
                />
              </div>

              <div className="md:col-span-2 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Plano Ativo (visível na landing page)
                </Label>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button onClick={handleCancel} variant="outline">
                Cancelar
              </Button>
            </div>
          </Card>
        )}

        <div className="grid gap-6">
          {plans.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum plano cadastrado ainda.</p>
              <p className="text-gray-500 text-sm mt-2">
                Clique em "Criar Novo Plano" para começar.
              </p>
            </Card>
          ) : (
            plans.map((plan) => (
              <Card key={plan.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                      {!plan.isActive && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                          Inativo
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-gray-600 text-sm mb-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">R$ {plan.price}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <List className="h-4 w-4" />
                        <span>Slug: {plan.slug}</span>
                      </div>
                      <span>Ordem: {plan.order}</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">
                        Funcionalidades:
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-start space-x-2"
                          >
                            <span className="text-green-600 mt-1">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleEdit(plan)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(plan.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
