"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { AdBanner } from "@/components/ads/ad-banner";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Verificar role para rotas admin
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const isAdminRoute = pathname.startsWith("/admin");
      const isAdmin = session.user.role === "superadmin";

      if (isAdminRoute && !isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [status, session, pathname, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="transition-all duration-300">
        {children}
      </main>

      {/* Sidebar Ad (Desktop only) */}
      <div className="hidden xl:block">
        <AdBanner position="sidebar" />
      </div>
    </div>
  );
}
