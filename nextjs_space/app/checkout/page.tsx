"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Check,
  ArrowLeft,
  CreditCard,
  User
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
  const [gateway, setGateway] = useState<string>("efi"); // Default para primeiro gateway ativo
  const [activeGateways, setActiveGateways] = useState<Array<{name: string; displayName: string}>>([]);

  const planSlug = searchParams.get("plan") || "basic";

  useEffect(() => {
    // Sempre carrega os dados do plano, independente de estar logado
    fetchPlan();
    fetchActiveGateways();
  }, [planSlug]);

  const fetchActiveGateways = async () => {
    try {
      const response = await fetch("/api/gateways/active");
      if (response.ok) {
        const gateways = await response.json();
        setActiveGateways(gateways);
        
        // Definir gateway padrão baseado nos gateways ativos
        if (gateways.length > 0) {
          const firstGateway = gateways[0].name.toLowerCase();
          setGateway(firstGateway as any); // Aceita qualquer gateway ativo
          console.log("✅ [Checkout] Gateway selecionado automaticamente:", firstGateway);
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
    // Se não estiver logado, redirecionar para cadastro
    if (status === "unauthenticated") {
      toast.success("📝 Vamos criar sua conta para continuar!");
      router.push(`/cadastro?plan=${planSlug}&redirect=/checkout?plan=${planSlug}`);
      return;
    }

    if (!plan) {
      toast.error("Plano não selecionado");
      return;
    }

    setLoading(true);
    console.log("🛒 [Checkout] Iniciando pagamento:", { plan: plan.slug, gateway, amount: plan.price });
    
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
      console.log("✅ [Checkout] Resposta da API:", { status: response.status, data });

      if (response.ok && data.url) {
        console.log("🌐 [Checkout] Redirecionando para:", data.url);
        toast.success("🎉 Redirecionando para o pagamento...", { duration: 2000 });
        setTimeout(() => {
          window.location.href = data.url;
        }, 1000);
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
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ [Checkout] Erro:", error);
      toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
      setLoading(false);
    }
  };

  // Mostrar loading apenas se estiver carregando o plano
  if (loadingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando plano...</p>
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
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
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

        {/* Alerta para usuários não logados */}
        {status === "unauthenticated" && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Crie sua conta para continuar
                </h3>
                <p className="text-sm text-blue-700">
                  Você poderá revisar todos os detalhes do plano. Ao clicar em "Finalizar Compra", 
                  será solicitado que você crie uma conta gratuita para processar o pagamento.
                </p>
              </div>
            </div>
          </div>
        )}

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
                <Button
                  onClick={handleCheckout}
                  disabled={loading || activeGateways.length === 0}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white text-lg font-bold py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    "Processando..."
                  ) : activeGateways.length === 0 ? (
                    "Sistema de Pagamento Indisponível"
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Confirmar Compra
                    </>
                  )}
                </Button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Pagamento 100% seguro e protegido</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>PIX, Boleto ou Cartão de Crédito</span>
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