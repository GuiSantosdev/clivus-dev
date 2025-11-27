"use client";

import { Check, Star, Shield, Zap, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  features: string[];
  order: number;
  isActive: boolean;
}

export function OfferSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Zap className="h-8 w-8" />;
      case 1:
        return <Star className="h-8 w-8" />;
      case 2:
        return <Crown className="h-8 w-8" />;
      default:
        return <Sparkles className="h-8 w-8" />;
    }
  };

  const getPlanColor = (index: number) => {
    switch (index) {
      case 0:
        return {
          gradient: "from-blue-500 to-blue-700",
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
          button: "bg-blue-600 hover:bg-blue-700",
        };
      case 1:
        return {
          gradient: "from-green-500 to-green-700",
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          button: "bg-green-600 hover:bg-green-700",
        };
      case 2:
        return {
          gradient: "from-purple-500 to-purple-700",
          bg: "bg-purple-50",
          border: "border-purple-200",
          text: "text-purple-700",
          button: "bg-purple-600 hover:bg-purple-700",
        };
      default:
        return {
          gradient: "from-gray-500 to-gray-700",
          bg: "bg-muted-soft",
          border: "border-gray-200",
          text: "text-gray-700",
          button: "bg-gray-600 hover:bg-gray-700",
        };
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">Carregando planos...</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="oferta" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Escolha o Plano Ideal Para o{" "}
            <span className="text-green-600">Seu Negócio</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            <span className="font-bold">Pagamento único</span> • Sem mensalidades •{" "}
            <span className="font-bold text-green-600">Acesso imediato</span>
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const colors = getPlanColor(index);
            const isPopular = index === 1; // Plano do meio é o mais popular

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="relative"
              >
                {isPopular && (
                  <div className="absolute -top-5 left-0 right-0 flex justify-center z-10">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      🔥 MAIS POPULAR
                    </div>
                  </div>
                )}

                <div
                  className={`bg-card rounded-2xl shadow-xl p-8 border-2 ${
                    isPopular ? "border-green-400 scale-105" : colors.border
                  } h-full flex flex-col transition-transform hover:scale-105 duration-300`}
                >
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-4 rounded-full ${colors.bg} mb-4`}>
                      <div className={colors.text}>{getPlanIcon(index)}</div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      R$ {plan.price}
                    </div>
                    <p className="text-gray-600 text-sm">
                      Pagamento único • Sem mensalidades
                    </p>
                  </div>

                  <div className="space-y-3 mb-8 flex-grow">
                    {plan.features?.map?.((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    )) ?? []}
                  </div>

                  <Link href={`/checkout?plan=${plan.slug}`} className="block">
                    <Button
                      className={`w-full ${colors.button} text-white text-lg font-bold py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      Escolher {plan.name}
                    </Button>
                  </Link>

                  <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Shield className="h-3 w-3" />
                      <span>Compra Segura</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>Garantia 30 Dias</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center"
        >
          <h4 className="text-2xl font-bold text-gray-900 mb-4">
            🛡️ Garantia Total de 30 Dias
          </h4>
          <p className="text-gray-700 text-lg mb-4">
            Teste o Clivus por 30 dias completos. Se não ficar 100% satisfeito, 
            devolvemos seu dinheiro sem fazer perguntas.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600 mt-6">
            <div>💳 Parcelamos no cartão</div>
            <div>🔒 Pagamento 100% seguro</div>
            <div>✅ Acesso imediato</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-10 text-white shadow-2xl"
        >
          <h3 className="text-3xl font-bold mb-4">
            ⚠️ Não Espere a Receita Federal Bater na Sua Porta
          </h3>
          <p className="text-xl mb-4 opacity-95">
            Cada dia com CPF e CNPJ misturados{" "}
            <span className="font-bold">aumenta seu risco fiscal</span> e{" "}
            <span className="font-bold">impede seu crescimento</span>.
          </p>
          <p className="text-2xl font-bold">
            Regularize seu negócio AGORA e durma tranquilo.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
