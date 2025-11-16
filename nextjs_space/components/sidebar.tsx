
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Package,
  ShoppingCart,
  UserCog,
  Crown,
  Monitor,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Tipos para os itens do menu
interface MenuItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  isGroup?: boolean;
  items?: {
    title: string;
    href: string;
    icon: LucideIcon;
  }[];
}

// Menu para clientes do Clivus (usuários normais) - Agrupado por funcionalidade
const clientMenuItems: MenuItem[] = [
  {
    title: "Início",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "💰 Financeiro",
    isGroup: true,
    items: [
      {
        title: "Transações",
        href: "/transactions",
        icon: CreditCard,
      },
      {
        title: "DRE",
        href: "/dre",
        icon: FileText,
      },
      {
        title: "Conciliação Bancária",
        href: "/reconciliation",
        icon: FileText,
      },
    ],
  },
  {
    title: "📈 Gestão",
    isGroup: true,
    items: [
      {
        title: "Pró-labore",
        href: "/prolabore",
        icon: Calculator,
      },
      {
        title: "Investimentos",
        href: "/investments",
        icon: TrendingUp,
      },
      {
        title: "Compliance Fiscal",
        href: "/compliance",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "Equipe",
    href: "/team",
    icon: Users,
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: FileText,
  },
];

// Menu para SuperAdmin (gestão do negócio Clivus)
const superAdminMenuItems: MenuItem[] = [
  {
    title: "Início",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Painel Admin",
    href: "/admin",
    icon: Crown,
  },
  {
    title: "Gerenciar Planos",
    href: "/admin/plans",
    icon: Package,
  },
  {
    title: "Gestão de Vendas",
    href: "/admin/sales",
    icon: ShoppingCart,
  },
  {
    title: "Anúncios",
    href: "/admin/ads",
    icon: Monitor,
  },
  {
    title: "Usuários do Sistema",
    href: "/admin",
    icon: UserCog,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  // Determina qual menu mostrar baseado na role do usuário
  const userRole = session?.user?.role || "user";
  const menuItems = userRole === "superadmin" ? superAdminMenuItems : clientMenuItems;

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-600" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 
          transition-transform duration-300 z-40 flex flex-col
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 w-64
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src="/logo-clivus.png"
                alt="Clivus"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-gray-800">Clivus</span>
              {userRole === "superadmin" && (
                <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full inline-block w-fit">
                  🔐 SuperAdmin
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            // Se for um grupo de itens
            if (item.isGroup && item.items) {
              return (
                <div key={`group-${index}`} className="space-y-1">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {item.title}
                  </div>
                  {item.items.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isActive = pathname === subItem.href;

                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 rounded-lg ml-2
                          transition-colors duration-200
                          ${
                            isActive
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }
                        `}
                      >
                        <SubIcon className="h-4 w-4" />
                        <span className="text-sm">{subItem.title}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            // Se for um item normal
            if (!item.href || !item.icon) return null;
            
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-colors duration-200
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}
