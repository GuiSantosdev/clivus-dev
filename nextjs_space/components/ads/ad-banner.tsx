

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";

interface AdBannerProps {
  position: "top" | "sidebar" | "between_content" | "footer" | "modal";
  className?: string;
}

interface Advertisement {
  id: string;
  title: string;
  type: "adsense" | "banner";
  adsenseCode?: string;
  bannerUrl?: string;
  linkUrl?: string;
  position: string;
}

export function AdBanner({ position, className = "" }: AdBannerProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Extrai o nome da página da rota
  const pageName = pathname.split("/").filter(Boolean)[0] || "dashboard";

  // Busca o plano do usuário (simplificado)
  const userPlan = "basic"; // TODO: pegar do contexto ou sessão

  useEffect(() => {
    fetchAd();
  }, [position, pageName]);

  useEffect(() => {
    if (ad && position === "modal") {
      // Aguarda 3 segundos antes de mostrar o modal
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [ad, position]);

  const fetchAd = async () => {
    try {
      const response = await fetch(
        `/api/ads/active?position=${position}&page=${pageName}&plan=${userPlan}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.ads && data.ads.length > 0) {
          setAd(data.ads[0]);
          
          // Registra impressão
          await fetch("/api/ads/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adId: data.ads[0].id,
              event: "impression",
            }),
          });
        }
      }
    } catch (error) {
      console.error("Error fetching ad:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    if (!ad) return;

    // Registra clique
    try {
      await fetch("/api/ads/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adId: ad.id,
          event: "click",
        }),
      });

      // Redireciona se for banner próprio
      if (ad.type === "banner" && ad.linkUrl) {
        window.open(ad.linkUrl, "_blank");
      }
    } catch (error) {
      console.error("Error tracking click:", error);
    }
  };

  if (loading || !ad) {
    return null;
  }

  // Modal
  if (position === "modal" && showModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full relative">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 p-2 hover:bg-muted-soft rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          <div className="p-6">
            {ad.type === "adsense" && ad.adsenseCode ? (
              <div
                dangerouslySetInnerHTML={{ __html: ad.adsenseCode }}
                className="min-h-[250px] flex items-center justify-center"
              />
            ) : ad.type === "banner" && ad.bannerUrl ? (
              <div onClick={handleClick} className="cursor-pointer">
                <div className="relative w-full aspect-video">
                  <Image
                    src={ad.bannerUrl}
                    alt={ad.title}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Renderização normal (não modal)
  const containerClass = `ad-banner ad-${position} ${className}`;

  return (
    <div className={containerClass}>
      {ad.type === "adsense" && ad.adsenseCode ? (
        <div
          dangerouslySetInnerHTML={{ __html: ad.adsenseCode }}
          className="min-h-[90px]"
        />
      ) : ad.type === "banner" && ad.bannerUrl ? (
        <div onClick={handleClick} className="cursor-pointer group">
          <div
            className={`
              relative overflow-hidden rounded-lg shadow-md
              group-hover:shadow-xl transition-shadow duration-300
              ${position === "top" ? "w-full h-24" : ""}
              ${position === "sidebar" ? "w-full h-64" : ""}
              ${position === "between_content" ? "w-full h-32" : ""}
              ${position === "footer" ? "w-full h-20" : ""}
            `}
          >
            <Image
              src={ad.bannerUrl}
              alt={ad.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 right-2 bg-card/90 px-2 py-1 rounded text-xs text-gray-600">
              Anúncio
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
