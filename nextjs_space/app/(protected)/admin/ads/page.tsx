

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Textarea 
} from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  TrendingUp,
  MousePointer,
  Calendar,
  Target,
} from "lucide-react";

interface Advertisement {
  id: string;
  title: string;
  type: string;
  adsenseCode?: string;
  bannerUrl?: string;
  linkUrl?: string;
  position: string;
  pages: string[];
  targetPlans: string[];
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  impressions: number;
  clicks: number;
  createdAt: string;
}

export default function AdsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    type: "banner",
    adsenseCode: "",
    bannerUrl: "",
    linkUrl: "",
    position: "top",
    pages: ["all"] as string[],
    targetPlans: ["all"] as string[],
    priority: 0,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const userRole = (session?.user as any)?.role;
      if (userRole !== "superadmin") {
        router.push("/dashboard");
      } else {
        fetchAds();
      }
    }
  }, [status, router, session]);

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/admin/ads");
      if (response.ok) {
        const data = await response.json();
        setAds(data.ads || []);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast.error("Erro ao carregar anúncios");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingAd
        ? `/api/admin/ads/${editingAd.id}`
        : "/api/admin/ads";

      const method = editingAd ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingAd ? "Anúncio atualizado!" : "Anúncio criado!"
        );
        setShowForm(false);
        setEditingAd(null);
        resetForm();
        fetchAds();
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao salvar anúncio");
      }
    } catch (error) {
      console.error("Error saving ad:", error);
      toast.error("Erro ao salvar anúncio");
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      type: ad.type,
      adsenseCode: ad.adsenseCode || "",
      bannerUrl: ad.bannerUrl || "",
      linkUrl: ad.linkUrl || "",
      position: ad.position,
      pages: ad.pages,
      targetPlans: ad.targetPlans,
      priority: ad.priority,
      startDate: ad.startDate ? ad.startDate.split("T")[0] : "",
      endDate: ad.endDate ? ad.endDate.split("T")[0] : "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este anúncio?")) return;

    try {
      const response = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Anúncio deletado!");
        fetchAds();
      } else {
        toast.error("Erro ao deletar anúncio");
      }
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error("Erro ao deletar anúncio");
    }
  };

  const toggleActive = async (ad: Advertisement) => {
    try {
      const response = await fetch(`/api/admin/ads/${ad.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ad, isActive: !ad.isActive }),
      });

      if (response.ok) {
        toast.success(
          ad.isActive ? "Anúncio desativado!" : "Anúncio ativado!"
        );
        fetchAds();
      }
    } catch (error) {
      console.error("Error toggling ad:", error);
      toast.error("Erro ao alterar status");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "banner",
      adsenseCode: "",
      bannerUrl: "",
      linkUrl: "",
      position: "top",
      pages: ["all"],
      targetPlans: ["all"],
      priority: 0,
      startDate: "",
      endDate: "",
    });
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Estatísticas gerais
  const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="min-h-screen bg-muted-soft p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-theme">
                Gerenciamento de Anúncios
              </h1>
              <p className="text-theme-muted mt-1">
                Configure e monitore seus anúncios (AdSense + Banners Próprios)
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingAd(null);
              resetForm();
            }}
            className="bg-gradient-to-r from-primary to-accent"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Anúncio
          </Button>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-theme-muted">
                Total de Anúncios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-theme">{ads.length}</div>
              <div className="text-xs text-theme-muted mt-1">
                {ads.filter((a) => a.isActive).length} ativos
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-theme-muted flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Impressões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {totalImpressions.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-theme-muted flex items-center gap-2">
                <MousePointer className="h-4 w-4" />
                Cliques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalClicks.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-theme-muted flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                CTR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {ctr.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingAd ? "Editar Anúncio" : "Criar Novo Anúncio"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título (Interno)
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de Anúncio
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">Banner Próprio</SelectItem>
                      <SelectItem value="adsense">Google AdSense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === "adsense" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Código do AdSense
                    </label>
                    <Textarea
                      value={formData.adsenseCode}
                      onChange={(e) =>
                        setFormData({ ...formData, adsenseCode: e.target.value })
                      }
                      rows={4}
                      placeholder="Cole o código do AdSense aqui..."
                      required
                    />
                  </div>
                )}

                {formData.type === "banner" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        URL da Imagem do Banner
                      </label>
                      <Input
                        value={formData.bannerUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, bannerUrl: e.target.value })
                        }
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Link de Destino
                      </label>
                      <Input
                        value={formData.linkUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, linkUrl: e.target.value })
                        }
                        placeholder="https://..."
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Posição
                  </label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) =>
                      setFormData({ ...formData, position: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Topo da Página</SelectItem>
                      <SelectItem value="sidebar">Barra Lateral</SelectItem>
                      <SelectItem value="between_content">
                        Entre Conteúdo
                      </SelectItem>
                      <SelectItem value="footer">Rodapé</SelectItem>
                      <SelectItem value="modal">Modal/Pop-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Prioridade (0-100)
                    </label>
                    <Input
                      type="number"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Páginas
                    </label>
                    <Select
                      value={formData.pages[0]}
                      onValueChange={(value) =>
                        setFormData({ ...formData, pages: [value] })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Páginas</SelectItem>
                        <SelectItem value="dashboard">Dashboard</SelectItem>
                        <SelectItem value="transactions">Transações</SelectItem>
                        <SelectItem value="reports">Relatórios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Data de Início (Opcional)
                    </label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Data de Término (Opcional)
                    </label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-primary">
                    {editingAd ? "Atualizar" : "Criar"} Anúncio
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAd(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Anúncios */}
        <Card>
          <CardHeader>
            <CardTitle>Anúncios Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {ads.length === 0 ? (
              <div className="text-center py-12 text-theme-muted">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum anúncio cadastrado ainda.</p>
                <p className="text-sm mt-2">
                  Clique em "Novo Anúncio" para começar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ads.map((ad) => (
                  <div
                    key={ad.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{ad.title}</h3>
                          <span
                            className={`
                              px-2 py-1 rounded text-xs font-medium
                              ${
                                ad.type === "adsense"
                                  ? "bg-primary bg-opacity-10 text-primary"
                                  : "bg-purple-100 text-purple-700"
                              }
                            `}
                          >
                            {ad.type === "adsense" ? "AdSense" : "Banner"}
                          </span>
                          <span
                            className={`
                              px-2 py-1 rounded text-xs font-medium
                              ${
                                ad.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-muted-soft text-theme-muted"
                              }
                            `}
                          >
                            {ad.isActive ? "Ativo" : "Inativo"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm text-theme-muted">
                          <div>
                            <span className="font-medium">Posição:</span>{" "}
                            {ad.position}
                          </div>
                          <div>
                            <span className="font-medium">Páginas:</span>{" "}
                            {ad.pages.join(", ")}
                          </div>
                          <div>
                            <span className="font-medium">Impressões:</span>{" "}
                            {ad.impressions.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Cliques:</span>{" "}
                            {ad.clicks.toLocaleString()}
                          </div>
                        </div>

                        {ad.type === "banner" && ad.bannerUrl && (
                          <div className="mt-3">
                            <span className="text-sm text-theme-muted">
                              Banner: {ad.bannerUrl}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(ad)}
                        >
                          {ad.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(ad)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(ad.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
