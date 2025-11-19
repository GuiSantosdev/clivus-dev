"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
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
} from "lucide-react";

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
          transition-all duration-300 z-40 flex flex-col
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          w-20 lg:w-64
          hover:w-64
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <Link href={userRole === "superadmin" ? "/admin" : "/dashboard"}>
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div className="hidden lg:block whitespace-nowrap overflow-hidden">
                <h1 className="font-bold text-lg text-gray-900">
                  {userRole === "superadmin" ? "SuperAdmin" : "Clivus"}
                </h1>
                <p className="text-xs text-gray-500">
                  {userRole === "superadmin" ? "Painel Admin" : "Gestão Financeira"}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuItems.map((group, groupIdx) => (
            <div key={groupIdx}>
              <h2 className="hidden lg:block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 px-2">
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
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-700 hover:bg-gray-100"
                          }
                        `}
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                        <div className="hidden lg:block whitespace-nowrap overflow-hidden">
                          <span className="text-sm">{item.name}</span>
                          <span className="block text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </span>
                        </div>

                        {/* Tooltip for collapsed state */}
                        <div className="lg:hidden absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {session?.user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div className="hidden lg:block flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email || ""}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            <span className="hidden lg:block text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
