
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-muted-soft">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <div className="bg-card rounded-lg shadow-lg p-8 md:p-12">
          <div className="flex items-center mb-8">
            <Shield className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Política de Privacidade
              </h1>
              <p className="text-gray-600 mt-2">
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Informações que Coletamos
              </h2>
              <p className="text-gray-700 leading-relaxed">
                A Clivus coleta as seguintes informações para fornecer nossos serviços:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Dados de Cadastro:</strong> Nome completo, CPF, CNPJ, email, telefone</li>
                <li><strong>Dados Financeiros:</strong> Transações, categorias, valores, datas</li>
                <li><strong>Dados de Pagamento:</strong> Processados por nossos parceiros (Asaas/Stripe) - não armazenamos dados de cartão</li>
                <li><strong>Dados de Uso:</strong> Como você utiliza nossa plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Como Usamos Suas Informações
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar pagamentos e emitir comprovantes</li>
                <li>Enviar notificações importantes sobre sua conta</li>
                <li>Cumprir obrigações legais e fiscais</li>
                <li>Prevenir fraudes e garantir a segurança</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Compartilhamento de Dados
              </h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>NÃO vendemos suas informações.</strong> Compartilhamos dados apenas com:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Processadores de Pagamento:</strong> Asaas e Stripe (conforme necessário para processar pagamentos)</li>
                <li><strong>Serviços de Email:</strong> Resend (para envio de emails transacionais)</li>
                <li><strong>Autoridades:</strong> Quando exigido por lei</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Segurança dos Dados
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Criptografia SSL/TLS para todas as comunicações</li>
                <li>Senhas criptografadas com bcrypt</li>
                <li>Acesso restrito aos dados por pessoal autorizado</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares e seguros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Seus Direitos (LGPD)
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Você tem direito a:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li><strong>Acessar</strong> seus dados pessoais</li>
                <li><strong>Corrigir</strong> dados incompletos ou incorretos</li>
                <li><strong>Solicitar</strong> a exclusão de seus dados</li>
                <li><strong>Revogar</strong> consentimento a qualquer momento</li>
                <li><strong>Portar</strong> seus dados para outro fornecedor</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Para exercer seus direitos, entre em contato: <strong>contato@clivus.com.br</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Utilizamos cookies apenas essenciais para:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Manter você logado</li>
                <li>Garantir a segurança da sessão</li>
                <li>Preferências de interface</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                Não utilizamos cookies de rastreamento ou publicidade.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Retenção de Dados
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Mantemos seus dados enquanto sua conta estiver ativa e por até <strong>5 anos</strong> após o encerramento, conforme exigido pela legislação brasileira para fins contábeis e fiscais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Alterações nesta Política
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Podemos atualizar esta política periodicamente. Notificaremos você por email sobre mudanças significativas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Contato
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Para questões sobre privacidade, entre em contato:
              </p>
              <div className="bg-muted-soft p-4 rounded-lg mt-4">
                <p className="text-gray-800">
                  <strong>Email:</strong> contato@clivus.com.br<br />
                  <strong>CNPJ:</strong> 39.956.528/0001-74
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
