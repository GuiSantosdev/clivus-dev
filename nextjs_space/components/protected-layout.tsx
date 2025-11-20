
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./sidebar";
import { AdBanner } from "./ads/ad-banner";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedLayout({
  children,
  requireAdmin = false,
}: ProtectedLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    // @ts-ignore
    if (requireAdmin && session.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [session, status, router, requireAdmin]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // @ts-ignore
  if (requireAdmin && session.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 transition-all duration-300" style={{ marginLeft: 0 }}>
        <div className="flex gap-6">
          <div className="flex-1 max-w-7xl">{children}</div>
          {/* Anúncio Sidebar (visível apenas em telas grandes) */}
          <div className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <AdBanner position="sidebar" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
