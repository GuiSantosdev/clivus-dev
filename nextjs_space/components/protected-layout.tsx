
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./sidebar";

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
      <main className="flex-1 lg:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
