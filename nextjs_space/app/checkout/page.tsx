"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Check,
  ArrowLeft,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  features: string[];
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [gateway, setGateway] = useState<"asaas" | "stripe">("asaas"); // Default para Asaas
  const [activeGateways, setActiveGateways] = useState<Array<{name: string; displayName: string}>>([]);

  const planSlug = searchParams.get("plan") || "basic";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchPlan();
      fetchActiveGateways();
    }
  }, [status, router, planSlug]);

  const fetchActiveGateways = async () => {
    try {
      const response = await fetch("/api/gateways/active");
      if (response.ok) {
        const gateways = await response.json();
        setActiveGateways(gateways);
        
        // Definir gateway padrão baseado nos gateways ativos
        if (gateways.length > 0) {
          const firstGateway = gateways[0].name.toLowerCase();
          if (firstGateway === "asaas" || firstGateway === "stripe") {
            setGateway(firstGateway as "asaas" | "stripe");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching active gateways:", error);
    }
  };

  const fetchPlan = async () => {
    try {
      const response = await fetch("/api/plans");
      if (response.ok) {
        const plans: Plan[] = await response.json();
        const selectedPlan = plans.find((p) => p.slug === planSlug);
        
        if (selectedPlan) {
          setPlan(selectedPlan);
        } else if (plans.length > 0) {
          // Se não encontrar o plano pelo slug, pega o primeiro
          setPlan(plans[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
      toast.error("Erro ao carregar plano");
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleCheckout = async () => {
    if (!plan) {
      toast.error("Plano não selecionado");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: plan.slug,
          gateway: gateway,
          amount: plan.price,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        // Mensagens de erro específicas
        if (response.status === 503) {
          toast.error(
            "⚠️ Sistema de pagamento ainda não configurado. Entre em contato com o suporte.",
            { duration: 6000 }
          );
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erro ao processar pagamento. Tente novamente.");
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
      setLoading(false);
    }
  };

  if (status === "loading" || loadingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Plano não encontrado</p>
          <Link href="/">
            <Button>Voltar para a home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <Image
            src="/logo-clivus.png"
            alt="Clivus"
            width={180}
            height={77}
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Plano {plan.name}
          </h1>
          <p className="text-lg text-gray-600">
            Organize suas finanças pessoais e empresariais de forma profissional
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <CardTitle className="text-2xl">O que está incluído</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-3">
                {plan.features?.map?.((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                )) ?? []}
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-xl border-blue-200">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-2">Pagamento Único</CardTitle>
                <div className="flex items-center justify-center">
                  <span className="text-5xl font-bold text-blue-600">
                    R$ {plan.price}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Acesso vitalício • Sem mensalidades
                </p>
              </CardHeader>
              <CardContent className="p-6">
                {/* Seleção de Gateway de Pagamento */}
                {activeGateways.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Escolha a forma de pagamento:
                    </label>
                    <div className={activeGateways.length === 1 ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
                      {activeGateways.map((gw) => {
                        const isAsaas = gw.name.toLowerCase() === "asaas";
                        const isStripe = gw.name.toLowerCase() === "stripe";
                        const gwName = gw.name.toLowerCase() as "asaas" | "stripe";
                        
                        if (!isAsaas && !isStripe) return null;
                        
                        return (
                          <button
                            key={gw.name}
                            onClick={() => setGateway(gwName)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                              gateway === gwName
                                ? isAsaas 
                                  ? "border-blue-600 bg-blue-50 shadow-md"
                                  : "border-purple-600 bg-purple-50 shadow-md"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <div className="flex flex-col items-center">
                              <div className={`text-2xl font-bold mb-1 ${
                                isAsaas ? "text-blue-600" : "text-purple-600"
                              }`}>
                                {gw.displayName}
                              </div>
                              <div className="text-xs text-gray-600">
                                {isAsaas ? "PIX • Boleto • Cartão" : "Cartão de Crédito"}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeGateways.length === 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Nenhum gateway de pagamento está configurado no momento. Entre em contato com o suporte.
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-lg font-bold py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {loading ? (
                    "Processando..."
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Comprar Agora
                    </>
                  )}
                </Button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Pagamento 100% seguro via {gateway === "asaas" ? "Asaas" : "Stripe"}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Acesso imediato após aprovação</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Garantia de 7 dias</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <p className="text-center text-sm text-gray-700">
                  <strong>🔥 Oferta Especial:</strong> Este preço promocional pode acabar a qualquer momento. 
                  Garanta seu acesso vitalício agora antes que os preços aumentem!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            Ao clicar em "Comprar Agora", você concorda com nossos{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="#" className="text-blue-600 hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
