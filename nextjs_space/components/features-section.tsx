
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

export function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features = [
    {
      icon: Calculator,
      title: "Calculadora de Pró-labore",
      description: "Calcule automaticamente o valor ideal do seu pró-labore baseado na legislação vigente"
    },
    {
      icon: FileText,
      title: "Gerador de Relatórios",
      description: "Relatórios detalhados de DRE, fluxo de caixa e balanço patrimonial em poucos cliques"
    },
    {
      icon: BarChart3,
      title: "Dashboard Executivo",
      description: "Visualize todos os indicadores importantes do seu negócio em uma única tela"
    },
    {
      icon: Shield,
      title: "Compliance Fiscal",
      description: "Mantenha-se sempre em conformidade com as obrigações fiscais e tributárias"
    },
    {
      icon: RefreshCw,
      title: "Sincronização Bancária",
      description: "Conecte suas contas e cartões para importação automática de transações"
    },
    {
      icon: DollarSign,
      title: "Controle de Investimentos",
      description: "Acompanhe seus investimentos pessoais separadamente dos empresariais"
    },
    {
      icon: Cloud,
      title: "Backup Automático",
      description: "Seus dados sempre seguros na nuvem com backup automático diário"
    },
    {
      icon: Smartphone,
      title: "Acesso Mobile",
      description: "Acesse suas informações financeiras de qualquer lugar, a qualquer hora"
    },
    {
      icon: Users,
      title: "Multi-usuário",
      description: "Permita acesso ao seu contador ou sócios com níveis diferentes de permissão"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Funcionalidades <span className="text-blue-600">Completas</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tudo que você precisa para ter controle total das suas finanças 
            pessoais e empresariais em uma única ferramenta.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features?.map?.((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
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
              "Planejamento tributário",
              "Controle de estoque",
              "Gestão de fornecedores",
              "Análise de rentabilidade",
              "Projeções financeiras",
              "Alertas personalizados",
              "Exportação para contabilidade",
              "Suporte especializado"
            ]?.map?.((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-300" />
                <span className="text-sm">{item}</span>
              </div>
            )) ?? []}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
