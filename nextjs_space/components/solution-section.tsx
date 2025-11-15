
"use client";

import { CheckCircle, Target, Shield, TrendingUp, DollarSign, BarChart3, Users, Clock } from "lucide-react";
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
      icon: Target,
      title: "Separação Automática",
      description: "Sistema inteligente que separa automaticamente suas finanças PF das PJ"
    },
    {
      icon: Shield,
      title: "Conformidade Fiscal",
      description: "Garante que você esteja sempre em conformidade com a Receita Federal"
    },
    {
      icon: BarChart3,
      title: "Relatórios Inteligentes",
      description: "Dashboards e relatórios que mostram a real situação do seu negócio"
    },
    {
      icon: DollarSign,
      title: "Maximiza Lucros",
      description: "Identifica oportunidades de economia e otimização de recursos"
    },
    {
      icon: Clock,
      title: "Economia de Tempo",
      description: "Automatiza processos que hoje você faz manualmente por horas"
    },
    {
      icon: Users,
      title: "Paz em Casa",
      description: "Elimina conflitos familiares causados pela mistura de finanças"
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
            A <span className="text-blue-600">Solução</span> que Você Precisa
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            O Clivus foi desenvolvido especificamente para resolver os problemas financeiros 
            que você enfrenta todos os dias. Transforme o caos em organização.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold text-gray-900 mb-8">
              Como o Clivus Transforma sua Vida Financeira
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
                    <span className="text-red-300 font-bold">Caos Total</span>
                  </div>
                  <p className="text-sm opacity-90">
                    Contas misturadas, documentos perdidos, stress constante
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-300">✅ DEPOIS</span>
                    <span className="text-green-300 font-bold">Organização Total</span>
                  </div>
                  <p className="text-sm opacity-90">
                    Finanças separadas, relatórios automáticos, paz de espírito
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
            Resultados Comprovados
          </h3>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-green-100">Redução no tempo gasto com finanças</div>
            </div>
            <div>
              <div className="text-3xl font-bold">89%</div>
              <div className="text-green-100">Aumento na clareza financeira</div>
            </div>
            <div>
              <div className="text-3xl font-bold">78%</div>
              <div className="text-green-100">Melhoria nos lucros</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
