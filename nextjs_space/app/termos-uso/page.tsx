
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link href="/">
          <Button variant="outline" size="sm" className="mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="flex items-center mb-8">
            <FileText className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Termos de Uso
              </h1>
              <p className="text-gray-600 mt-2">
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Aceitação dos Termos
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Ao acessar e usar o Clivus, você concorda com estes Termos de Uso e nossa Política de Privacidade. Se não concordar, não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Descrição do Serviço
              </h2>
              <p className="text-gray-700 leading-relaxed">
                O Clivus é uma ferramenta de gestão financeira que permite:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Separação de finanças pessoais (CPF) e empresariais (CNPJ)</li>
                <li>Controle de transações, receitas e despesas</li>
                <li>Geração de relatórios financeiros</li>
                <li>Calculadoras (pró-labore, custo de funcionários, precificação)</li>
                <li>Planejamento financeiro (Previsto x Realizado)</li>
                <li>Conciliação bancária</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Cadastro e Conta
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Para usar o Clivus, você deve:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Ter pelo menos 18 anos</li>
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Manter a confidencialidade de sua senha</li>
                <li>Ser responsável por todas as atividades em sua conta</li>
                <li>Notificar-nos imediatamente sobre uso não autorizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Planos e Pagamento
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                4.1. Modelo de Pagamento
              </h3>
              <p className="text-gray-700 leading-relaxed">
                O Clivus opera com <strong>pagamento único vitalício</strong>. Não há mensalidades recorrentes.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">
                4.2. Formas de Pagamento
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>PIX, Boleto e Cartão de Crédito (via Asaas)</li>
                <li>Cartão de Crédito internacional (via Stripe)</li>
              </ul>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">
                4.3. Reembolso
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Oferecemos <strong>garantia de 30 dias</strong>. Caso não esteja satisfeito, entre em contato para solicitar reembolso total.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Uso Aceitável
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Você concorda em <strong>NÃO</strong>:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Usar o serviço para atividades ilegais</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Fazer engenharia reversa do software</li>
                <li>Compartilhar sua conta com terceiros</li>
                <li>Sobrecarregar intencionalmente nossos servidores</li>
                <li>Remover avisos de propriedade intelectual</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Propriedade Intelectual
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Todo o conteúdo do Clivus (código, design, textos, logos) é propriedade da <strong>Clivus LTDA (CNPJ: 39.956.528/0001-74)</strong> e protegido por leis de direitos autorais. Você mantém a propriedade de todos os dados financeiros que inserir na plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Limitação de Responsabilidade
              </h2>
              <p className="text-gray-700 leading-relaxed">
                O Clivus é fornecido <strong>"como está"</strong>. Não nos responsabilizamos por:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Decisões financeiras tomadas com base nos dados da plataforma</li>
                <li>Perdas decorrentes de erros de digitação do usuário</li>
                <li>Interrupções temporárias do serviço para manutenção</li>
                <li>Incompatibilidade com navegadores desatualizados</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                <strong>Recomendamos</strong> que você sempre consulte um contador para decisões fiscais importantes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Encerramento da Conta
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Você pode solicitar o encerramento de sua conta a qualquer momento. Seus dados serão mantidos por 5 anos (exigência legal fiscal) e depois permanentemente excluídos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Alterações nos Termos
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Reservamo-nos o direito de modificar estes termos. Notificaremos você por email com 30 dias de antecedência sobre mudanças significativas.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Lei Aplicável
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Estes termos são regidos pelas leis brasileiras. Foro: São Paulo/SP.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                11. Contato
              </h2>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-800">
                  <strong>Email:</strong> contato@clivus.com.br<br />
                  <strong>CNPJ:</strong> 39.956.528/0001-74<br />
                  <strong>Endereço:</strong> São Paulo, SP - Brasil
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
