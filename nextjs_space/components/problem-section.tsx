
"use client";

import { AlertTriangle, Users, TrendingDown, AlertCircle, CreditCard, FileX } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export function ProblemSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const problems = [
    {
      icon: AlertTriangle,
      title: "Mistura das Contas",
      description: "Usar a conta pessoal para despesas da empresa ou vice-versa",
      impact: "Dificulta controle e pode gerar problemas com Receita Federal"
    },
    {
      icon: FileX,
      title: "Falta de Organização",
      description: "Documentos e comprovantes espalhados sem controle",
      impact: "Impossibilita análise real da situação financeira"
    },
    {
      icon: TrendingDown,
      title: "Decisões sem Base",
      description: "Não saber quanto realmente sobra do negócio",
      impact: "Investimentos errados e gastos desnecessários"
    },
    {
      icon: AlertCircle,
      title: "Problemas Fiscais",
      description: "Declarações incorretas por falta de separação",
      impact: "Risco de multas e autuações da Receita Federal"
    },
    {
      icon: CreditCard,
      title: "Fluxo de Caixa Confuso",
      description: "Não saber quando o dinheiro é da empresa ou pessoal",
      impact: "Dificuldade para planejar investimentos e crescimento"
    },
    {
      icon: Users,
      title: "Stress Familiar",
      description: "Conflitos em casa por misturar finanças pessoais e profissionais",
      impact: "Tensões que afetam tanto a vida pessoal quanto o negócio"
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
            Você Reconhece Esses <span className="text-red-600">Problemas</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A maioria dos empreendedores brasileiros enfrenta essas dificuldades diariamente. 
            E o pior: isso está custando dinheiro e criando riscos desnecessários para o seu negócio.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {problems?.map?.((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-red-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
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
          className="text-center mt-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">
            Não deixe esses problemas afundarem seu negócio!
          </h3>
          <p className="text-lg opacity-90">
            Cada dia que passa sem uma organização adequada é dinheiro perdido e risco acumulado.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
