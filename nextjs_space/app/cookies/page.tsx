
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cookie } from "lucide-react";

export default function CookiesPage() {
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
            <Cookie className="h-12 w-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Política de Cookies
              </h1>
              <p className="text-gray-600 mt-2">
                Última atualização: {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. O Que São Cookies?
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você acessa um site. Eles permitem que o site "lembre" suas ações e preferências ao longo do tempo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Como o Clivus Usa Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed">
                O Clivus utiliza <strong>apenas cookies essenciais</strong> para o funcionamento da plataforma. <strong>NÃO usamos cookies de publicidade ou rastreamento.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Tipos de Cookies Utilizados
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3.1. Cookies Essenciais (Obrigatórios)
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Necessários para o funcionamento básico da plataforma:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  <strong>next-auth.session-token:</strong> Mantém você logado durante sua sessão
                </li>
                <li>
                  <strong>next-auth.csrf-token:</strong> Protege contra ataques CSRF (falsificação de solicitação)
                </li>
                <li>
                  <strong>next-auth.callback-url:</strong> Gerencia redirecionamentos após login
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                3.2. Cookies de Preferências
              </h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                Armazenam suas preferências de interface:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Tema escuro/claro (se implementado)</li>
                <li>Idioma preferido</li>
                <li>Tamanho de fonte</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. O Que NÃO Fazemos
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                O Clivus <strong>NÃO utiliza</strong>:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>❌ Google Analytics ou ferramentas de rastreamento</li>
                <li>❌ Cookies de publicidade (Google Ads, Facebook Pixel, etc.)</li>
                <li>❌ Cookies de terceiros para venda de dados</li>
                <li>❌ Cookies de redes sociais para rastreamento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Duração dos Cookies
              </h2>
              <table className="w-full border-collapse border border-gray-300 mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-3 text-left">Cookie</th>
                    <th className="border border-gray-300 p-3 text-left">Duração</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">Sessão (login)</td>
                    <td className="border border-gray-300 p-3">30 dias</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">Preferências</td>
                    <td className="border border-gray-300 p-3">1 ano</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Como Gerenciar Cookies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Você pode gerenciar cookies diretamente em seu navegador:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Chrome
              </h3>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                <li>Configurações → Privacidade e segurança → Cookies</li>
                <li>Escolha "Bloquear cookies de terceiros" ou "Bloquear todos os cookies"</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">
                Firefox
              </h3>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                <li>Configurações → Privacidade e Segurança</li>
                <li>Em "Cookies e dados de sites", escolha "Personalizado"</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">
                Safari
              </h3>
              <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                <li>Preferências → Privacidade</li>
                <li>Selecione "Bloquear todos os cookies"</li>
              </ol>

              <p className="text-gray-700 leading-relaxed mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <strong>⚠️ Aviso:</strong> Se você bloquear cookies essenciais, não poderá fazer login no Clivus.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Atualizações nesta Política
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Se adicionarmos novos tipos de cookies (por exemplo, para melhorar a experiência do usuário), atualizaremos esta página e notificaremos você.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Contato
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Dúvidas sobre nossa política de cookies? Entre em contato:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
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
