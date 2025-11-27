
"use client";

import { 
  Calculator, 
  FileText, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Cloud, 
  RefreshCw, 
  Users,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { CtaButton } from "./cta-button";

export function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: Calculator,
      title: "Calculadora de Pró-labore",
      description: "Calcule automaticamente o valor ideal do seu pró-labore baseado na legislação vigente com INSS e IR"
    },
    {
      icon: FileText,
      title: "DRE Customizável",
      description: "Demonstração do Resultado do Exercício com plano de contas personalizável"
    },
    {
      icon: BarChart3,
      title: "Dashboard Completo",
      description: "Visualize CPF e CNPJ separados com saldos, receitas e despesas em tempo real"
    },
    {
      icon: Shield,
      title: "Compliance Fiscal",
      description: "Monitore obrigações fiscais (IRPF, DASN, PGMEI) e mantenha-se em dia com a Receita"
    },
    {
      icon: RefreshCw,
      title: "Reconciliação Bancária",
      description: "Importe extratos bancários (CSV/OFX) e reconcilie transações automaticamente"
    },
    {
      icon: DollarSign,
      title: "Controle de Investimentos",
      description: "Gerencie investimentos CPF e CNPJ separadamente (CDB, Tesouro, Fundos)"
    },
    {
      icon: Calculator,
      title: "Calculadora de Custos",
      description: "Calcule o custo real de contratar funcionários (CLT) com todos os encargos"
    },
    {
      icon: Smartphone,
      title: "100% Online",
      description: "Acesse de qualquer lugar, em qualquer dispositivo - computador, tablet ou celular"
    },
    {
      icon: Users,
      title: "Gestão de Equipe",
      description: "Adicione contador, sócios ou funcionários com diferentes níveis de acesso"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-muted-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Simples. <span className="text-blue-600">Prático. Objetivo.</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Uma ferramenta completa mas <span className="font-semibold">descomplicada</span>. 
            Funciona perfeitamente para <span className="font-semibold text-blue-600">qualquer tamanho de empresa</span> — 
            de MEI a médio porte.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features?.map?.((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-card rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {feature?.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature?.description}
                </p>
              </div>
            </motion.div>
          )) ?? []}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-3xl font-bold mb-6">
            E muito mais funcionalidades incluídas!
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              "Planejamento Financeiro (Previsto x Realizado)",
              "Calculadora de Precificação",
              "Gestão de Transações PF e PJ",
              "Categorias Personalizadas",
              "Múltiplos Métodos de Pagamento",
              "Exportação de Relatórios (CSV)",
              "Controle de Parcelamentos",
              "Painéis Administrativos"
            ]?.map?.((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span className="text-sm">{item}</span>
              </div>
            )) ?? []}
          </div>
        </motion.div>

        {/* CTA após as funcionalidades */}
        <div className="mt-12">
          <CtaButton 
            text="QUERO TODAS ESSAS FUNCIONALIDADES"
            subtext="Comece hoje mesmo • Acesso imediato"
            href="#oferta"
            variant="secondary"
          />
        </div>
      </div>
    </section>
  );
}
