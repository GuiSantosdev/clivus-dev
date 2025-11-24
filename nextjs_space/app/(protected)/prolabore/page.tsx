
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, ArrowLeft, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProlaborePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    faturamentoBruto: "",
    custosFuncionarios: "",
    custosOperacionais: "",
    margemLucro: "10",
  });
  const [resultado, setResultado] = useState<{
    prolabore: number;
    inss: number;
    ir: number;
    liquido: number;
  } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const calcularProlabore = () => {
    setLoading(true);
    
    try {
      const faturamento = parseFloat(formData.faturamentoBruto) || 0;
      const custosFuncionarios = parseFloat(formData.custosFuncionarios) || 0;
      const custosOperacionais = parseFloat(formData.custosOperacionais) || 0;
      const margemLucro = parseFloat(formData.margemLucro) || 10;

      // Cálculo baseado na legislação brasileira
      const lucroLiquido = faturamento - custosFuncionarios - custosOperacionais;
      const valorProlabore = lucroLiquido * (margemLucro / 100);

      // INSS: 11% sobre o valor do pró-labore
      const inss = valorProlabore * 0.11;

      // IR simplificado (base de cálculo)
      let ir = 0;
      if (valorProlabore > 4664.68) {
        ir = (valorProlabore - 4664.68) * 0.275 - 869.36;
      } else if (valorProlabore > 3751.05) {
        ir = (valorProlabore - 3751.05) * 0.225 - 636.13;
      } else if (valorProlabore > 2826.65) {
        ir = (valorProlabore - 2826.65) * 0.15 - 354.80;
      } else if (valorProlabore > 2112.00) {
        ir = (valorProlabore - 2112.00) * 0.075 - 158.40;
      }

      const liquido = valorProlabore - inss - Math.max(ir, 0);

      setResultado({
        prolabore: valorProlabore,
        inss,
        ir: Math.max(ir, 0),
        liquido,
      });

      toast.success("Cálculo realizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao calcular pró-labore");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Calculadora de Pró-labore</h1>
        <p className="text-gray-600 mt-2">Calcule o pró-labore ideal conforme a legislação brasileira</p>
      </div>

        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">O que é Pró-labore?</p>
                <p>
                  O pró-labore é a remuneração dos sócios que trabalham na empresa. 
                  Diferente do lucro distribuído, ele é obrigatório e incide INSS e IR.
                  Esta calculadora usa as alíquotas vigentes da legislação brasileira.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                <span>Dados da Empresa</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Faturamento Bruto Mensal (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.faturamentoBruto}
                  onChange={(e) =>
                    setFormData({ ...formData, faturamentoBruto: e.target.value })
                  }
                  placeholder="Ex: 50000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Custos com Funcionários (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custosFuncionarios}
                  onChange={(e) =>
                    setFormData({ ...formData, custosFuncionarios: e.target.value })
                  }
                  placeholder="Ex: 15000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Custos Operacionais (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custosOperacionais}
                  onChange={(e) =>
                    setFormData({ ...formData, custosOperacionais: e.target.value })
                  }
                  placeholder="Ex: 20000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Margem para Pró-labore (%)
                </label>
                <Input
                  type="number"
                  step="1"
                  value={formData.margemLucro}
                  onChange={(e) =>
                    setFormData({ ...formData, margemLucro: e.target.value })
                  }
                  placeholder="Ex: 10"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Percentual do lucro líquido destinado ao pró-labore
                </p>
              </div>

              <Button
                onClick={calcularProlabore}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Calculando..." : "Calcular Pró-labore"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span>Resultado</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resultado ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Pró-labore Bruto</p>
                    <p className="text-3xl font-bold text-green-600">
                      R$ {resultado.prolabore.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">INSS (11%)</span>
                      <span className="font-semibold text-red-600">
                        - R$ {resultado.inss.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">IR (Simplificado)</span>
                      <span className="font-semibold text-red-600">
                        - R$ {resultado.ir.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <span className="font-semibold text-gray-900">Valor Líquido</span>
                      <span className="text-xl font-bold text-blue-600">
                        R$ {resultado.liquido.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-xs text-gray-600">
                      Este cálculo é uma estimativa. Consulte seu contador para valores exatos
                      considerando sua situação específica.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Preencha os dados e clique em "Calcular" para ver o resultado
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Como funciona o cálculo?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p>
                  <strong>1. Lucro Líquido:</strong> Faturamento - Custos com Funcionários - Custos Operacionais
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p>
                  <strong>2. Pró-labore:</strong> Percentual do lucro líquido definido pelo sócio
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p>
                  <strong>3. INSS:</strong> 11% sobre o valor do pró-labore (contribuição obrigatória)
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p>
                  <strong>4. IR:</strong> Imposto de Renda calculado pela tabela progressiva
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
