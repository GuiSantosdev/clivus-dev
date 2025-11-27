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
import { User, Shield, Copy } from "lucide-react";

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
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-center mb-4 text-gray-700">
            🔑 Acessos de Teste
          </h3>
          
          {/* SuperAdmin */}
          <div className="mb-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-semibold text-theme">SuperAdmin</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-theme-muted">Email:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-card px-2 py-1 rounded text-xs">admin@clivus.com.br</code>
                  <button
                    onClick={() => copyToClipboard("admin@clivus.com.br", "Email")}
                    className="text-primary hover:text-primary/80"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-muted">Senha:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-card px-2 py-1 rounded text-xs">admin123</code>
                  <button
                    onClick={() => copyToClipboard("admin123", "Senha")}
                    className="text-primary hover:text-primary/80"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <Button
              onClick={() => fillCredentials("admin@clivus.com.br", "admin123")}
              className="w-full mt-3 bg-primary hover:bg-primary/90 text-white text-xs"
              size="sm"
            >
              Preencher Credenciais
            </Button>
          </div>

          {/* Cliente */}
          <div className="p-4 bg-gradient-to-r from-secondary/5 to-accent/5 rounded-lg border border-secondary/20">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-secondary" />
              <span className="font-semibold text-theme">Cliente</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-theme-muted">Email:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-card px-2 py-1 rounded text-xs">teste@teste.com</code>
                  <button
                    onClick={() => copyToClipboard("teste@teste.com", "Email")}
                    className="text-secondary hover:text-secondary/80"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-muted">Senha:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-card px-2 py-1 rounded text-xs">senha123</code>
                  <button
                    onClick={() => copyToClipboard("senha123", "Senha")}
                    className="text-secondary hover:text-secondary/80"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            <Button
              onClick={() => fillCredentials("teste@teste.com", "senha123")}
              className="w-full mt-3 bg-secondary hover:bg-secondary/90 text-white text-xs"
              size="sm"
            >
              Preencher Credenciais
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}