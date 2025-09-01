# Arena Brazuka

Sistema web para gestão de alunos, pagamentos, torneios e eventos esportivos.

## 📦 Estrutura do Projeto

- **src/components/**: Componentes reutilizáveis (modais, cards, navbar, etc)
- **src/componentsAdmin/**: Componentes específicos para área administrativa
- **src/componentsAluno/**: Componentes específicos para área do aluno
- **src/pages/**: Páginas principais do sistema
- **src/pagesAdmin/**: Páginas exclusivas para administradores
- **src/pagesAluno/**: Páginas exclusivas para alunos
- **src/services/**: Serviços para integração com Firebase/Firestore
- **src/contexts/**: Contextos globais (ex: autenticação)
- **src/types/**: Tipos e interfaces TypeScript
- **src/utils/**: Funções utilitárias

## 🚀 Como rodar o projeto

1. **Instale as dependências**
   ```bash
   npm install
   ```
2. **Configure o Firebase**

   - Crie o arquivo `src/firebase-config.ts` com suas credenciais do Firebase.
   - Ajuste as regras do Firestore conforme necessidade de segurança e acesso.

3. **Inicie o servidor**
   ```bash
   npm run dev
   ```

## 🛠️ Principais Tecnologias

- React + TypeScript
- Firebase Authentication & Firestore
- Tailwind CSS
- React Router

## 🔒 Segurança

- Rotas protegidas para admin e aluno
- Regras do Firestore devem ser revisadas para produção
- Autenticação centralizada via `AuthContext`
- Dados sensíveis protegidos por permissões e validações

## 📚 Funcionalidades

- Cadastro e login de alunos e administradores
- Gestão de pagamentos, turmas e professores
- Cadastro e inscrição em torneios esportivos
- Histórico de pagamentos e atividades do aluno
- Área administrativa para controle geral
- Exportação de dados em CSV
- Integração com WhatsApp para comunicação rápida
- Modais para confirmação, edição e visualização de dados

## 📱 Responsividade

- Layout responsivo para desktop e mobile
- Componentes adaptados para diferentes tamanhos de tela

## 📝 Requisitos e necessidades

- **Necessário ter conta no Firebase** (Firestore e Authentication)
- **Configurar credenciais no arquivo** `src/firebase-config.ts`
- **Ajustar regras do Firestore** para garantir segurança dos dados
- **Ter Node.js instalado** para rodar o projeto localmente
- **Personalizar assets e textos** conforme identidade visual da Arena Brazuka

## 👨‍💻 Contribuição

1. Fork este repositório
2. Crie uma branch: `git checkout -b minha-feature`
3. Faça suas alterações e envie um PR

## 📄 Licença

Este projeto é privado e de uso exclusivo da Arena Brazuka.

---

**Preencha com detalhes específicos do seu projeto, como instruções de deploy, configurações extras, contatos e roadmap de funcionalidades.**
