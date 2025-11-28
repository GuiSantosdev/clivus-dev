
"use client";

import { AlertTriangle, Scale, TrendingDown, ShieldAlert, FileWarning, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { CtaButton } from "./cta-button";

export function ProblemSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const problems = [
    {
      icon: Scale,
      title: "Violação da Legislação",
      description: "Misturar finanças PF e PJ viola a separação patrimonial exigida por lei",
      impact: "Você pode estar descumprindo normas legais sem nem saber"
    },
    {
      icon: ShieldAlert,
      title: "Risco Fiscal Iminente",
      description: "Receita Federal pode caracterizar isso como desvio de recursos",
      impact: "Multas, autuações e problemas graves com o fisco"
    },
    {
      icon: Lock,
      title: "Barreira ao Crescimento",
      description: "Investidores e bancos não confiam em empresas com finanças misturadas",
      impact: "Impossível escalar e crescer de verdade o negócio"
    },
    {
      icon: FileWarning,
      title: "Declarações Comprometidas",
      description: "IRPF e IRPJ ficam incorretos quando as contas estão misturadas",
      impact: "Alto risco de cair na malha fina e enfrentar fiscalização"
    },
    {
      icon: TrendingDown,
      title: "Lucro Real Invisível",
      description: "Você não sabe quanto a empresa realmente lucra",
      impact: "Decisões erradas que impedem o crescimento sustentável"
    },
    {
      icon: AlertTriangle,
      title: "Perda de Credibilidade",
      description: "Negócios sérios precisam ter finanças organizadas e separadas",
      impact: "Seu negócio é visto como amador e não profissional"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Por Que Você Está Colocando{" "}
            <span className="text-red-600">Seu Negócio em Risco</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
            Cada dia que passa com as finanças do CPF e CNPJ misturadas{" "}
            <span className="text-red-600 font-bold">aumenta suas chances</span> de enfrentar:
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {problems?.map?.((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-card rounded-xl shadow-lg border border-red-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-red-100 rounded-lg p-3">
                    <problem.icon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {problem?.title}
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    {problem?.description}
                  </p>
                  <div className="bg-red-50 rounded-lg p-3 border-l-4 border-red-400">
                    <p className="text-red-700 text-xs font-medium">
                      💥 {problem?.impact}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )) ?? []}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-8 text-white shadow-xl"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            ⚠️ Existe uma forma simples de resolver isso AGORA
          </h3>
          <p className="text-lg md:text-xl opacity-95 font-medium">
            E você não precisa de contador, consultor ou planilhas complicadas...
          </p>
        </motion.div>

        {/* CTA após os problemas */}
        <div className="mt-12">
          <CtaButton 
            text="RESOLVER ISSO AGORA"
            subtext="Proteja seu negócio • 100% seguro e legal"
            href="#oferta"
            variant="primary"
          />
        </div>
      </div>
    </section>
  );
}
