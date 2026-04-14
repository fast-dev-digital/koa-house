# KOA HOUSE - Resumo Completo do Projeto para Evolucao SaaS

## 1. Visao Geral do Produto

O sistema KOA HOUSE (Arena Brazuka) e uma plataforma web para operacao de escola/arena esportiva com foco em:

- gestao de alunos;
- gestao de professores;
- gestao de turmas;
- gestao de pagamentos recorrentes;
- agenda e reservas de quadras;
- historico financeiro por aluno;
- area privada para aluno e area administrativa.

Stack principal:

- Frontend: React + TypeScript + Vite + Tailwind;
- Backend/BaaS: Firebase Authentication + Firestore;
- Roteamento e seguranca: React Router + guards por role.

---

## 2. Objetivo de Negocio Atual

A solucao atende operacao de uma unidade (single-tenant funcional), com base pronta para evoluir para SaaS multi-tenant.

Cadeia principal de valor:

1. Aluno e cadastrado no sistema administrativo.
2. Aluno ativa conta no primeiro acesso.
3. Aluno entra no dashboard para acompanhar suas informacoes.
4. Admin controla alunos, turmas, agenda, pagamentos e historicos.
5. Sistema calcula fluxo financeiro recorrente por aluno com regras de status.

---

## 3. Regras de Negocio (Consolidadas)

## 3.1 Autenticacao e Autorizacao

- O login usa Firebase Auth (email/senha).
- A role e inferida por colecao no Firestore:
- `admins` -> role `admin`.
- `Alunos` -> role `user`.
- Acesso protegido por rota:
- `ProtectedRoute` exige usuario autenticado e role correta.
- `LoginProtectedRoute` impede usuario logado de voltar para `/login`.
- Redirecionamentos:
- admin -> `/admin-dashboard`.
- user -> `/aluno`.

## 3.2 Primeiro Acesso do Aluno

- Aluno pode existir no Firestore sem conta ativa no Auth.
- Campo de controle: `authCreated` na colecao `Alunos`.
- Se `authCreated` for `false`/`undefined`, o aluno deve usar fluxo de primeiro acesso para criar senha.
- Ao ativar conta:
- cria usuario no Firebase Auth;
- grava `authCreated: true`, `authUid`, `dataAtivacao`, `updatedAt` no documento do aluno.

## 3.3 Regras de Alunos

- Status previstos: `Ativo`, `Inativo`, `Suspenso`.
- Criacao e atualizacao de aluno passam por servico com invalidacao de cache.
- Ao mudar status do aluno para `Ativo`, o sistema tenta gerar/regularizar pagamento automatico no modulo de integracao.
- Filtros comuns na gestao:
- nome;
- status;
- turma;
- horario.

## 3.4 Regras de Professores

- Status previstos: `Ativo` e `Inativo`.
- Professor possui especialidade (ex.: Futevolei, Beach Tennis, Volei).
- Existe controle estatistico por especialidade e por status.
- Servico utiliza cache com TTL para reduzir leituras no Firestore.

## 3.5 Regras de Turmas

- Estados da turma: `Ativa` e `Inativa`.
- Cada turma tem:
- modalidade,
- professor,
- dias/horario,
- capacidade,
- alunosInscritos,
- genero,
- nivel.
- Regras operacionais:
- turma disponivel = turma ativa com `alunosInscritos < capacidade`;
- contador de alunos e atualizado por incremento/decremento;
- calculo de ocupacao e ranking de turmas mais populares.
- Servico utiliza cache global com TTL.

## 3.6 Regras Financeiras e Pagamentos

Modelo principal em transicao/convivencia:

- Estrutura antiga: colecao `pagamentos`.
- Estrutura nova: colecao `alunosPagamentos` com array de pagamentos por aluno.

Regras do fluxo novo:

