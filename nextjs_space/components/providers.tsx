
"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme="simples"
        themes={["simples", "moderado", "moderno"]}
        enableSystem={false}
        forcedTheme={undefined}
        storageKey="clivus-theme"
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}

