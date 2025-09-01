import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function PoliticaDePrivacidade() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="mb-8">
            <Link 
              to="/login" 
              className="inline-flex items-center text-green-600 hover:text-green-800 mb-6 transition-colors duration-300"
            >
              <FaArrowLeft className="mr-2" />
              Voltar ao Login
            </Link>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Política de Privacidade
            </h1>
            <p className="text-gray-600">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Informações que Coletamos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A Arena Brazuka coleta as seguintes informações:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Informações pessoais:</strong> Nome, e-mail, telefone, CPF</li>
                <li><strong>Informações de pagamento:</strong> Dados necessários para processamento de mensalidades</li>
                <li><strong>Informações de uso:</strong> Como você interage com nossa plataforma</li>
                <li><strong>Informações técnicas:</strong> Endereço IP, tipo de navegador, dados de acesso</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Como Usamos suas Informações</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Utilizamos suas informações para:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar pagamentos e gerenciar sua conta</li>
                <li>Comunicar sobre aulas, eventos e atualizações</li>
                <li>Cumprir obrigações legais e regulamentares</li>
                <li>Prevenir fraudes e garantir a segurança</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Compartilhamento de Informações</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Com seu consentimento explícito</li>
                <li>Para cumprir obrigações legais</li>
                <li>Com prestadores de serviços que nos auxiliam (processamento de pagamentos, hospedagem)</li>
                <li>Para proteger nossos direitos e segurança</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Segurança dos Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Criptografia de dados sensíveis</li>
                <li>Acesso restrito às informações pessoais</li>
                <li>Monitoramento regular de segurança</li>
                <li>Backup seguro dos dados</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Seus Direitos (LGPD)</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li><strong>Acesso:</strong> Saber quais dados pessoais temos sobre você</li>
                <li><strong>Correção:</strong> Solicitar correção de dados incompletos ou incorretos</li>
                <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados pessoais</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> Opor-se ao tratamento de seus dados</li>
                <li><strong>Revogação:</strong> Revogar o consentimento a qualquer momento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Retenção de Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, ou conforme exigido por lei. Dados de pagamento são mantidos conforme regulamentações fiscais aplicáveis.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Cookies e Tecnologias Similares</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do site e personalizar conteúdo. Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Menores de Idade</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nossos serviços são destinados a pessoas maiores de 18 anos. Para menores de idade, é necessário o consentimento e acompanhamento dos pais ou responsáveis legais.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Alterações nesta Política</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas através de nossos canais de comunicação. O uso continuado dos serviços constitui aceitação das alterações.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Contato e Encarregado de Dados</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato conosco:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Encarregado de Proteção de Dados (DPO)</strong>
                </p>
                <p className="text-gray-700">
                  E-mail: privacidade@arenabrazuka.com.br<br />
                  Telefone: (11) 99999-9999
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-600 mb-4 sm:mb-0">
                © 2024 Arena Brazuka. Todos os direitos reservados.
              </p>
              <Link 
                to="/termos-de-servico" 
                className="text-green-600 hover:text-green-800 transition-colors duration-300"
              >
                Ver Termos de Serviço
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default PoliticaDePrivacidade;