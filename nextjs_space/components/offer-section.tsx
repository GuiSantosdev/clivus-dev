
"use client";

import { Check, Star, Clock, Shield, Gift, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function OfferSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = () => {
    setIsLoading(true);
    // Aqui você integraria com o sistema de pagamento (Stripe, PagSeguro, etc.)
    setTimeout(() => {
      alert('Redirecionando para o pagamento...');
      setIsLoading(false);
    }, 2000);
  };

  const includes = [
    "✅ 100% conforme a legislação brasileira",
    "✅ 100% online - Acesse do computador ou celular",
    "✅ Proteção total contra problemas fiscais",
    "✅ Separa PF e PJ automaticamente",
    "✅ Dashboard executivo personalizado",
    "✅ Relatórios automáticos ilimitados",
    "✅ Calculadora de pró-labore legal",
    "✅ Acesso vitalício à plataforma",
    "✅ Funciona para qualquer tamanho de empresa",
    "✅ Atualizações gratuitas por 2 anos",
    "✅ Garantia incondicional de 30 dias"
  ];

  const bonuses = [
    {
      title: "E-book: Guia Completo do Planejamento Fiscal",
      value: "R$ 47,00",
      description: "Estratégias para reduzir impostos legalmente"
    },
    {
      title: "Planilha Avançada de Controle Financeiro",
      value: "R$ 37,00",
      description: "Para usar antes de implementar o sistema"
    },
    {
      title: "1 Mês de Consultoria Gratuita",
      value: "R$ 297,00",
      description: "Suporte personalizado para configuração"
    }
  ];

  return (
    <section ref={ref} id="oferta" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Regularize Seu Negócio{" "}
            <span className="text-green-600">Agora por R$ 97</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            <span className="font-bold">Pagamento único</span> • Sem mensalidades •{" "}
            <span className="font-bold text-green-600">Acesso imediato</span>
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-green-200">
              <div className="text-center mb-8">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full inline-block text-sm font-semibold mb-4">
                  🔥 OFERTA LIMITADA
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Clivus Completo
                </h3>
                
                <div className="mb-6">
                  <div className="text-gray-500 line-through text-xl mb-2">
                    De R$ 297,00 por
                  </div>
                  <div className="text-5xl font-bold text-green-600 mb-2">
                    R$ 97
                  </div>
                  <div className="text-gray-600">
                    Pagamento único • Sem mensalidades
                  </div>
                </div>

                <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    <span className="text-red-600 font-bold">
                      Última chance: Oferta expira em breve!
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-2 text-center">
                    Valor promocional válido apenas para os primeiros compradores
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {includes?.map?.((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                )) ?? []}
              </div>

              <Button
                onClick={handlePurchase}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-6 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-pulse"
              >
                {isLoading ? (
                  "Processando..."
                ) : (
                  <>
                    SIM! Quero Regularizar por R$ 97
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-gray-600 mt-3 font-medium">
                🚀 Acesso liberado em menos de 2 minutos
              </p>

              <div className="flex items-center justify-center space-x-4 mt-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Compra Segura</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>30 Dias de Garantia</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
              <h4 className="text-xl font-bold mb-4 flex items-center">
                <Gift className="mr-2" />
                Bônus Exclusivos (Valor: R$ 381)
              </h4>
              
              <div className="space-y-4">
                {bonuses?.map?.((bonus, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-semibold text-sm">{bonus?.title}</h5>
                      <span className="text-green-300 font-bold">{bonus?.value}</span>
                    </div>
                    <p className="text-blue-100 text-xs">{bonus?.description}</p>
                  </div>
                )) ?? []}
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total em Bônus:</span>
                  <span className="text-green-300 font-bold text-lg">R$ 381,00</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                🛡️ Garantia Total de 30 Dias
              </h4>
              <p className="text-gray-700 text-sm mb-4">
                Teste o Clivus por 30 dias completos. Se não ficar 100% satisfeito, 
                devolvemos seu dinheiro sem fazer perguntas.
              </p>
              <p className="text-xs text-gray-600">
                Essa é nossa garantia de que o produto realmente funciona!
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                💳 Parcelamos no cartão de crédito em até 12x sem juros
              </p>
              <p className="text-gray-600 text-sm mt-2">
                🔒 Seus dados estão protegidos com criptografia SSL
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-10 text-white shadow-2xl"
        >
          <h3 className="text-3xl font-bold mb-4">
            ⚠️ Não Espere a Receita Federal Bater na Sua Porta
          </h3>
          <p className="text-xl mb-4 opacity-95">
            Cada dia com CPF e CNPJ misturados{" "}
            <span className="font-bold">aumenta seu risco fiscal</span> e{" "}
            <span className="font-bold">impede seu crescimento</span>.
          </p>
          <p className="text-2xl font-bold mb-6">
            Por R$ 97, você resolve AGORA e dorme tranquilo.
          </p>
          <Button
            onClick={handlePurchase}
            size="lg"
            className="bg-white text-red-600 hover:bg-gray-100 font-bold px-12 py-6 text-xl shadow-xl"
          >
            Regularizar Meu Negócio Agora
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
