
"use client";

import { CheckCircle, Scale, ShieldCheck, TrendingUp, Rocket, Building2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";

export function SolutionSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const scrollToOffer = () => {
    const offerSection = document.getElementById('oferta');
    offerSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const benefits = [
    {
      icon: Scale,
      title: "100% Conforme a Legislação",
      description: "Atenda todas as exigências legais de separação patrimonial entre PF e PJ"
    },
    {
      icon: ShieldCheck,
      title: "Proteção Fiscal Total",
      description: "Evite problemas com a Receita Federal e elimine riscos de autuações"
    },
    {
      icon: TrendingUp,
      title: "Crescimento Real Desbloqueado",
      description: "Finanças organizadas atraem investidores e abrem portas para escalar"
    },
    {
      icon: Rocket,
      title: "Escalabilidade Garantida",
      description: "Organize sua empresa para crescer de forma sustentável e profissional"
    },
    {
      icon: Building2,
      title: "Para Qualquer Tamanho",
      description: "Funciona perfeitamente desde MEI até empresas de médio porte"
    },
    {
      icon: Sparkles,
      title: "Simples e Prático",
      description: "Interface objetiva que transforma gestão financeira em algo fácil"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Conheça o <span className="text-blue-600">Clivus</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A ferramenta <span className="font-semibold">simples, prática e objetiva</span> que vai regularizar sua situação, 
            proteger você do fisco e <span className="font-semibold text-blue-600">desbloquear o crescimento real do seu negócio</span> — 
            independente do tamanho da sua empresa.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8">
              Como o Clivus Muda de Vez Sua Empresa
            </h3>
            
            <div className="space-y-6">
              {benefits?.map?.((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <benefit.icon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {benefit?.title}
                    </h4>
                    <p className="text-gray-600">
                      {benefit?.description}
                    </p>
                  </div>
                </motion.div>
              )) ?? []}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl">
              <h4 className="text-2xl font-bold mb-6">Antes vs Depois</h4>
              
              <div className="space-y-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-red-300">❌ ANTES</span>
                    <span className="text-red-300 font-bold">Risco e Estagnação</span>
                  </div>
                  <p className="text-sm opacity-90">
                    Irregular com a lei, risco fiscal, sem credibilidade, crescimento bloqueado
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-300">✅ DEPOIS</span>
                    <span className="text-green-300 font-bold">Legal e Escalável</span>
                  </div>
                  <p className="text-sm opacity-90">
                    100% conforme a lei, protegido do fisco, pronto para crescer de verdade
                  </p>
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <Button
                  onClick={scrollToOffer}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3"
                >
                  Quero Essa Transformação
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 text-white"
        >
          <TrendingUp className="h-16 w-16 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">
            Transformação Garantida
          </h3>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-green-100">Conformidade com a legislação</div>
            </div>
            <div>
              <div className="text-3xl font-bold">Zero</div>
              <div className="text-green-100">Risco de problemas fiscais</div>
            </div>
            <div>
              <div className="text-3xl font-bold">∞</div>
              <div className="text-green-100">Potencial de crescimento desbloqueado</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