- Cada aluno possui historico consolidado de pagamentos no array `pagamentos`.
- Status de pagamento usados no nucleo: `Pendente`, `Pago`, `Arquivado`.
- Regras de negocio relevantes:
- so pode marcar como pago item que esteja `Pendente`;
- ao pagar, gera proximo pagamento automaticamente (dia 10 do mes seguinte);
- se aluno estiver inativo, pagamento pendente pode ser arquivado automaticamente em vez de pago;
- `fecharMesComArray` arquiva/fecha ciclo mensal conforme regras do servico;
- totais agregados por aluno sao recalculados (`pago`, `pendente`, `arquivado`).

Regras de visualizacao (Gestao de Pagamentos):

- status exibido como `Atrasado` quando item `Pendente` com vencimento menor que data atual;
- filtros por status, plano e periodo;
- historico detalhado por aluno via modal;
- exportacao CSV dos itens filtrados.

## 3.7 Regras de Historico

- Historico para admin inclui arquivados.
- Historico para aluno exclui arquivados e limita volume para performance.
- Estatisticas calculadas:
- total pago;
- total pendente;
- total atrasado;
- ultimo pagamento;
- proximo vencimento;
- media de valor.

## 3.8 Regras de Agenda e Reservas

- Agenda com slots horarios (padrao 1h) e visual por quadra.
- Reserva por data usa normalizacao UTC para reduzir problema de timezone.
- Tipos de reserva no front da agenda: aula, experimental, livre, personal.
- Status de reserva: `confirmada`, `pendente`, `cancelada`.
- Locacao mensal:
- valida sobreposicao de periodo para evitar conflito de reserva ativa do mesmo aluno;
- cria registros em `reservas` e entradas diarias em `agenda`.

## 3.9 Regras de Exportacao

- Exportacoes CSV para alunos, turmas, professores e pagamentos.
- Exportacao considera filtros de tela quando aplicavel.
- Campos de negocio relevantes sao formatados (ocupacao, status, datas, totais).

---

## 4. Mapa de Dados (Firestore)

Colecoes identificadas no projeto:

- `admins`
- `Alunos`
- `professores`
- `turmas`
- `quadras`
- `reservas`
- `agenda`
- `pagamentos` (legado/compatibilidade)
- `alunosPagamentos` (modelo financeiro consolidado)

Observacao importante:

- Existe coexistencia de modelo legado e novo para pagamentos. Isso exige governanca para evitar inconsistencias durante evolucao SaaS.

---

## 5. Estrutura de Pastas (Detalhada)

## 5.1 Raiz do projeto

- `package.json`: scripts, dependencias e comandos de build/dev/test.
- `vite.config.ts`: configuracao do bundler.
- `tsconfig*.json`: configuracoes TypeScript.
- `tailwind.config.js` e `postcss.config.js`: pipeline de estilo.
- `firebase.json`: configuracao de integracao/deploy Firebase.
- `README.md`: visao funcional e instrucoes de uso.
- `docs/`: documentacao adicional.
- `build/`: artefato gerado da aplicacao.
- `public/`: assets estaticos publicos.

## 5.2 src/

Nucleo da aplicacao React.

- `main.tsx`: bootstrap da aplicacao.
- `App.tsx`: roteamento, layouts e regras de protecao de acesso.
- `firebase-config.ts`: inicializacao de Auth/Firestore.
- `index.css` e `App.css`: estilos globais.
- `assets/`: imagens e recursos visuais.

## 5.3 src/components/

Componentes compartilhados da experiencia publica e privada.

- componentes de layout (`Layout`, `Navbar`, `Footer`);
- componentes de marketing (hero, eventos, info, planos);
- componentes de seguranca (`ProtectedRoute`, `LoginProtectedRoute`);
- componentes utilitarios (modal base, scroll top, whatsapp float, historico).

Responsabilidade:

- concentrar UI reutilizavel e regras leves de apresentacao.

## 5.4 src/components/componentsAdmin/

Componentes focados na operacao administrativa.

