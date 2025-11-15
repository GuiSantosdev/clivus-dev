
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, DollarSign } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function HeroSection() {
  const scrollToOffer = () => {
    const offerSection = document.getElementById('oferta');
    offerSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center">
      <div className="absolute inset-0 opacity-30">
        <div className="w-full h-full bg-gradient-to-br from-blue-100/20 to-transparent bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:60px_60px]"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="mb-8">
              <Image
                src="/logo-clivus.png"
                alt="Clivus - Ferramenta Financeira"
                width={280}
                height={120}
                className="mx-auto lg:mx-0"
                priority
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Separe suas <span className="text-blue-600">Finanças PF</span> das{" "}
              <span className="text-blue-800">Finanças PJ</span> de uma vez por todas
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
              O Clivus é a ferramenta completa que todo empreendedor precisa para 
              organizar suas finanças pessoais e empresariais, evitar problemas com 
              o Fisco e maximizar seus resultados.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={scrollToOffer}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Quero o Clivus Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-lg"
                onClick={() => {
                  const leadForm = document.getElementById('lead-form');
                  leadForm?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Saiba Mais
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Organização</span>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Segurança</span>
              </div>
              <div className="flex flex-col items-center">
                <DollarSign className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Resultado</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white mb-6">
                <h3 className="text-2xl font-bold mb-4">Dashboard Financeiro</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Receita PJ</span>
                    <span className="font-bold">R$ 45.300</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pró-labore</span>
                    <span className="font-bold">R$ 8.500</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lucro Líquido</span>
                    <span className="font-bold text-green-300">R$ 12.800</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-medium">
                  Controle total das suas finanças em um só lugar!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
