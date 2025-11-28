
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Check, Sparkles, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  features: string[];
  isActive: boolean;
  order: number;
}

interface PlansModalProps {
  show: boolean;
  onClose: () => void;
}

export function PlansModal({ show, onClose }: PlansModalProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (show) {
      fetchPlans();
    }
  }, [show]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans");
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (planSlug: string) => {
    router.push(`/checkout?plan=${planSlug}`);
    onClose();
  };

  const getPlanIcon = (index: number) => {
    const icons = [Zap, Sparkles, Crown];
    const Icon = icons[index] || Sparkles;
    return <Icon className="w-6 h-6" />;
  };

  const getPlanGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-orange-500 to-red-500",
    ];
    return gradients[index] || gradients[1];
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted-soft hover:bg-muted-soft transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="p-8 text-center border-b border-gray-200 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            🎉 Escolha Seu Plano Ideal
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-4">
            Desbloqueie todo o potencial do Clivus e separe suas finanças de forma profissional
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>{plans.length} Planos Disponíveis • Escolha o melhor para você</span>
          </div>
        </div>

        {/* Planos */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border-2 ${
                    index === 1
                      ? "border-purple-500 shadow-lg scale-105"
                      : "border-gray-200"
                  } bg-card overflow-hidden transition-all hover:shadow-xl hover:scale-105 duration-300`}
                >
                  {/* Badge para plano popular */}
                  {index === 1 && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <span className="px-4 py-1 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg">
                        MAIS POPULAR
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Ícone e Nome */}
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-gradient-to-br ${getPlanGradient(
                        index
                      )} text-white`}
                    >
                      {getPlanIcon(index)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>

                    {/* Preço */}
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          R$ {plan.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pagamento único • Acesso vitalício
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features && plan.features.length > 0 ? (
                        plan.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start gap-3">
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${getPlanGradient(
                                index
                              )} flex items-center justify-center mt-0.5`}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-700">
                              {feature}
                            </span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start gap-3">
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${getPlanGradient(
                                index
                              )} flex items-center justify-center mt-0.5`}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-700">
                              Separação CPF/CNPJ
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${getPlanGradient(
                                index
                              )} flex items-center justify-center mt-0.5`}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-700">
                              Gestão de Transações
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${getPlanGradient(
                                index
                              )} flex items-center justify-center mt-0.5`}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-sm text-gray-700">
                              Relatórios DRE
                            </span>
                          </li>
                          {index >= 1 && (
                            <li className="flex items-start gap-3">
                              <div
                                className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${getPlanGradient(
                                  index
                                )} flex items-center justify-center mt-0.5`}
                              >
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-700">
                                Cálculo de Pró-labore
                              </span>
                            </li>
                          )}
                          {index === 2 && (
                            <>
                              <li className="flex items-start gap-3">
                                <div
                                  className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${getPlanGradient(
                                    index
                                  )} flex items-center justify-center mt-0.5`}
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm text-gray-700">
                                  Conciliação Bancária
                                </span>
                              </li>
                              <li className="flex items-start gap-3">
                                <div
                                  className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${getPlanGradient(
                                    index
                                  )} flex items-center justify-center mt-0.5`}
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm text-gray-700">
                                  Suporte Prioritário
                                </span>
                              </li>
                            </>
                          )}
                        </>
                      )}
                    </ul>

                    {/* Botão */}
                    <Button
                      onClick={() => handleSelectPlan(plan.slug)}
                      className={`w-full ${
                        index === 1
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          : `bg-gradient-to-r ${getPlanGradient(
                              index
                            )} hover:opacity-90`
                      } text-white font-semibold py-3 rounded-lg transition-all duration-300`}
                    >
                      Escolher {plan.name}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer com botão de fechar */}
            <div className="mt-8 text-center">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Continuar explorando o sistema →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