- estrutura administrativa (`AdminLayout`, `Sidebar`);
- modais de CRUD (`AlunoModal`, `ProfessorModal`, `TurmasModal`, `ReservaModal`, `PagamentoModal`);
- grade e utilitarios (`DataTable`, `SearchAndFilters`, `SearchInput`, `Toast`);
- modais de gestao/confirmacao (`ManageAlunosModal`, `DeleteConfirmModal`, `EditarAlunoModal`).

Responsabilidade:

- encapsular formularios e interacoes de administracao;
- padronizar a UX de cadastro/edicao/exclusao.

## 5.5 src/components/componentsAluno/

Componentes da area do aluno.

- cards de resumo financeiro/status;
- exibicao de turmas e progresso de pagamento.

Responsabilidade:

- apresentar informacoes do aluno de forma simples e direta.

## 5.6 src/contexts/

- `AuthContext.tsx`: estado global de autenticacao.

Responsabilidade:

- centralizar usuario logado, role e loading de autenticacao;
- fornecer base para guards de rota.

## 5.7 src/hooks/

- local para hooks reutilizaveis da regra de tela.
- `useLogout.ts` presente para apoio de sessao.
- `useDashboardAluno.ts` atualmente vazio (candidato a consolidar logica hoje em pagina).

Responsabilidade:

- desacoplar logica de estado/efeitos dos componentes de pagina.

## 5.8 src/pages/

Paginas publicas e institucionais.

- home, sobre, eventos, professores, planos;
- login;
- esqueci senha / confirmar senha;
- termos de servico e politica de privacidade.

Responsabilidade:

- funil publico de aquisicao e acesso;
- compliance legal (termos/politica).

## 5.9 src/pages/pagesAdmin/

Paginas da operacao administrativa.

- `AdminDashboard`: visao gerencial;
- `GestaoAlunosNovo`: cadastro, filtros, status e exportacao;
- `GestaoTurmas`: capacidade, ocupacao e manutencao de turmas;
- `GestaoProfessores`: cadastro e status de professores;
- `GestaoPagamentos`: cobranca, recebimento, fechamento de mes e historico;
- `GestaoAgenda`: reservas por quadra e horario;
- `CadastrarAdmin`: administradores;
- `PrimeiroAcesso`: ativacao inicial de conta de aluno.

Responsabilidade:

- cockpit operacional completo do negocio.

## 5.10 src/pages/pagesAluno/

Paginas do aluno.

- `DashboardAluno`: dados pessoais, turmas, historico e acoes;
- `CadastrarTorneio`: fluxo de torneio/inscricao (quando habilitado).

Responsabilidade:

- autosservico do aluno com transparencia de dados e suporte a relacionamento.

## 5.11 src/services/

Camada de acesso a dados e regras de negocio.

- `alunoService.ts`: CRUD aluno, cache e gatilhos de integracao de pagamento;
- `professorService.ts`: CRUD professor + estatisticas;
- `turmaService.ts`: CRUD turma, ocupacao, vagas e estatisticas;
- `agendaService.ts`: CRUD quadras e reservas por data;
- `reservaService.ts`: locacao mensal com validacao de conflito;
- `historicoService.ts`: historico financeiro consolidado e estatisticas;
- `integracaoService.ts`: nucleo de pagamentos recorrentes (modelo novo) e sincronizacoes;
- `tests/`: testes unitarios de servicos criticos.

Responsabilidade:

- concentrar regra de negocio e comunicacao com Firestore;
- reduzir duplicidade de regra nas telas.

## 5.12 src/types/

Modelos TypeScript de dominio:

- aluno, professor, turma, agenda, dashboard, pagamentos.

Responsabilidade:

- garantir contrato de dados consistente entre UI e servicos.

## 5.13 src/utils/

Utilitarios transversais.

- `dateUtils.ts`: datas de vencimento e status temporal;
- `exportarCsv.ts`: exportacoes estruturadas para operacao.

Responsabilidade:

- funcoes puras de suporte reutilizavel.

---

