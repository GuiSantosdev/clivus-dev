
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Scale, TrendingUp, ShieldCheck, Monitor, Smartphone } from "lucide-react";
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
              <div className="mt-4 inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-sm">
                <Monitor className="h-4 w-4" />
                <span>100% Online</span>
                <span className="text-blue-600">•</span>
                <Smartphone className="h-4 w-4" />
                <span>Acesse de Qualquer Lugar</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Você Está Misturando as Finanças do{" "}
              <span className="text-red-600">CPF e CNPJ?</span>
            </h1>
            
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 max-w-2xl mx-auto lg:mx-0">
              <p className="text-lg font-semibold text-gray-800">
                Isso coloca você <span className="text-red-600">em risco com o fisco</span> e{" "}
                <span className="text-red-600">impede seu negócio de crescer.</span>
              </p>
            </div>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed max-w-2xl font-medium">
              O <span className="font-bold text-blue-600">Clivus</span> separa tudo de forma{" "}
              <span className="font-bold">simples e definitiva.</span>
            </p>
            
            <div className="flex flex-col gap-4 justify-center lg:justify-start">
              <Button
                onClick={scrollToOffer}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-6 text-xl font-bold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Regularizar Agora por R$ 97
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              <p className="text-sm text-gray-600 font-medium">
                ✓ Acesso Imediato • ✓ Pagamento Único • ✓ Para Todas as Empresas
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Scale className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Conformidade Legal</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Segurança Fiscal</span>
              </div>
              <div className="flex flex-col items-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-gray-700">Crescimento Real</span>
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
