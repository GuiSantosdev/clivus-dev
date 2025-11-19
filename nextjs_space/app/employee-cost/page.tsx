
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProtectedLayout } from "@/components/protected-layout";
import { Users, DollarSign, TrendingUp, AlertCircle, Calculator, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

interface CostBreakdown {
  salary: number;
  inss: number;
  fgts: number;
  vacation: number;
  thirteenthSalary: number;
  rat: number;
  educationSalary: number;
  systemS: number;
  transportation: number;
  meal: number;
  health: number;
  otherBenefits: number;
  totalCost: number;
  monthlyCost: number;
}

export default function EmployeeCostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Estados do formulário
  const [salary, setSalary] = useState("");
  const [variablePay, setVariablePay] = useState(""); // Média mensal de verbas variáveis
  const [transportation, setTransportation] = useState("");
  const [meal, setMeal] = useState("");
  const [health, setHealth] = useState("");
  const [otherBenefits, setOtherBenefits] = useState("");
  const [workDays, setWorkDays] = useState("22");

  // Estados calculados
  const [costs, setCosts] = useState<CostBreakdown>({
    salary: 0,
    inss: 0,
    fgts: 0,
    vacation: 0,
    thirteenthSalary: 0,
    rat: 0,
    educationSalary: 0,
    systemS: 0,
    transportation: 0,
    meal: 0,
    health: 0,
    otherBenefits: 0,
    totalCost: 0,
    monthlyCost: 0,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    calculateEmployeeCost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salary, variablePay, transportation, meal, health, otherBenefits, workDays]);

  const calculateEmployeeCost = () => {
    const salaryValue = parseFloat(salary) || 0;
    const variablePayValue = parseFloat(variablePay) || 0;
    const transportationValue = parseFloat(transportation) || 0;
    const mealValue = parseFloat(meal) || 0;
    const healthValue = parseFloat(health) || 0;
    const otherBenefitsValue = parseFloat(otherBenefits) || 0;
    const workDaysValue = parseInt(workDays) || 22;

    // Cálculo correto de férias conforme CLT
    // 1. Remuneração Mensal Base = Salário Base + Média de Verbas Variáveis
    const baseRemuneration = salaryValue + variablePayValue;
    // 2. Valor Mensal das Férias (1/12 avos)
    const vacationMonthly = baseRemuneration / 12;
    // 3. Adicional de 1/3 Constitucional Mensal
    const vacationThird = vacationMonthly / 3;
    // 4. Total Provisão Mensal de Férias
    const vacation = vacationMonthly + vacationThird;

    // Encargos obrigatórios (% sobre o salário base)
    const inss = salaryValue * 0.20; // INSS Patronal (20%)
    const fgts = salaryValue * 0.08; // FGTS (8%)
    const thirteenthSalary = baseRemuneration / 12; // 13º Salário sobre remuneração base
    const rat = salaryValue * 0.03; // RAT (Risco Ambiental do Trabalho - média 3%)
    const educationSalary = salaryValue * 0.025; // Salário Educação (2,5%)
    const systemS = salaryValue * 0.0358; // Sistema S (SESI, SENAI, SEBRAE, etc. - 3,58%)

    // Benefícios mensais
    const transportationCost = transportationValue * workDaysValue;
    const mealCost = mealValue * workDaysValue;

    // Custo total anual
    const annualSalary = salaryValue * 12;
    const annualEncargos = (inss + fgts + rat + educationSalary + systemS) * 12;
    const annualProvisions = vacation + thirteenthSalary;
    const annualBenefits = (transportationCost + mealCost + healthValue) * 12 + otherBenefitsValue * 12;
    const totalAnnualCost = annualSalary + annualEncargos + annualProvisions + annualBenefits;

    // Custo mensal médio (dividindo o custo anual por 12)
    const monthlyCost = totalAnnualCost / 12;

    setCosts({
      salary: salaryValue,
      inss,
      fgts,
      vacation: vacation / 12, // Rateado mensalmente
      thirteenthSalary: thirteenthSalary,
      rat,
      educationSalary,
      systemS,
      transportation: transportationCost,
      meal: mealCost,
      health: healthValue,
      otherBenefits: otherBenefitsValue,
      totalCost: totalAnnualCost,
      monthlyCost,
    });
  };

  const handleExport = () => {
    const data = `
CÁLCULO DE CUSTO REAL DO FUNCIONÁRIO
=====================================

SALÁRIO BASE
Salário Bruto: R$ ${costs.salary.toFixed(2)}

ENCARGOS TRABALHISTAS (sobre o salário)
INSS Patronal (20%): R$ ${costs.inss.toFixed(2)}
FGTS (8%): R$ ${costs.fgts.toFixed(2)}
RAT (3%): R$ ${costs.rat.toFixed(2)}
Salário Educação (2,5%): R$ ${costs.educationSalary.toFixed(2)}
Sistema S (3,58%): R$ ${costs.systemS.toFixed(2)}

PROVISÕES
Férias + 1/3 (mensal): R$ ${costs.vacation.toFixed(2)}
13º Salário (mensal): R$ ${costs.thirteenthSalary.toFixed(2)}

BENEFÍCIOS
Vale Transporte: R$ ${costs.transportation.toFixed(2)}
Vale Refeição: R$ ${costs.meal.toFixed(2)}
Plano de Saúde: R$ ${costs.health.toFixed(2)}
Outros Benefícios: R$ ${costs.otherBenefits.toFixed(2)}

CUSTO TOTAL
Custo Mensal Médio: R$ ${costs.monthlyCost.toFixed(2)}
Custo Anual: R$ ${costs.totalCost.toFixed(2)}
Multiplicador: ${costs.salary > 0 ? (costs.monthlyCost / costs.salary).toFixed(2) : 0}x

Gerado em ${new Date().toLocaleDateString('pt-BR')} pelo Clivus
    `.trim();

    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custo-funcionario.txt';
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado com sucesso!");
  };

  if (status === "loading") {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedLayout>
    );
  }

  const multiplier = costs.salary > 0 ? costs.monthlyCost / costs.salary : 0;

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Custo Real de Funcionário</h1>
            <p className="text-gray-600">Calcule o custo total de um funcionário CLT com todos os encargos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Salário e Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="salary">Salário Bruto Mensal (R$)</Label>
                    <Input
                      id="salary"
                      type="number"
                      step="0.01"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="0.00"
                      className="text-lg font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="variablePay">
                      Média de Verbas Variáveis (R$)
                      <span className="text-xs text-gray-500 ml-1">
                        (horas extras, comissões, etc.)
                      </span>
                    </Label>
                    <Input
                      id="variablePay"
                      type="number"
                      step="0.01"
                      value={variablePay}
                      onChange={(e) => setVariablePay(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workDays">Dias Trabalhados/Mês</Label>
                    <Input
                      id="workDays"
                      type="number"
                      value={workDays}
                      onChange={(e) => setWorkDays(e.target.value)}
                      placeholder="22"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <strong>Encargos Obrigatórios:</strong> INSS Patronal (20%), FGTS (8%), RAT (3%), 
                      Salário Educação (2,5%), Sistema S (3,58%), Férias, 13º Salário.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Benefícios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transportation">Vale Transporte (diário)</Label>
                    <Input
                      id="transportation"
                      type="number"
                      step="0.01"
                      value={transportation}
                      onChange={(e) => setTransportation(e.target.value)}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500">Valor por dia</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meal">Vale Refeição (diário)</Label>
                    <Input
                      id="meal"
                      type="number"
                      step="0.01"
                      value={meal}
                      onChange={(e) => setMeal(e.target.value)}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500">Valor por dia</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="health">Plano de Saúde (mensal)</Label>
                    <Input
                      id="health"
                      type="number"
                      step="0.01"
                      value={health}
                      onChange={(e) => setHealth(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otherBenefits">Outros Benefícios (mensal)</Label>
                    <Input
                      id="otherBenefits"
                      type="number"
                      step="0.01"
                      value={otherBenefits}
                      onChange={(e) => setOtherBenefits(e.target.value)}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500">Seguro de vida, gympass, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhamento dos custos */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento dos Custos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Encargos Trabalhistas</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">INSS Patronal (20%)</span>
                      <span className="font-medium">R$ {costs.inss.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">FGTS (8%)</span>
                      <span className="font-medium">R$ {costs.fgts.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RAT (3%)</span>
                      <span className="font-medium">R$ {costs.rat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salário Educação (2,5%)</span>
                      <span className="font-medium">R$ {costs.educationSalary.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sistema S (3,58%)</span>
                      <span className="font-medium">R$ {costs.systemS.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-2 space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Provisões</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Férias + 1/3 (rateio mensal)</span>
                      <span className="font-medium">R$ {costs.vacation.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">13º Salário (rateio mensal)</span>
                      <span className="font-medium">R$ {costs.thirteenthSalary.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-2 space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700">Benefícios</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vale Transporte</span>
                      <span className="font-medium">R$ {costs.transportation.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vale Refeição</span>
                      <span className="font-medium">R$ {costs.meal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plano de Saúde</span>
                      <span className="font-medium">R$ {costs.health.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Outros Benefícios</span>
                      <span className="font-medium">R$ {costs.otherBenefits.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <div className="space-y-6">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Calculator className="h-5 w-5" />
                  Custo Total
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Custo Mensal Médio</p>
                  <div className="text-4xl font-bold text-blue-600">
                    R$ {costs.monthlyCost.toFixed(2)}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salário base:</span>
                    <span className="font-semibold">R$ {costs.salary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Custo anual:</span>
                    <span className="font-semibold">R$ {costs.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Multiplicador:</span>
                    <span className="text-lg font-bold text-indigo-600">{multiplier.toFixed(2)}x</span>
                  </div>
                </div>

                <div className="bg-white border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    <strong>Multiplicador:</strong> Para cada R$ 1,00 de salário, você paga R$ {multiplier.toFixed(2)} 
                    considerando todos os encargos e benefícios.
                  </p>
                </div>

                <Button onClick={handleExport} className="w-full" variant="default">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Exportar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-800">
                    <p className="font-semibold mb-2">Importante:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>RAT varia de 1% a 3% conforme o risco da atividade</li>
                      <li>Vale transporte tem desconto de 6% no salário do funcionário</li>
                      <li>Valores considerados são médias para CLT</li>
                      <li>Consult sempre um contador para cálculos precisos</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
