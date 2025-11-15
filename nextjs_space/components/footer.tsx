
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-6">
            <div>
              <Image
                src="/logo-clivus.png"
                alt="Clivus"
                width={200}
                height={80}
                className="brightness-0 invert"
              />
            </div>
            <p className="text-gray-300 leading-relaxed">
              A ferramenta completa para separar suas finanças pessoais das 
              empresariais e ter total controle sobre seu dinheiro.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Produto</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Funcionalidades
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Depoimentos
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Suporte</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Tutoriais
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Status do Sistema
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-6">Contato</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-gray-300">contato@clivus.com.br</p>
                  <p className="text-sm text-gray-400">Suporte por email</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-gray-300">(11) 9999-9999</p>
                  <p className="text-sm text-gray-400">Seg-Sex, 9h às 18h</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-gray-300">São Paulo, SP</p>
                  <p className="text-sm text-gray-400">Brasil</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} Clivus. Todos os direitos reservados.
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-end space-x-6">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Política de Privacidade
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Termos de Uso
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Cookies
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              CNPJ: 00.000.000/0001-00 | Este site não faz parte do Facebook ou de qualquer 
              empresa do grupo Meta. Além disso, este site NÃO é endossado pelo Facebook 
              de forma alguma. FACEBOOK é uma marca comercial da Meta Platforms, Inc.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
