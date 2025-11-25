
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  ArrowLeft, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Scale
} from "lucide-react";
import Link from "next/link";

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  status: "ok" | "warning" | "error";
  dueDate?: string;
  action?: string;
}

export default function CompliancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadComplianceChecks();
    }
  }, [status, router]);

  const loadComplianceChecks = () => {
    // Simulação de verificações de compliance
    const items: ComplianceItem[] = [
      {
        id: "1",
        title: "Separação PF/PJ",
        description: "Suas contas CPF e CNPJ estão devidamente separadas",
        status: "ok",
      },
      {
        id: "2",
        title: "Declaração de IRPF",
        description: "Prazo de entrega da declaração de Imposto de Renda",
        status: "warning",
        dueDate: "30/04/2026",
        action: "Prepare sua declaração com antecedência",
      },
      {
        id: "3",
        title: "Emissão de Notas Fiscais",
        description: "Todas as transações do CNPJ devem ter nota fiscal",
        status: "ok",
      },
      {
        id: "4",
        title: "Pagamento de INSS",
        description: "Pró-labore com INSS em dia",
        status: "ok",
      },
      {
        id: "5",
        title: "Declaração Mensal - DASN-SIMEI",
        description: "MEI deve declarar faturamento mensal",
        status: "warning",
        dueDate: "20/11/2025",
        action: "Acesse o Portal do Simples Nacional",
      },
      {
        id: "6",
        title: "Limite de Faturamento MEI",
        description: "Faturamento anual não deve ultrapassar R$ 81.000,00",
        status: "ok",
      },
      {
        id: "7",
        title: "Mistura de Contas PF/PJ",
        description: "Verifique se não há transferências irregulares entre contas",
        status: "ok",
      },
      {
        id: "8",
        title: "Backup de Documentos",
        description: "Mantenha cópias de todos os comprovantes e notas fiscais",
        status: "ok",
      },
    ];

    setComplianceItems(items);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-theme-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  const okCount = complianceItems.filter((item) => item.status === "ok").length;
  const warningCount = complianceItems.filter((item) => item.status === "warning").length;
  const errorCount = complianceItems.filter((item) => item.status === "error").length;
  const totalCount = complianceItems.length;
  const compliancePercentage = Math.round((okCount / totalCount) * 100);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-theme">Compliance Fiscal</h1>
        <p className="text-theme-muted mt-2">Monitore suas obrigações fiscais e mantenha-se em conformidade</p>
      </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-theme-muted">
                Status Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-theme">
                    {compliancePercentage}%
                  </p>
                  <p className="text-xs text-theme-muted mt-1">Em conformidade</p>
                </div>
                <ShieldCheck
                  className={`h-12 w-12 ${
                    compliancePercentage >= 80
                      ? "text-green-600"
                      : compliancePercentage >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-theme-muted">
                Em Conformidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">{okCount}</p>
                  <p className="text-xs text-theme-muted mt-1">de {totalCount} itens</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-theme-muted">
                Requer Atenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-yellow-600">
                    {warningCount + errorCount}
                  </p>
                  <p className="text-xs text-theme-muted mt-1">alertas ativos</p>
                </div>
                <AlertTriangle className="h-12 w-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scale className="h-5 w-5 text-blue-600" />
              <span>Verificações de Compliance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-2 ${
                    item.status === "ok"
                      ? "bg-green-50 border-green-200"
                      : item.status === "warning"
                      ? "bg-yellow-50 border-yellow-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {item.status === "ok" ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : item.status === "warning" ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-theme">{item.title}</h3>
                        <p className="text-sm text-theme-muted mt-1">{item.description}</p>
                        {item.dueDate && (
                          <div className="flex items-center mt-2 text-sm text-theme">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Prazo: {item.dueDate}</span>
                          </div>
                        )}
                        {item.action && (
                          <p className="text-sm font-medium text-blue-600 mt-2">
                            → {item.action}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Dicas de Compliance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-theme">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p>
                  <strong>Nunca misture CPF e CNPJ:</strong> Mantenha contas bancárias separadas
                  e registre todas as transferências corretamente.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p>
                  <strong>Emita sempre notas fiscais:</strong> Todas as receitas do CNPJ devem
                  ter nota fiscal emitida.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p>
                  <strong>Declare corretamente:</strong> Pró-labore e distribuição de lucros
                  têm tratamentos fiscais diferentes.
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <p>
                  <strong>Guarde comprovantes:</strong> Mantenha todos os documentos organizados
                  por pelo menos 5 anos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
