
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "Clivus - Separe suas Finanças PF das PJ | Ferramenta Financeira Completa",
  description: "A ferramenta completa que todo empreendedor precisa para organizar finanças pessoais e empresariais. Por apenas R$ 97,00.",
  keywords: "finanças empresariais, finanças pessoais, separação PF PJ, ferramenta financeira, empreendedores, MEI, contabilidade, organização financeira",
  authors: [{ name: "Clivus" }],
  creator: "Clivus",
  publisher: "Clivus",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000",
    title: "Clivus - Separe suas Finanças PF das PJ",
    description: "A ferramenta completa que todo empreendedor precisa para organizar finanças pessoais e empresariais. Por apenas R$ 97,00.",
    siteName: "Clivus",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clivus - Ferramenta Financeira",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clivus - Separe suas Finanças PF das PJ",
    description: "A ferramenta completa que todo empreendedor precisa para organizar finanças pessoais e empresariais. Por apenas R$ 97,00.",
    images: ["/og-image.png"],
    creator: "@clivus",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                style: {
                  background: "#10b981",
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#10b981",
                },
              },
              error: {
                style: {
                  background: "#ef4444",
                  color: "#fff",
                },
                iconTheme: {
                  primary: "#fff",
                  secondary: "#ef4444",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