## 6. Fluxos de Negocio Criticos (Resumo Operacional)

## 6.1 Onboarding de Aluno

1. Admin cadastra aluno em `Alunos`.
2. Aluno ativa conta em `PrimeiroAcesso`.
3. Login identifica role e redireciona para area correta.

## 6.2 Cobranca Recorrente

1. Aluno ativo tem ciclo em `alunosPagamentos`.
2. Pagamento pendente e marcado como pago no painel admin.
3. Sistema gera proxima cobranca automatica.
4. Fechamento mensal arquiva pendencias conforme regra de periodo.

## 6.3 Agenda de Quadras

1. Admin seleciona data;
2. visualiza matriz horario x quadra;
3. cria/edita/remove reserva;
4. sistema previne conflito de periodo na locacao mensal.

---

## 7. Preparacao para SaaS (Evolucao Recomendada)

Para transformar em SaaS escalavel, a prioridade tecnica e de negocio deve incluir:

1. Multi-tenant real:

- adicionar `tenantId` obrigatorio em todas as colecoes principais;
- reforcar regras do Firestore por `tenantId` + role.

2. Controle de planos SaaS:

- planos por cliente (limites de alunos, turmas, usuarios admin, exportacoes, etc.);
- trilha de billing da propria plataforma (assinatura do cliente da solucao).

3. Governanca de pagamentos:

- finalizar migracao para modelo unico (`alunosPagamentos` ou outro);
- evitar dupla fonte de verdade com `pagamentos` legado.

4. Observabilidade e auditoria:

- trilha de auditoria por acao administrativa;
- logs de erro e metricas operacionais por tenant.

5. Seguranca e conformidade:

- endurecer regras de acesso no Firestore;
- padronizar validacoes server-side (Cloud Functions, se necessario);
- politica de backup/retencao.

6. Produto:

- onboarding self-service para novas academias/arenas;
- painel de administracao da plataforma (superadmin);
- templates configuraveis por unidade (marca, planos, modalidades).

---

## 8. Pontos de Atencao Tecnicos

- `integracaoService.ts` concentra muita regra em arquivo grande; ideal quebrar em modulos (lancamento, fechamento, conciliacao, sincronizacao).
- coexistencia de colecoes de pagamento exige plano de migracao controlado.
- padronizar status e nomenclaturas (`Ativo` vs `ativo`, etc.) ajuda a reduzir bugs.
- hooks podem absorver logica atualmente nas paginas para aumentar manutencao.

---

## 9. Resumo Executivo

Seu projeto ja possui base forte para SaaS de gestao esportiva:

- dominio funcional bem definido;
- regras de acesso por perfil;
- operacao administrativa completa;
- fluxo financeiro recorrente com automacoes;
- estrutura de codigo organizada por dominio.

Com evolucao para multi-tenant, billing da plataforma e padronizacao de dados, a solucao esta pronta para virar um SaaS comercial robusto.

---

## 10. Pontos Fortes e Pontos Fracos

## 10.1 Pontos Fortes

- A regra de negocio central ja existe e cobre o fluxo completo da arena: aluno, turma, professor, agenda, pagamento e historico.
- O sistema ja tem divisao clara entre area publica, area do aluno e area admin, o que facilita evolucao para SaaS.
- A protecao por role esta bem encaminhada e reduz risco de acesso indevido.
- O modelo de pagamentos recorrentes ja pensa no ciclo operacional real da arena, com geracao automatica do proximo vencimento.
- A gestao de pagamentos pode virar um auxiliador fortissimo do fluxo de caixa da operacao, porque conecta status, vencimento, historico e fechamento mensal.
- O uso de exportacao CSV e filtros ajuda a operacao a tomar decisoes rapido e da suporte a analise gerencial.
- A separacao por pastas e dominios deixa o codigo em boa base para crescimento.

## 10.2 Pontos Fracos

