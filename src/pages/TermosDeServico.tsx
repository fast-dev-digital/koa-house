import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

function TermosDeServico() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
              Termos de Serviço
            </h1>
            <p className="text-gray-600">
              Última atualização: 22/09/2025 (v1.0)
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Ao acessar e usar os serviços da Koa House, você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não deve usar nossos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Descrição dos Serviços</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A Koa House oferece serviços de ensino de beach tennis, incluindo:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Aulas de futevôlei e beach tennis para diferentes níveis</li>
                <li>Aluguel de quadras</li>
                <li>Organização de eventos e torneios</li>
                <li>Plataforma digital para gestão de alunos e pagamentos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Cadastro e Conta do Usuário</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Para utilizar nossos serviços, você deve:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Manter a confidencialidade de sua senha</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
                <li>Ser responsável por todas as atividades que ocorrem em sua conta</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Pagamentos e Cancelamentos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Os pagamentos devem ser efetuados conforme os prazos estabelecidos. Cancelamentos de aulas devem ser comunicados com antecedência mínima de 24 horas. Reembolsos serão analisados caso a caso, conforme nossa política interna.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Conduta do Usuário</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Você concorda em não:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Usar os serviços para qualquer propósito ilegal ou não autorizado</li>
                <li>Interferir ou interromper os serviços ou servidores</li>
                <li>Transmitir qualquer material prejudicial, ofensivo ou inadequado</li>
                <li>Violar os direitos de propriedade intelectual</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Limitação de Responsabilidade</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                A Koa House não será responsável por danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso de nossos serviços. Nossa responsabilidade total não excederá o valor pago pelos serviços.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Modificações dos Termos</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. O uso continuado dos serviços constitui aceitação dos termos modificados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contato</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Para dúvidas sobre estes Termos de Serviço, entre em contato conosco através dos canais oficiais da Koa House.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-600 mb-4 sm:mb-0">
                © 2025 Koa House. Todos os direitos reservados.
              </p>
              <Link 
                to="/politica-de-privacidade" 
                className="text-green-600 hover:text-green-800 transition-colors duration-300"
              >
                Ver Política de Privacidade
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TermosDeServico;