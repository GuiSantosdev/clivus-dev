"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";
import { User, Shield, Copy, Star, Crown, Zap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Credenciais inválidas");
      } else {
        toast.success("Login realizado com sucesso!");
        router.push(redirectUrl);
      }
    } catch (error) {
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const fillCredentials = (email: string, password: string) => {
    setFormData({ email, password });
    toast.success("Credenciais preenchidas!");
  };

  const quickLogin = async (email: string, password: string, roleName: string) => {
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Erro ao fazer login automático");
      } else {
        toast.success(`Bem-vindo, ${roleName}!`);
        router.push(redirectUrl);
      }
    } catch (error) {
      toast.error("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-clivus.png"
            alt="Clivus"
            width={150}
            height={64}
            className="h-16 w-auto"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">
          Entrar no Clivus
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="text-blue-600 hover:underline">
            Cadastre-se
          </Link>
        </p>

        {/* Acessos de Teste */}
        <div className="mt-6 pt-6 border-t border-theme">
          <h3 className="text-sm font-semibold text-center mb-4 text-theme">
            🔑 Login Rápido para Testes
          </h3>
          
          {/* SuperAdmin */}
          <div className="mb-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-semibold text-sm text-theme">SuperAdmin</span>
              </div>
              <span className="text-xs text-theme-muted">Gestão Total</span>
            </div>
            <div className="text-xs space-y-1 mb-2 text-theme-muted">
              <div><strong>Email:</strong> admin@clivus.com.br</div>
              <div><strong>Senha:</strong> admin123</div>
            </div>
            <Button
              onClick={() => quickLogin("admin@clivus.com.br", "admin123", "SuperAdmin")}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs h-8"
            >
              Entrar como SuperAdmin
            </Button>
          </div>

          {/* Cliente - Plano Básico */}
          <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-sm text-theme">Plano Básico</span>
              </div>
              <span className="text-xs text-theme-muted">R$ 97/mês</span>
            </div>
            <div className="text-xs space-y-1 mb-2 text-theme-muted">
              <div><strong>Email:</strong> basico@teste.com</div>
              <div><strong>Senha:</strong> senha123</div>
            </div>
            <Button
              onClick={() => quickLogin("basico@teste.com", "senha123", "Cliente - Plano Básico")}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-8"
            >
              Entrar como Básico
            </Button>
          </div>

          {/* Cliente - Plano Intermediário */}
          <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-sm text-theme">Plano Intermediário</span>
              </div>
              <span className="text-xs text-theme-muted">R$ 147/mês</span>
            </div>
            <div className="text-xs space-y-1 mb-2 text-theme-muted">
              <div><strong>Email:</strong> intermediario@teste.com</div>
              <div><strong>Senha:</strong> senha123</div>
            </div>
            <Button
              onClick={() => quickLogin("intermediario@teste.com", "senha123", "Cliente - Plano Intermediário")}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8"
            >
              Entrar como Intermediário
            </Button>
          </div>

          {/* Cliente - Plano Avançado */}
          <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="font-semibold text-sm text-theme">Plano Avançado</span>
              </div>
              <span className="text-xs text-theme-muted">R$ 297/mês</span>
            </div>
            <div className="text-xs space-y-1 mb-2 text-theme-muted">
              <div><strong>Email:</strong> avancado@teste.com</div>
              <div><strong>Senha:</strong> senha123</div>
            </div>
            <Button
              onClick={() => quickLogin("avancado@teste.com", "senha123", "Cliente - Plano Avançado")}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-xs h-8"
            >
              Entrar como Avançado
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}