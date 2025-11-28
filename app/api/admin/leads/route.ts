
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Validar sessão e role de superadmin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    // 1. Buscar leads da landing page
    const landingPageLeads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 2. Buscar usuários cadastrados sem pagamento
    const unpaidUsers = await prisma.user.findMany({
      where: {
        hasAccess: false,
        role: "user", // Não incluir admins/superadmins
      },
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 3. Combinar e formatar dados
    const combinedLeads = [
      // Leads da landing page
      ...landingPageLeads.map((lead: any) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        cnpj: lead.cnpj,
        businessArea: lead.businessArea,
        source: "landing_page",
        status: "novo", // Ainda não se cadastrou
        createdAt: lead.createdAt,
        lastCheckoutAttempt: null,
        type: "lead",
      })),
      // Usuários sem pagamento
      ...unpaidUsers.map((user: any) => {
        // Determinar status baseado em pagamentos
        let status = user.leadStatus || "registered";
        
        if (user.payments && user.payments.length > 0) {
          const lastPayment = user.payments[0];
          if (lastPayment.status === "pending") {
            status = "payment_pending";
          } else if (lastPayment.status === "failed") {
            status = "payment_failed";
          }
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          cnpj: user.cnpj,
          businessArea: user.businessArea,
          source: "cadastro",
          status,
          createdAt: user.createdAt,
          lastCheckoutAttempt: user.lastCheckoutAttempt,
          lastPaymentStatus: user.payments[0]?.status,
          lastPaymentAmount: user.payments[0]?.amount,
          type: "user",
        };
      }),
    ];

    // Ordenar por data de criação (mais recentes primeiro)
    combinedLeads.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Estatísticas
    const stats = {
      totalLeads: combinedLeads.length,
      landingPageLeads: landingPageLeads.length,
      registeredUsers: unpaidUsers.length,
      checkoutStarted: unpaidUsers.filter((u: any) => u.lastCheckoutAttempt).length,
      paymentPending: unpaidUsers.filter((u: any) => 
        u.payments && u.payments[0]?.status === "pending"
      ).length,
    };

    return NextResponse.json({
      leads: combinedLeads,
      stats,
    });
  } catch (error: any) {
    console.error("Erro ao buscar leads:", error);
    return NextResponse.json(
      { error: "Erro ao buscar leads" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Validar sessão e role de superadmin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "superadmin") {
      return NextResponse.json(
        { error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json(
        { error: "ID e tipo são obrigatórios" },
        { status: 400 }
      );
    }

    // Excluir lead da landing page
    if (type === "lead") {
      await prisma.lead.delete({
        where: { id },
      });
    } 
    // Excluir usuário não pagante
    else if (type === "user") {
      // Primeiro, excluir pagamentos relacionados
      await prisma.payment.deleteMany({
        where: { userId: id },
      });
      
      // Depois, excluir o usuário
      await prisma.user.delete({
        where: { id },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Lead excluído com sucesso",
    });
  } catch (error: any) {
    console.error("Erro ao excluir lead:", error);
    return NextResponse.json(
      { error: "Erro ao excluir lead" },
      { status: 500 }
    );
  }
}
