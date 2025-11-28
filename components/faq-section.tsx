
"use client";

import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import { CtaButton } from "./cta-button";

export function FaqSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev?.includes?.(index) 
        ? prev?.filter?.(i => i !== index) ?? []
        : [...(prev ?? []), index]
    );
  };

  const faqs = [
    {
      question: "O Clivus funciona para qualquer tipo de empresa?",
      answer: "Sim! O Clivus foi desenvolvido para atender MEIs, Microempresas, EPPs, profissionais liberais e pequenas empresas de todos os segmentos. Seja você um consultório, comércio, prestador de serviços ou e-commerce, a ferramenta se adapta às suas necessidades específicas."
    },
    {
      question: "Preciso ter conhecimento técnico para usar?",
      answer: "Não! O Clivus foi criado pensando em empreendedores que não são especialistas em finanças. A interface é intuitiva e amigável, com tutoriais passo a passo. Em menos de 2 horas você já terá tudo configurado e funcionando."
    },
    {
      question: "Meus dados ficam seguros?",
      answer: "Absolutamente! Utilizamos criptografia de nível bancário (SSL 256-bits), backup automático diário em servidores seguros e seguimos todas as normas da LGPD. Seus dados financeiros ficam mais seguros no Clivus do que em planilhas no seu computador."
    },
    {
      question: "E se eu não ficar satisfeito com a compra?",
      answer: "Oferecemos garantia incondicional de 30 dias. Se por qualquer motivo você não ficar satisfeito, devolvemos 100% do seu dinheiro sem fazer perguntas. Nosso objetivo é que você tenha sucesso com a ferramenta."
    },
    {
      question: "O Clivus substitui meu contador?",
      answer: "Não, o Clivus complementa o trabalho do seu contador! Na verdade, ele facilita muito a vida do profissional contábil, fornecendo relatórios organizados e dados precisos. Seu contador vai agradecer por usar o Clivus!"
    },
    {
      question: "Posso usar em mais de uma empresa?",
      answer: "A licença do Clivus é por CPF do titular, mas você pode gerenciar até 3 empresas na mesma conta. Se precisar de mais empresas, oferecemos pacotes especiais com desconto progressivo."
    },
    {
      question: "Tem custos adicionais ou mensalidades?",
      answer: "Não! O investimento de R$ 97,00 é único e dá direito ao uso vitalício da plataforma. Incluímos 2 anos de atualizações gratuitas e 12 meses de suporte técnico sem custos adicionais."
    },
    {
      question: "Posso acessar de qualquer lugar?",
      answer: "Sim! O Clivus é uma ferramenta online que funciona em qualquer dispositivo com internet: computador, tablet ou smartphone. Seus dados ficam sincronizados em tempo real na nuvem."
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Perguntas <span className="text-blue-600">Frequentes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Esclarecemos as principais dúvidas sobre o Clivus. 
            Se sua pergunta não estiver aqui, nossa equipe está pronta para ajudar!
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs?.map?.((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-card rounded-lg shadow-lg border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-6 text-left hover:bg-muted-soft transition-colors duration-200 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 rounded-full p-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq?.question}
                  </h3>
                </div>
                <div className="flex-shrink-0">
                  {openItems?.includes?.(index) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </button>
              
              {openItems?.includes?.(index) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <div className="bg-blue-50 rounded-lg p-4 ml-12">
                    <p className="text-gray-700 leading-relaxed">
                      {faq?.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )) ?? []}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">
            Ainda tem dúvidas?
          </h3>
          <p className="text-blue-100 mb-6">
            Nossa equipe de suporte está pronta para esclarecer qualquer questão sobre o Clivus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center space-x-2">
              <span>📧 contato@clivus.com.br</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📱 (11) 9999-9999</span>
            </div>
          </div>
        </motion.div>

        {/* CTA final antes do formulário */}
        <div className="mt-12">
          <CtaButton 
            text="SIM, QUERO O CLIVUS AGORA"
            subtext="Sem dúvidas restantes • Garantia de 30 dias"
            href="#oferta"
            variant="primary"
          />
        </div>
      </div>
    </section>
  );
}
