
/**
 * Utilitário para verificar limites de funcionalidades dos planos
 */

import { prisma } from "@/lib/db";

export interface PlanLimits {
  [key: string]: number;
}

/**
 * Busca os limites de funcionalidades de um usuário baseado no seu plano ativo
 */
export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  try {
    // Buscar o último pagamento completo do usuário
    const payment = await prisma.payment.findFirst({
      where: {
        userId,
        status: "completed",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        planDetails: {
          include: {
            planFeatures: true,
          },
        },
      },
    });

    if (!payment || !payment.planDetails) {
      // Retornar limites padrão (tudo desabilitado) se não houver pagamento
      return getDefaultLimits();
    }

    // Converter funcionalidades do plano em um mapa
    const limits: PlanLimits = {};
    payment.planDetails.planFeatures.forEach((feature: any) => {
      if (feature.enabled) {
        limits[feature.featureKey] = feature.limit;
      } else {
        limits[feature.featureKey] = 0;
      }
    });

    return limits;
  } catch (error) {
    console.error("Error fetching user plan limits:", error);
    return getDefaultLimits();
  }
}

/**
 * Verifica se o usuário pode usar uma funcionalidade específica
 */
export async function checkFeatureAccess(
  userId: string,
  featureKey: string
): Promise<{ allowed: boolean; limit: number; message?: string }> {
  const limits = await getUserPlanLimits(userId);
  const limit = limits[featureKey] ?? 0;

  if (limit === 0) {
    return {
      allowed: false,
      limit,
      message: "Esta funcionalidade não está disponível no seu plano atual.",
    };
  }

  if (limit === -1) {
    return {
      allowed: true,
      limit,
      message: "Acesso ilimitado.",
    };
  }

  return {
    allowed: true,
    limit,
  };
}

/**
 * Verifica se o usuário atingiu o limite de uso de uma funcionalidade
 */
export async function checkUsageLimit(
  userId: string,
  featureKey: string,
  currentUsage: number
): Promise<{ allowed: boolean; limit: number; remaining: number; message?: string }> {
  const access = await checkFeatureAccess(userId, featureKey);

  if (!access.allowed) {
    return {
      allowed: false,
      limit: access.limit,
      remaining: 0,
      message: access.message,
    };
  }

  if (access.limit === -1) {
    return {
      allowed: true,
      limit: -1,
      remaining: -1,
      message: "Acesso ilimitado.",
    };
  }

  const remaining = access.limit - currentUsage;

  if (remaining <= 0) {
    return {
      allowed: false,
      limit: access.limit,
      remaining: 0,
      message: `Você atingiu o limite de ${access.limit} para esta funcionalidade. Faça upgrade do seu plano para continuar.`,
    };
  }

  return {
    allowed: true,
    limit: access.limit,
    remaining,
  };
}

/**
 * Conta o uso mensal de uma funcionalidade
 */
export async function getMonthlyUsage(
  userId: string,
  featureKey: string
): Promise<number> {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    switch (featureKey) {
      case "transactions_monthly":
        return await prisma.transaction.count({
          where: {
            userId,
            createdAt: {
              gte: firstDayOfMonth,
            },
          },
        });

      case "dre_reports_monthly":
        // Implementar contador de relatórios DRE quando necessário
        return 0;

      default:
        return 0;
    }
  } catch (error) {
    console.error("Error counting usage:", error);
    return 0;
  }
}

/**
 * Retorna limites padrão (tudo desabilitado)
 */
function getDefaultLimits(): PlanLimits {
  return {
    transactions_monthly: 0,
    team_members: 0,
    dre_reports_monthly: 0,
    attachments_per_transaction: 0,
    export_csv: 0,
    export_pdf: 0,
    prolabore_calculator: 0,
    compliance_alerts: 0,
    investment_tracking: 0,
    custom_categories: 0,
    priority_support: 0,
  };
}
