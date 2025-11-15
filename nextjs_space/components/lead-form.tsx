
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, User, ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { toast } from "react-hot-toast";

export function LeadForm() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e?.target ?? {};
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    
    if (!formData?.name || !formData?.email) {
      toast?.error?.("Por favor, preencha todos os campos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast?.success?.("Informações enviadas com sucesso!");
        setFormData({ name: "", email: "" });
      } else {
        toast?.error?.(result?.error ?? "Erro ao enviar informações. Tente novamente.");
      }
    } catch (error) {
      toast?.error?.("Erro ao enviar informações. Verifique sua conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    "E-book gratuito sobre organização financeira",
    "Acesso antecipado a novas funcionalidades",
    "Dicas exclusivas por email",
    "Convite para webinars especiais"
  ];

  if (isSubmitted) {
    return (
      <section ref={ref} id="lead-form" className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="border-green-200 shadow-xl">
              <CardContent className="p-12">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Obrigado pelo seu interesse!
                </h3>
                
                <p className="text-lg text-gray-600 mb-6">
                  Suas informações foram recebidas com sucesso. Em breve você receberá 
                  conteúdos exclusivos sobre organização financeira no seu e-mail.
                </p>
                
                <Button
                  onClick={() => {
                    const offerSection = document.getElementById('oferta');
                    offerSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3"
                >
                  Ver Oferta Especial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="lead-form" className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Quer Saber <span className="text-blue-600">Mais</span> Antes de Decidir?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Deixe seu nome e e-mail e receba gratuitamente materiais exclusivos 
            sobre organização financeira para empreendedores.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <Card className="shadow-2xl border-blue-200">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Sparkles className="mr-3 h-6 w-6" />
                  Conteúdo Exclusivo Gratuito
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="Seu nome completo"
                      value={formData?.name ?? ""}
                      onChange={handleInputChange}
                      className="pl-12 py-6 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="Seu melhor e-mail"
                      value={formData?.email ?? ""}
                      onChange={handleInputChange}
                      className="pl-12 py-6 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        Quero Receber o Conteúdo Gratuito
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>
                
                <p className="text-xs text-gray-500 mt-4 text-center">
                  🔒 Seus dados estão seguros conosco. Não fazemos spam.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              O que você vai receber:
            </h3>
            
            <div className="space-y-4">
              {benefits?.map?.((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-1 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              )) ?? []}
            </div>
            
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-6 border border-yellow-200">
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                🎁 Bônus Especial
              </h4>
              <p className="text-gray-700 text-sm">
                Quem se cadastrar hoje também recebe um checklist com 
                15 dicas para separar finanças PF e PJ imediatamente.
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                ⭐ Mais de 5.000 empreendedores já recebem nosso conteúdo
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
