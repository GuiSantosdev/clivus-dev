
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "superadmin") {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { to, type } = await request.json();

    // Verifica variáveis de ambiente
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465');
    const emailFrom = process.env.EMAIL_FROM;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { 
          error: "SMTP não configurado",
          details: "Adicione SMTP_USER e SMTP_PASS no arquivo .env e reinicie o servidor"
        },
        { status: 400 }
      );
    }

    if (!emailFrom) {
      return NextResponse.json(
        { 
          error: "EMAIL_FROM não configurado",
          details: "Adicione EMAIL_FROM no arquivo .env (ex: contato@seudominio.com)"
        },
        { status: 400 }
      );
    }

    if (!to) {
      return NextResponse.json(
        { 
          error: "E-mail de destino não informado",
          details: "Configure ADMIN_EMAIL no arquivo .env"
        },
        { status: 400 }
      );
    }

    // Configura transporte SMTP
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: true, // SSL/TLS
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Envia e-mail de teste
    const result = await transporter.sendMail({
      from: emailFrom,
      to: to,
      subject: "🧪 Teste de Configuração - Clivus",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .checklist { list-style: none; padding: 0; }
              .checklist li { padding: 8px 0; }
              .checklist li:before { content: "✅ "; color: #28a745; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 E-mail de Teste</h1>
                <p>Sistema Clivus</p>
              </div>
              
              <div class="content">
                <div class="success">
                  <h2>✅ Configuração Funcionando!</h2>
                  <p>Se você está lendo este e-mail, significa que o sistema de envio de e-mails está configurado corretamente.</p>
                </div>

                <h3>📋 Checklist de Configuração:</h3>
                <ul class="checklist">
                  <li><strong>SMTP_USER</strong> configurado (${smtpUser})</li>
                  <li><strong>SMTP_PASS</strong> configurado</li>
                  <li><strong>SMTP_HOST</strong> configurado (${smtpHost})</li>
                  <li><strong>SMTP_PORT</strong> configurado (${smtpPort})</li>
                  <li><strong>EMAIL_FROM</strong> configurado</li>
                  <li><strong>ADMIN_EMAIL</strong> configurado</li>
                  <li>Servidor Next.js reiniciado</li>
                  <li>E-mail de teste enviado com sucesso</li>
                </ul>

                <div class="info">
                  <h3>🔔 Quando os E-mails São Enviados?</h3>
                  <ol>
                    <li><strong>Após pagamento aprovado:</strong> Via webhook do Stripe ou Asaas</li>
                    <li><strong>Reenvio manual:</strong> SuperAdmin pode reenviar credenciais</li>
                    <li><strong>NÃO envia:</strong> Imediatamente após cadastro (apenas após pagamento)</li>
                  </ol>
                </div>

                <h3>📧 Tipos de E-mail Enviados:</h3>
                <ul>
                  <li><strong>Boas-vindas com credenciais:</strong> Enviado ao cliente após pagamento</li>
                  <li><strong>Notificação de venda:</strong> Enviado ao admin após cada compra</li>
                  <li><strong>E-mail de teste:</strong> Este que você está lendo agora</li>
                </ul>

                <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <strong>Data/Hora do Teste:</strong> ${new Date().toLocaleString('pt-BR', { 
                    timeZone: 'America/Sao_Paulo' 
                  })}
                </p>
              </div>

              <div class="footer">
                <p>Este é um e-mail de teste automático do sistema Clivus</p>
                <p>© ${new Date().getFullYear()} Clivus - Gestão Financeira</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    console.log("✅ [Test Email] E-mail enviado com sucesso:", result.messageId);

    return NextResponse.json({
      message: "E-mail de teste enviado com sucesso!",
      emailId: result.messageId,
      to: to,
      from: emailFrom,
      timestamp: new Date().toISOString(),
      smtpHost: smtpHost,
      smtpPort: smtpPort
    });

  } catch (error: any) {
    console.error("❌ [Test Email] Erro ao enviar:", error);

    // Erros comuns do SMTP
    if (error.message?.includes("authentication") || error.message?.includes("Invalid login")) {
      return NextResponse.json(
        { 
          error: "Credenciais SMTP inválidas",
          details: "Verifique se SMTP_USER e SMTP_PASS estão corretos no arquivo .env"
        },
        { status: 400 }
      );
    }

    if (error.message?.includes("ECONNREFUSED") || error.message?.includes("connection")) {
      return NextResponse.json(
        { 
          error: "Erro de conexão com servidor SMTP",
          details: "Verifique se o host e porta estão corretos (smtp.hostinger.com:465)"
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: "Erro ao enviar e-mail de teste",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
