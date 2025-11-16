

"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Play } from "lucide-react";

export function VslSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Substitua esta URL pelo link do seu vídeo do YouTube, Vimeo, ou qualquer outro player
  const videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Placeholder - substitua pelo seu vídeo

  return (
    <section ref={ref} className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            🎥 Assista ao Vídeo e Descubra Como o{" "}
            <span className="text-blue-600">Clivus</span> Funciona
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Veja como é simples separar suas finanças PF e PJ em minutos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-200"
        >
          {/* Wrapper com aspect ratio 16:9 */}
          <div className="relative w-full pb-[56.25%]">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={videoUrl}
              title="Clivus - Video Sales Letter"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Overlay decorativo (opcional) */}
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
            ⚡ ASSISTA AGORA
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-6 sm:mt-8 text-center"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">⏱️ 5 min</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Duração do vídeo</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 sm:p-4">
              <p className="text-xl sm:text-2xl font-bold text-green-600">✅ 100%</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Gratuito para assistir</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 sm:p-4">
              <p className="text-xl sm:text-2xl font-bold text-purple-600">🎁 Bônus</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Checklist gratuito</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