- A visualizacao estatistica do projeto single-tenant ainda pode gerar leitura confusa em alguns cenarios, principalmente quando os dados nao estao agrupados por mes.
- O modulo de pagamentos ainda tem coexistencia de modelo legado e modelo novo, o que aumenta risco de inconsistencias.
- Parte da logica de integracao esta concentrada em arquivos grandes, o que dificulta manutencao e evolucao rapida.
- Falta uma camada de analise mais gerencial, focada em tendencia mensal, previsao e saude financeira da unidade.
- O sistema ainda nao esta preparado para multi-tenant real, entao como SaaS ainda precisa de separacao por cliente e por arena.

## 10.3 Melhorias Mais Relevantes

- Criar visualizacao por mes no painel de pagamentos para mostrar entrada, pendencias, atrasos e fechamento de caixa por periodo.
- Transformar a area financeira em um painel de inteligencia de caixa, com indicadores de previsao, inadimplencia e recorrencia.
- Integrar um gateway de pagamento nas arenas para reduzir atrito na cobranca e permitir pagamento digital mais rapido.
- Evoluir o produto com uma metodologia IA First, usando inteligencia artificial para apoio em cobranca, insights financeiros, recomendacoes de acao e analise de comportamento dos alunos.
- Criar uma camada de SaaS com tenant, plano de assinatura e limites por unidade para vender a solucao para outras arenas e escolas.

## 10.4 Leitura Estrategica

O projeto nao e apenas um sistema operacional. Ele pode virar um produto de gestao esportiva com foco em:

- controle financeiro da arena;
- previsibilidade de caixa;
- automacao de relacionamento com o aluno;
- inteligencia operacional para o gestor;
- escalabilidade comercial como SaaS.

---

## 11. Fluxo de Caixa com IA First

Se a meta e usar toda a parte financeira como diferencial competitivo, o melhor caminho e transformar o modulo de pagamentos em um motor de inteligencia de caixa. A ideia nao e apenas registrar cobrancas, mas ajudar o gestor a decidir melhor, agir antes do problema e prever o caixa com antecedencia.

## 11.1 O que a IA deve fazer no financeiro

- prever entrada futura com base em historico de pagamentos;
- identificar alunos com risco de atraso ou inadimplencia;
- estimar quanto a arena deve receber por mes;
- sugerir a melhor acao para cada caso: lembrar, cobrar, negociar ou arquivar;
- detectar padroes anormais, como queda de recebimento em uma turma, professor ou periodo;
- resumir o caixa em linguagem natural para o gestor.

## 11.2 Dados que alimentam a IA

- status do pagamento;
- data de vencimento;
- data de pagamento;
- valor da mensalidade;
- plano contratado;
- historico de atrasos;
- status do aluno;
- turma vinculada;
- comportamento mensal de adimplencia;
- dados de fechamento mensal.

## 11.3 Saidas praticas que o gestor veria

- previsao de recebimento do mes atual;
- lista de alunos em risco;
- ranking de inadimplencia por turma;
- estimativa de caixa em 7, 15 e 30 dias;
- alerta de queda de receita em relacao ao mes anterior;
- recomendacao automatica de acao em cada pagamento;
- resumo executivo do financeiro em uma frase.

## 11.4 Casos de uso de alto valor

- "Quais alunos provavelmente vao atrasar neste mes?"
- "Quanto entra no caixa ate o dia 10?"
- "Qual turma esta gerando mais inadimplencia?"
- "Qual o impacto de 5 alunos em atraso no fluxo de caixa?"
- "Quais alunos devem receber cobranca automatica hoje?"
- "O que mudou no caixa deste mes em relacao ao anterior?"

## 11.5 Funcionalidades IA First recomendadas

1. Score de risco financeiro por aluno.
2. Previsao de caixa mensal.
3. Resumo automatico do financeiro em linguagem natural.
4. Alertas inteligentes de inadimplencia.
5. Sugestao de proxima melhor acao para cobranca.
6. Detecao de anomalias de receita e ocupacao.
7. Assistente para o gestor perguntar sobre o financeiro em linguagem comum.

