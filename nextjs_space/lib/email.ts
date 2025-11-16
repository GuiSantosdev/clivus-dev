
import { Resend } from 'resend';

// Inicializar Resend com a chave da API
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendWelcomeEmailParams {
  to: string;
  name: string;
  email: string;
  password: string;
  planName: string;
}

export async function sendWelcomeEmail({
  to,
  name,
  email,
  password,
  planName,
}: SendWelcomeEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Clivus <noreply@clivus.com.br>',
      to: [to],
      subject: '🎉 Bem-vindo ao Clivus! Seus dados de acesso',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bem-vindo ao Clivus</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Bem-vindo ao Clivus!</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                          Olá <strong>${name}</strong>,
                        </p>
                        
                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                          Parabéns! Sua compra do plano <strong>${planName}</strong> foi confirmada com sucesso. 🎊
                        </p>
                        
                        <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                          Abaixo estão seus dados de acesso à plataforma Clivus:
                        </p>
                        
                        <!-- Access Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 2px solid #10b981; border-radius: 8px; margin: 0 0 30px 0;">
                          <tr>
                            <td style="padding: 25px;">
                              <p style="color: #374151; font-size: 14px; margin: 0 0 15px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                                📧 Seus Dados de Acesso
                              </p>
                              
                              <table width="100%" cellpadding="8" cellspacing="0">
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; font-weight: 600; width: 100px;">E-mail:</td>
                                  <td style="color: #111827; font-size: 14px; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 8px 12px; border-radius: 4px;">
                                    ${email}
                                  </td>
                                </tr>
                                <tr>
                                  <td style="color: #6b7280; font-size: 14px; font-weight: 600; padding-top: 10px;">Senha:</td>
                                  <td style="color: #111827; font-size: 14px; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 8px 12px; border-radius: 4px;">
                                    ${password}
                                  </td>
                                </tr>
                              </table>
                              
                              <p style="color: #dc2626; font-size: 13px; margin: 15px 0 0 0; line-height: 1.5;">
                                ⚠️ <strong>Importante:</strong> Altere sua senha após o primeiro acesso para garantir a segurança da sua conta.
                              </p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                          <tr>
                            <td align="center">
                              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://clivus.com.br'}/login" 
                                 style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                                🚀 Acessar Plataforma
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- Features -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                          <tr>
                            <td>
                              <p style="color: #065f46; font-size: 14px; font-weight: bold; margin: 0 0 15px 0;">
                                ✅ O que você pode fazer agora:
                              </p>
                              <ul style="color: #047857; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                                <li>Separar suas finanças pessoais (CPF) e empresariais (CNPJ)</li>
                                <li>Controlar receitas e despesas de forma organizada</li>
                                <li>Gerar relatórios financeiros completos</li>
                                <li>Garantir conformidade fiscal e evitar problemas com a Receita Federal</li>
                                <li>Acessar de qualquer dispositivo (web e mobile)</li>
                              </ul>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                          Precisa de ajuda? Nossa equipe está disponível para te auxiliar!
                        </p>
                        
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                          📧 <a href="mailto:suporte@clivus.com.br" style="color: #10b981; text-decoration: none;">suporte@clivus.com.br</a>
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
                          © 2025 Clivus. Todos os direitos reservados.
                        </p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                          Ferramenta financeira para empreendedores, MEIs e pequenos negócios.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

interface SendPurchaseNotificationParams {
  userName: string;
  userEmail: string;
  planName: string;
  planPrice: number;
}

export async function sendAdminPurchaseNotification({
  userName,
  userEmail,
  planName,
  planPrice,
}: SendPurchaseNotificationParams) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@clivus.com.br';
    
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Clivus <noreply@clivus.com.br>',
      to: [adminEmail],
      subject: `🎉 Nova venda: ${planName} - R$ ${planPrice}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Nova Venda</title>
          </head>
          <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px;">
              <h2 style="color: #10b981; margin-bottom: 20px;">🎉 Nova Venda Realizada!</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Cliente:</td>
                  <td style="padding: 10px 0; color: #111827;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">E-mail:</td>
                  <td style="padding: 10px 0; color: #111827;">${userEmail}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Plano:</td>
                  <td style="padding: 10px 0; color: #111827;">${planName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Valor:</td>
                  <td style="padding: 10px 0; color: #10b981; font-size: 18px; font-weight: bold;">R$ ${planPrice.toFixed(2)}</td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Os dados de acesso foram enviados automaticamente para o cliente.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending admin notification:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error };
  }
}
