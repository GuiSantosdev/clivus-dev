
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
  isUserCity?: boolean; // Marca se é a cidade real do usuário
}

interface UserLocation {
  city: string;
  state: string;
  country: string;
}

const baseNotifications: Notification[] = [
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

// Lista expandida de 100+ nomes brasileiros para notificações
const extraNames = [
  "Roberto Silva", "Mariana Costa", "Felipe Oliveira", "Gabriela Santos", "Ricardo Pereira",
  "Daniela Almeida", "André Fernandes", "Larissa Rodrigues", "Bruno Carvalho", "Carolina Martins",
  "Alexandre Souza", "Juliana Alves", "Fernando Lima", "Patrícia Rocha", "Gustavo Mendes",
  "Tatiana Barbosa", "Rodrigo Pinto", "Renata Cardoso", "Diego Teixeira", "Vanessa Reis",
  "Marcelo Nunes", "Cristina Moreira", "Leonardo Azevedo", "Simone Monteiro", "Paulo Cunha",
  "Adriana Figueiredo", "Vinicius Cavalcanti", "Monica Duarte", "Thiago Correia", "Sandra Melo",
  "Daniel Vieira", "Luciana Freitas", "Marcos Ribeiro", "Aline Castro", "Eduardo Dias",
  "Claudia Sá", "Igor Borges", "Bruna Campos", "Fábio Araújo", "Jéssica Moura",
  "Leandro Tavares", "Viviane Santiago", "Henrique Ramos", "Priscila Guimarães", "William Batista",
  "Eliane Nogueira", "Caio Brito", "Raquel Fernandes", "Mateus Lopes", "Helena Porto",
  "Renan Magalhães", "Bianca Carvalho", "Gabriel Gomes", "Isabela Soares", "Samuel Amaral",
  "Andreia Rezende", "Cesar Nascimento", "Marcia Coelho", "Victor Barros", "Denise Antunes",
  "Rafael Torres", "Sabrina Fonseca", "Guilherme Bastos", "Camila Xavier", "Pedro Machado",
  "Luiza Miranda", "Thales Pires", "Natalia Viana", "Mauricio Caldeira", "Rosana Domingues",
  "Anderson Pacheco", "Joana Medeiros", "Sergio Marques", "Debora Sampaio", "Otavio Leite",
  "Fabiana Silveira", "Claudio Farias", "Marisa Ferraz", "Lucio Toledo", "Angela Cardoso",
  "Humberto Matos", "Regina Salles", "Flavio Rocha", "Leticia Furtado", "Roberto Luz",
  "Silvia Braga", "Edson Paiva", "Marta Prado", "Geraldo Assis", "Lucia Castro",
  "Evandro Costa", "Cintia Moreira", "Nelson Figueira", "Sueli Lima", "Marcos Vasconcelos",
  "Fernanda Pereira", "Antonio Neves", "Valeria Goncalves", "Carlos Batista", "Solange Ribeiro",
  "Jorge Almeida", "Teresa Santos", "Wagner Araujo", "Patricia Souza", "Alberto Ferreira",
  "Vera Oliveira"
];

export function SocialProofNotification() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(baseNotifications);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  // Busca a localização do usuário via API
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        // Verifica se já temos a localização em cache (válido por 24h)
        const cachedLocation = localStorage.getItem("clivus_user_location");
        const cacheTimestamp = localStorage.getItem("clivus_location_timestamp");
        
        if (cachedLocation && cacheTimestamp) {
          const cacheAge = Date.now() - parseInt(cacheTimestamp);
          const oneDayInMs = 24 * 60 * 60 * 1000;
          
          // Se o cache ainda é válido (menos de 24h)
          if (cacheAge < oneDayInMs) {
            const location = JSON.parse(cachedLocation);
            setUserLocation(location);
            console.log("🎯 [Social Proof] Usando localização em cache:", location);
            return;
          }
        }

        // Busca nova localização da API
        console.log("🌍 [Social Proof] Buscando localização do usuário...");
        const response = await fetch("/api/geolocation");
        
        if (!response.ok) {
          throw new Error("Falha ao buscar geolocalização");
        }

        const data = await response.json();
        const location: UserLocation = {
          city: data.city,
          state: data.state,
          country: data.country,
        };

        setUserLocation(location);
        
        // Salva no cache
        localStorage.setItem("clivus_user_location", JSON.stringify(location));
        localStorage.setItem("clivus_location_timestamp", Date.now().toString());
        
        console.log("✅ [Social Proof] Localização detectada:", location);

      } catch (error) {
        console.error("❌ [Social Proof] Erro ao buscar localização:", error);
        // Usa notificações padrão em caso de erro
      }
    };

    fetchUserLocation();
  }, []);

  // Cria notificações personalizadas com a cidade do usuário
  useEffect(() => {
    if (!userLocation) return;

    // Adiciona 3 notificações com a cidade real do usuário
    const userCityNotifications: Notification[] = [
      {
        id: "user-1",
        name: extraNames[Math.floor(Math.random() * extraNames.length)],
        plan: ["Básico", "Intermediário", "Avançado"][Math.floor(Math.random() * 3)],
        city: userLocation.city,
        state: userLocation.state,
        timeAgo: "há 5 minutos",
        isUserCity: true,
      },
      {
        id: "user-2",
        name: extraNames[Math.floor(Math.random() * extraNames.length)],
        plan: ["Básico", "Intermediário", "Avançado"][Math.floor(Math.random() * 3)],
        city: userLocation.city,
        state: userLocation.state,
        timeAgo: "há 28 minutos",
        isUserCity: true,
      },
      {
        id: "user-3",
        name: extraNames[Math.floor(Math.random() * extraNames.length)],
        plan: ["Básico", "Intermediário", "Avançado"][Math.floor(Math.random() * 3)],
        city: userLocation.city,
        state: userLocation.state,
        timeAgo: "há 1 hora",
        isUserCity: true,
      },
    ];

    // Embaralha as notificações fictícias para variar a ordem
    const shuffledBase = [...baseNotifications].sort(() => Math.random() - 0.5);
    
    // Coloca as notificações da cidade do usuário PRIMEIRO, depois intercala com as fictícias
    const mergedNotifications: Notification[] = [];
    
    // Começa com as 3 notificações da cidade do usuário
    mergedNotifications.push(...userCityNotifications);
    
    // Adiciona as notificações fictícias, intercaladas
    shuffledBase.forEach((notification, index) => {
      mergedNotifications.push(notification);
      
      // Intercala mais notificações da cidade do usuário a cada 5 fictícias
      if ((index + 1) % 5 === 0 && userCityNotifications.length > 0) {
        const randomUserNotification = userCityNotifications[Math.floor(Math.random() * userCityNotifications.length)];
        mergedNotifications.push({
          ...randomUserNotification,
          id: `user-extra-${index}`,
          timeAgo: ["há 15 minutos", "há 32 minutos", "há 47 minutos"][Math.floor(Math.random() * 3)],
        });
      }
    });

    setNotifications(mergedNotifications);
    console.log("🎉 [Social Proof] Notificações personalizadas criadas - começando pela cidade do usuário!");

  }, [userLocation]);

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
  }, [isVisible, currentIndex, isMinimized, notifications.length]);

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
          className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-auto z-50 max-w-sm mx-auto sm:mx-0"
        >
          <div className={`bg-card rounded-lg shadow-2xl p-4 pr-12 ${
            currentNotification.isUserCity 
              ? "border-2 border-green-400 ring-2 ring-green-200" 
              : "border border-gray-200"
          }`}>
            {/* Badge especial para cidade do usuário */}
            {currentNotification.isUserCity && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                📍 Sua região
              </div>
            )}

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
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  currentNotification.isUserCity
                    ? "bg-green-200 ring-2 ring-green-300"
                    : "bg-green-100"
                }`}>
                  <CheckCircle className={`h-6 w-6 ${
                    currentNotification.isUserCity
                      ? "text-green-700"
                      : "text-green-600"
                  }`} />
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
                  <span className={currentNotification.isUserCity ? "font-semibold text-green-700" : ""}>
                    {currentNotification.city}, {currentNotification.state}
                  </span>
                  <span>•</span>
                  <span>{currentNotification.timeAgo}</span>
                </div>
              </div>
            </div>

            {/* Barra de progresso */}
            <motion.div
              className={`absolute bottom-0 left-0 h-1 rounded-bl-lg ${
                currentNotification.isUserCity
                  ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
                  : "bg-gradient-to-r from-green-500 to-blue-500"
              }`}
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
