
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface Notification {
  id: string;
  name: string;
  plan: string;
  city: string;
  state: string;
  timeAgo: string;
}

const notifications: Notification[] = [
  { id: "1", name: "Maria Silva", plan: "Avançado", city: "São Paulo", state: "SP", timeAgo: "há 3 minutos" },
  { id: "2", name: "João Santos", plan: "Intermediário", city: "Rio de Janeiro", state: "RJ", timeAgo: "há 8 minutos" },
  { id: "3", name: "Ana Costa", plan: "Básico", city: "Belo Horizonte", state: "MG", timeAgo: "há 15 minutos" },
  { id: "4", name: "Carlos Oliveira", plan: "Avançado", city: "Curitiba", state: "PR", timeAgo: "há 22 minutos" },
  { id: "5", name: "Juliana Pereira", plan: "Intermediário", city: "Porto Alegre", state: "RS", timeAgo: "há 35 minutos" },
  { id: "6", name: "Roberto Alves", plan: "Avançado", city: "Brasília", state: "DF", timeAgo: "há 41 minutos" },
  { id: "7", name: "Fernanda Lima", plan: "Básico", city: "Salvador", state: "BA", timeAgo: "há 58 minutos" },
  { id: "8", name: "Pedro Souza", plan: "Intermediário", city: "Fortaleza", state: "CE", timeAgo: "há 1 hora" },
  { id: "9", name: "Camila Rodrigues", plan: "Avançado", city: "Recife", state: "PE", timeAgo: "há 1 hora" },
  { id: "10", name: "Lucas Martins", plan: "Intermediário", city: "Manaus", state: "AM", timeAgo: "há 2 horas" },
  { id: "11", name: "Beatriz Ferreira", plan: "Básico", city: "Goiânia", state: "GO", timeAgo: "há 2 horas" },
  { id: "12", name: "Thiago Ribeiro", plan: "Avançado", city: "Campinas", state: "SP", timeAgo: "há 3 horas" },
  { id: "13", name: "Patrícia Dias", plan: "Intermediário", city: "São Luís", state: "MA", timeAgo: "há 3 horas" },
  { id: "14", name: "Rafael Gomes", plan: "Avançado", city: "Natal", state: "RN", timeAgo: "há 4 horas" },
  { id: "15", name: "Amanda Barbosa", plan: "Básico", city: "Campo Grande", state: "MS", timeAgo: "há 5 horas" },
];

export function SocialProofNotification() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Mostra a primeira notificação após 3 segundos
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible || isMinimized) return;

    // Auto-dismiss após 6 segundos e mostra a próxima após 10 segundos
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    const nextTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
      setIsVisible(true);
    }, 10000);

    return () => {
      clearTimeout(dismissTimer);
      clearTimeout(nextTimer);
    };
  }, [isVisible, currentIndex, isMinimized]);

  const currentNotification = notifications[currentIndex];

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "Básico":
        return "text-blue-600";
      case "Intermediário":
        return "text-green-600";
      case "Avançado":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  if (isMinimized) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100, y: 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-6 left-6 z-50 max-w-sm"
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 pr-12">
            {/* Botão de fechar */}
            <button
              onClick={() => setIsMinimized(true)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Conteúdo */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">
                  {currentNotification.name}
                </p>
                <p className="text-sm text-gray-600">
                  acabou de comprar o{" "}
                  <span className={`font-semibold ${getPlanColor(currentNotification.plan)}`}>
                    Plano {currentNotification.plan}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                  <span>
                    {currentNotification.city}, {currentNotification.state}
                  </span>
                  <span>•</span>
                  <span>{currentNotification.timeAgo}</span>
                </div>
              </div>
            </div>

            {/* Barra de progresso */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-bl-lg"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 6, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
