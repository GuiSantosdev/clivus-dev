
"use client";

import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { CtaButton } from "./cta-button";

export function TestimonialsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      name: "Maria Santos",
      business: "Consultoria Contábil",
      location: "São Paulo, SP",
      testimonial: "Antes do Clivus, eu misturava tudo. Cartão pessoal para despesa da empresa, conta da empresa para gastos pessoais. Era um caos total! Hoje tenho tudo organizado e consigo ver exatamente quanto minha empresa está gerando de lucro real.",
      rating: 5,
      result: "Aumentou lucro em 35%"
    },
    {
      name: "João Silva",
      business: "E-commerce de Roupas",
      location: "Rio de Janeiro, RJ",
      testimonial: "O que mais me impressionou foi a facilidade de uso. Em menos de 2 horas já tinha tudo configurado. Os relatórios são fantásticos e me ajudam a tomar decisões muito mais assertivas no meu negócio.",
      rating: 5,
      result: "Economizou 15h por mês"
    },
    {
      name: "Ana Carolina",
      business: "Agência de Marketing",
      location: "Belo Horizonte, MG",
      testimonial: "Estava com problemas na Receita Federal por causa da mistura das contas. O Clivus não só resolveu isso como me mostrou oportunidades de economia fiscal que eu nem sabia que existiam. Recomendo para todo empreendedor!",
      rating: 5,
      result: "Evitou R$ 12.000 em multas"
    },
    {
      name: "Carlos Mendes",
      business: "Oficina Mecânica",
      location: "Porto Alegre, RS",
      testimonial: "Sou péssimo com números, mas o Clivus tornou tudo muito simples. Agora sei exatamente quanto posso tirar da empresa para minha família sem prejudicar o fluxo de caixa. Minha esposa finalmente parou de reclamar das finanças!",
      rating: 5,
      result: "Paz familiar restaurada"
    }
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Veja o que Nossos <span className="text-blue-600">Clientes</span> Dizem
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mais de 2.000 empreendedores já transformaram suas finanças com o Clivus. 
            Conheça algumas histórias de sucesso reais.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials?.map?.((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-card rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl mr-4">
                  {testimonial?.name?.split(' ')?.map?.(n => n?.[0])?.join?.('') ?? 'AN'}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {testimonial?.name}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {testimonial?.business}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {testimonial?.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {[...Array(testimonial?.rating ?? 5)]?.map?.((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                )) ?? []}
              </div>

              <div className="relative">
                <Quote className="absolute -top-2 -left-2 h-8 w-8 text-blue-200" />
                <p className="text-gray-700 leading-relaxed pl-6 mb-4">
                  "{testimonial?.testimonial}"
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-4 border-l-4 border-green-500">
                <p className="text-sm font-semibold text-gray-800">
                  🎯 Resultado: {testimonial?.result}
                </p>
              </div>
            </motion.div>
          )) ?? []}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Junte-se a mais de 2.000 empreendedores satisfeitos!
            </h3>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div>
                <div className="text-3xl font-bold">98%</div>
                <div className="text-blue-100">Taxa de Satisfação</div>
              </div>
              <div>
                <div className="text-3xl font-bold">4.9/5</div>
                <div className="text-blue-100">Avaliação Média</div>
              </div>
              <div>
                <div className="text-3xl font-bold">30 dias</div>
                <div className="text-blue-100">Garantia de Satisfação</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA após os depoimentos */}
        <div className="mt-12">
          <CtaButton 
            text="QUERO FAZER PARTE DESSE GRUPO"
            subtext="Junte-se a milhares de empreendedores de sucesso"
            href="#oferta"
            variant="primary"
          />
        </div>
      </div>
    </section>
  );
}