## 11.6 Como isso vira diferencial de mercado

Um software de arena comum mostra dados.
Um software IA First interpreta os dados e orienta a decisao.

Esse e o salto de valor:

- de registro para previsao;
- de controle para recomendacao;
- de dashboard para copiloto do gestor;
- de sistema operacional para plataforma inteligente.

## 11.7 Prioridade de implementacao

Primeiro eu faria:

1. consolidacao do modelo financeiro unico;
2. visualizacao mensal do caixa;
3. previsao simples baseada em historico;
4. alertas de risco e atraso;
5. resumo automatico para o gestor;
6. depois IA generativa para conversa e analise assistida.

Essa ordem reduz risco e coloca valor real antes de sofisticacao.

---

## 12. Tarefas Primordiais para Comecar a Vender

Objetivo: colocar o produto em condicao comercial com onboarding simples, proposta clara de valor e operacao confiavel para os primeiros clientes.

## 12.1 Prioridade 1 - Pronto para Vender (0 a 30 dias)

1. Definir e publicar planos comerciais (Essencial, Profissional, Performance).
2. Fechar matriz de recursos por plano, incluindo gateway em todos os planos e recorrencia apenas no plano 2 e 3.
3. Implementar cadastro de tenant (arena) com ativacao inicial e status (trial, ativo, suspenso).
4. Implementar controle de limites por plano (alunos, usuarios admin, cotas de IA).
5. Implementar tela basica de Superadmin para criar arena, alterar plano, ativar e suspender.
6. Criar pagina comercial com proposta de valor, comparativo de planos e CTA de demonstracao.
7. Criar fluxo de onboarding rapido da arena (dados basicos, quadras, turmas e primeiro admin).

## 12.2 Prioridade 2 - Operacao Confiavel para Escala Inicial (30 a 60 dias)

1. Consolidar modelo financeiro unico para reduzir risco de inconsistencias.
2. Entregar visualizacao mensal de fluxo de caixa (previsto vs realizado).
3. Entregar painel de inadimplencia por faixa de atraso.
4. Implementar auditoria basica de acoes criticas (pagamento, plano, usuarios, alteracoes de configuracao).
5. Implementar monitoramento de erros e alertas operacionais.
6. Padronizar nomenclaturas de status e regras de negocio em todo sistema.
7. Entregar criacao de agenda em lote com recorrencia por dias da semana.

## 12.3 Prioridade 3 - Conversao e Retencao Comercial (60 a 90 dias)

1. Integrar checkout de assinatura SaaS para cobrar os planos da plataforma.
2. Criar trial de 14 dias com limites claros e fluxo de upgrade.
3. Criar rotina de sucesso do cliente: onboarding guiado, checklist e materiais de treinamento.
4. Implementar relatorios executivos para o dono da arena (receita, inadimplencia, ocupacao, churn de alunos).
5. Implementar automacoes de cobranca por eventos de vencimento e atraso.
6. Implementar comparativo mensal de performance para reforcar valor percebido do produto.

## 12.4 Checklist Minimo de Go-To-Market

- proposta de valor clara: "gateway em todos os planos e recorrencia nos planos superiores";
- precificacao validada com mercado-alvo;
- onboarding funcionando ponta a ponta em menos de 1 hora;
- suporte operacional para primeiros clientes (SLA e canal definido);
- contrato, termos e politica de privacidade revisados;
- indicador de sucesso inicial definido (ex.: tempo para primeira cobranca, reducao de inadimplencia, ativacao do primeiro mes).

## 12.5 Meta de Lancamento

Lancar com foco em resolver 3 dores reais da arena:

1. organizar operacao diaria sem planilha;
2. receber melhor e no prazo com gateway e automacoes;
3. dar visao financeira mensal para decisao do gestor.

Se esses 3 pontos estiverem redondos, o produto ja entra no mercado com vantagem competitiva e base para escalar com IA First.
