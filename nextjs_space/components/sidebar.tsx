"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  Shield,
  Briefcase,
  LogOut,
  Settings as SettingsIcon,
  Menu,
  X,
  Package,
  ShoppingCart,
  CreditCard,
  Mail,
  Calendar,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Palette,
} from "lucide-react";
import { ThemeSelector } from "./theme/ThemeSelector";

const clientMenuItems = [
  {
    group: "Principal",
    items: [
      {
        name: "Início",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "Visão geral das finanças",
      },
    ],
  },
  {
    group: "Financeiro",
    items: [
      {
        name: "Transações",
        href: "/transactions",
        icon: ArrowLeftRight,
        description: "Lançamentos PF e PJ",
      },
      {
        name: "Planejamento",
        href: "/planej",
        icon: Calendar,
        description: "Previsto x Realizado",
      },
      {
        name: "Conciliação",
        href: "/reconciliation",
        icon: FileText,
        description: "Importar extrato",
      },
      {
        name: "DRE",
        href: "/dre",
        icon: BarChart3,
        description: "Demonstrativo de Resultados",
      },
      {
        name: "Relatórios",
        href: "/reports",
        icon: PieChart,
        description: "Análises e gráficos",
      },
    ],
  },
  {
    group: "Ferramentas",
    items: [
      {
        name: "Investimentos",
        href: "/investments",
        icon: TrendingUp,
        description: "Controle de investimentos",
      },
      {
        name: "Pró-labore",
        href: "/prolabore",
        icon: DollarSign,
        description: "Calculadora",
      },
      {
        name: "Precificação",
        href: "/pricing",
        icon: DollarSign,
        description: "Calcular preços",
      },
      {
        name: "Custo Funcionário",
        href: "/employee-cost",
        icon: Users,
        description: "Calcular custos CLT",
      },
      {
        name: "Compliance",
        href: "/compliance",
        icon: Shield,
        description: "Conformidade fiscal",
      },
    ],
  },
  {
    group: "Gestão",
    items: [
      {
        name: "Equipe",
        href: "/team",
        icon: Users,
        description: "Multi-usuário",
      },
    ],
  },
];

const superAdminMenuItems = [
  {
    group: "SuperAdmin",
    items: [
      {
        name: "Início",
        href: "/admin",
        icon: LayoutDashboard,
        description: "Dashboard SuperAdmin",
      },
      {
        name: "Clientes Pagantes",
        href: "/admin/clients",
        icon: Users,
        description: "Gerenciar clientes ativos",
      },
      {
        name: "Leads & Remarketing",
        href: "/admin/leads",
        icon: Mail,
        description: "Funil de vendas",
      },
      {
        name: "Vendas",
        href: "/admin/sales",
        icon: ShoppingCart,
        description: "Pagamentos e credenciais",
      },
      {
        name: "Planos",
        href: "/admin/plans",
        icon: Package,
        description: "Gerenciar planos",
      },
      {
        name: "Gateways",
        href: "/admin/gateways",
        icon: CreditCard,
        description: "Pagamento (Asaas/Stripe)",
      },
      {
        name: "Anúncios",
        href: "/admin/ads",
        icon: BarChart3,
        description: "Gerenciar ads",
      },
      {
        name: "Temas",
        href: "/admin/theme-config",
        icon: Palette,
        description: "Personalização visual",
      },
      {
        name: "Configurações",
        href: "/admin/settings",
        icon: SettingsIcon,
        description: "Sistema e emails",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();

  // Determina qual menu mostrar baseado na role do usuário
  const userRole = session?.user?.role || "user";
  const menuItems = userRole === "superadmin" ? superAdminMenuItems : clientMenuItems;

  // Carrega preferência do localStorage ao montar
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-state");
    if (savedState === "collapsed") {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, []);

  // Persiste o estado quando muda
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-state", newState ? "collapsed" : "expanded");
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
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

      {/* Sidebar - Fixo no desktop, recolhível no mobile */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-sidebar border-r border-theme
          transition-all duration-300 z-40 flex flex-col
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "lg:w-[92px]" : "lg:w-[268px]"}
          w-[268px]
        `}
      >
        {/* Logo + Collapse Button */}
        <div className="p-4 border-b border-theme relative">
          <Link href={userRole === "superadmin" ? "/admin" : "/dashboard"}>
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "lg:hidden" : "lg:block"}`}>
                <h1 className="font-bold text-lg text-sidebar">
                  {userRole === "superadmin" ? "SuperAdmin" : "Clivus"}
                </h1>
                <p className="text-xs text-theme-muted">
                  {userRole === "superadmin" ? "Painel Admin" : "Gestão Financeira"}
                </p>
              </div>
            </div>
          </Link>

          {/* Botão Toggle (Desktop) */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full items-center justify-center transition-all shadow-theme-md bg-card text-theme border border-theme hover:bg-sidebar-hover hover:border-primary hover:text-primary z-50"
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuItems.map((group, groupIdx) => (
            <div key={groupIdx}>
              <h2 className={`text-xs font-semibold text-theme-muted uppercase tracking-wide mb-3 px-2 transition-all duration-300 ${isCollapsed ? "lg:hidden" : "lg:block"}`}>
                {group.group}
              </h2>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg
                          transition-all duration-200 group relative
                          ${
                            isActive
                              ? "bg-sidebar-active text-primary font-medium"
                              : "text-theme hover:bg-sidebar-hover"
                          }
                          ${isCollapsed ? "lg:justify-center" : ""}
                        `}
                        title={isCollapsed ? item.name : ""}
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-primary" : "text-sidebar-icon"}`} />
                        <div className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "lg:hidden" : "lg:block"}`}>
                          <span className="text-sm">{item.name}</span>
                          <span className="block text-xs text-theme-muted mt-0.5">
                            {item.description}
                          </span>
                        </div>

                        {/* Tooltip para menu recolhido (Desktop) */}
                        {isCollapsed && (
                          <div className="hidden lg:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {item.name}
                            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                          </div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Theme Selector */}
        <div className={`border-t border-gray-200/50 p-4 ${isCollapsed ? "lg:flex lg:justify-center" : ""}`}>
          {!isCollapsed ? (
            <div className="lg:block">
              <p className="text-xs font-semibold text-theme-muted uppercase tracking-wider mb-2">
                Aparência
              </p>
              <ThemeSelector />
            </div>
          ) : (
            <div className="lg:flex lg:justify-center">
              <ThemeSelector />
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200/50 p-4">
          <div className={`flex items-center gap-3 mb-3 ${isCollapsed ? "lg:justify-center" : ""}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {session?.user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? "lg:hidden" : "lg:block"}`}>
              <p className="text-sm font-medium text-theme truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-xs text-theme-muted truncate">
                {session?.user?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${isCollapsed ? "lg:justify-center" : ""}`}
            title={isCollapsed ? "Sair" : ""}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className={`text-sm font-medium transition-all duration-300 ${isCollapsed ? "lg:hidden" : "lg:block"}`}>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
