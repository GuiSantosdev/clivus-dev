import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Logo and Description */}
          <div>
            <div className="mb-4">
              <Image
                src="/logo-clivus.png"
                alt="Clivus"
                width={150}
                height={64}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-gray-400 text-sm">
              A ferramenta completa para separar suas finanças pessoais das empresariais e ter total controle sobre seu dinheiro.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/#funcionalidades" className="hover:text-white transition-colors">
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Preços
                </Link>
              </li>
              <li>
                <Link href="/#depoimentos" className="hover:text-white transition-colors">
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © 2025 Clivus. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link href="/politica-privacidade" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/termos-uso" className="hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>

        {/* Meta Disclaimer */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-500 text-center">
            CNPJ: 39.956.528/0001-74 | Este site não faz parte do Facebook ou do qualquer empresa do grupo Meta. Além disso, este site NÃO é endossado pelo Facebook de forma alguma. FACEBOOK é uma marca comercial da Meta Platforms, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
