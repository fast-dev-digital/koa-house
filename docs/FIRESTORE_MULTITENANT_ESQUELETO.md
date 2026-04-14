# Firestore Multi-tenant - Esqueleto de Banco (KOA HOUSE)

## 1. Objetivo

Este documento define o esqueleto de banco para evoluir o projeto de single-tenant para multi-tenant em Firestore, com isolamento por conta (tenant).

Decisao oficial:

- campo padrao de segregacao: `tenantId`;
- `tenantId` representa a conta (idConta) no nivel tecnico.

Resumo da regra:

- sim, quase toda collection de dominio deve estar ligada a `tenantId`;
- excecoes sao collections globais de plataforma (metadados SaaS), com vinculo indireto ao tenant.

---

## 2. Modelo de Dados Recomendado

Modelo recomendado para este projeto:

- manter collections de dominio dentro do namespace do tenant;
- manter `tenantId` tambem dentro dos documentos (desnormalizacao controlada);
- manter collections globais apenas para controle de plataforma SaaS.

Estrutura base:

```text
tenants/{tenantId}/admins/{adminId}
tenants/{tenantId}/alunos/{alunoId}
tenants/{tenantId}/professores/{professorId}
tenants/{tenantId}/turmas/{turmaId}
tenants/{tenantId}/quadras/{quadraId}
tenants/{tenantId}/agenda/{agendaId}
tenants/{tenantId}/reservas/{reservaId}
tenants/{tenantId}/alunosPagamentos/{registroId}

accounts/{tenantId}
users/{uid}
plans/{planId}
```

Por que este modelo:

- reduz risco de vazamento entre tenants;
- facilita regras de seguranca por path;
- simplifica backup/export por tenant;
- facilita auditoria e governanca.

---

## 3. Collections e Obrigatoriedade de tenantId

### 3.1 Collections de dominio (obrigatorio tenantId)

Todas abaixo exigem `tenantId` no documento:

- `admins`
- `alunos`
- `professores`
- `turmas`
- `quadras`
- `agenda`
- `reservas`
- `alunosPagamentos`

Observacao:

- collection legada `pagamentos` deve entrar em desativacao planejada;
- nao manter dupla fonte de verdade (`pagamentos` + `alunosPagamentos`) apos migracao.

### 3.2 Collections globais de plataforma (sem tenantId obrigatorio no path de dominio)

- `accounts/{tenantId}`: metadados da conta SaaS (status, plano, limites, billing)
- `users/{uid}`: index de autenticacao e associacao com tenants/roles
- `plans/{planId}`: catalogo de planos do produto

Mesmo sendo globais, devem referenciar tenant quando fizer sentido:

- `users/{uid}.tenants[]`
- `accounts/{tenantId}` (o proprio id e o tenant)

---

## 4. Campos Minimos por Documento

Campos comuns obrigatorios (dominio):

- `tenantId: string`
- `createdAt: Timestamp`
- `updatedAt: Timestamp`
- `createdBy: string` (uid)
- `updatedBy: string` (uid)
- `ativo: boolean` (ou status padronizado)

Campos de rastreio recomendados:

- `source: "web" | "api" | "import"`
- `version: number`

Padrao de status (evitar variacoes):

- aluno: `Ativo | Inativo | Suspenso`
- professor: `Ativo | Inativo`
- turma: `Ativa | Inativa`
- pagamento: `Pendente | Pago | Arquivado`
- reserva: `confirmada | pendente | cancelada`

---

## 5. Contratos Base (Exemplo)

```ts
export interface BaseTenantDoc {
  tenantId: string;
  createdAt: unknown;
  updatedAt: unknown;
  createdBy: string;
  updatedBy: string;
}

export interface AlunoDoc extends BaseTenantDoc {
  id: string;
  nome: string;
  email: string;
  status: "Ativo" | "Inativo" | "Suspenso";
  plano: string;
  authCreated?: boolean;
  authUid?: string;
}
```

---

## 6. Relacionamentos e Integridade

Regras de relacionamento:

- todo relacionamento entre documentos de dominio deve ocorrer dentro do mesmo `tenantId`;
- validar em camada de servico que `aluno.tenantId === turma.tenantId` etc;
- bloquear associacao cruzada entre tenants.

Exemplos:

- `alunosPagamentos.alunoId` referencia aluno do mesmo tenant;
- `turmas.professorId` referencia professor do mesmo tenant;
- `reservas.quadraId` referencia quadra do mesmo tenant.

---

## 7. Padrao de Consulta Segura

Sempre consultar pelo caminho do tenant:

```ts
import { collection, getDocs, query, where } from "firebase/firestore";

const alunosRef = collection(db, `tenants/${tenantId}/alunos`);
const q = query(alunosRef, where("status", "==", "Ativo"));
const snap = await getDocs(q);
```

Regra operacional:

- nao usar query global para dados operacionais;
- tenantId deve vir do contexto autenticado, nunca do input livre do cliente.

---

## 8. Firestore Security Rules (Esqueleto)

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function userBelongsToTenant(tenantId) {
      return isSignedIn()
        && exists(/databases/$(database)/documents/users/$(request.auth.uid))
        && tenantId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.tenantIds;
    }

    match /tenants/{tenantId}/{document=**} {
      allow read, write: if userBelongsToTenant(tenantId);
    }

    match /accounts/{tenantId} {
      allow read: if userBelongsToTenant(tenantId);
      allow write: if false; // apenas backend/superadmin via camada segura
    }

    match /users/{uid} {
      allow read: if isSignedIn() && request.auth.uid == uid;
      allow write: if false; // gerenciar via backend/admin seguro
    }
  }
}
```

Observacao:

- ajustar com claims customizadas e papeis (`owner`, `admin`, `staff`, `aluno`) conforme evolucao.

---

## 9. Indices Minimos Recomendados

Criar indices compostos prioritarios por tenant:

- `alunos`: `status + nome`
- `alunos`: `email`
- `turmas`: `status + modalidade`
- `reservas`: `data + status`
- `agenda`: `data + quadraId`
- `alunosPagamentos`: `alunoId + status`
- `alunosPagamentos`: `pagamentos[].mesReferencia` (se mantiver array, revisar estrategia)

Diretriz:

- indice deve sempre considerar o contexto do tenant (path ja ajuda nisso).

---

## 10. Plano de Migracao (Fases)

### Fase 1 - Preparacao

- criar `accounts`, `users` e estrutura `tenants/{tenantId}`;
- definir tenant inicial da base atual (ex.: `tenant_default_arena_brazuka`);
- adicionar campos de auditoria nos contratos de dominio.

### Fase 2 - Backfill

- migrar documentos atuais para `tenants/{tenantId}/...`;
- preencher `tenantId` em todos os documentos;
- validar consistencia de relacionamentos no mesmo tenant.

### Fase 3 - Aplicacao

- ajustar AuthContext para carregar tenant ativo do usuario;
- alterar services para ler/escrever apenas em path do tenant;
- bloquear queries antigas globais.

### Fase 4 - Financeiro

- consolidar definitivamente em `alunosPagamentos`;
- migrar historico de `pagamentos` legado;
- congelar escrita em `pagamentos` e remover ao final da validacao.

### Fase 5 - Seguranca e Go-live

- publicar Security Rules multi-tenant;
- validar cenarios de acesso cruzado (deve negar);
- monitorar logs e corrigir edge cases.

---

## 11. Fase 1 - Preparacao com Pseudocodigo Seguro

Objetivo da fase 1:

- estabelecer a base tecnica para multi-tenant sem quebrar o sistema atual;
- criar a espinha dorsal de identificacao de tenant;
- preparar contratos, helpers e fluxo de autenticacao antes de migrar services.

Ordem segura de implementacao:

1. definir tipos base com `tenantId`;
2. criar helper unico para resolver tenant ativo;
3. ajustar contexto de autenticacao para carregar tenant e role;
4. preparar wrappers de acesso ao Firestore por tenant;
5. somente depois migrar um service por vez.

Pseudocodigo de alto nivel:

```text
se usuario autenticado entao
  buscar perfil em users/{uid}
  resolver tenant ativo
  validar se usuario pertence ao tenant
  disponibilizar tenantId no contexto global
senao
  bloquear acesso privado
fim
```

```text
para cada operacao de leitura ou escrita
  obter tenantId do contexto autenticado
  se tenantId ausente
    rejeitar operacao
  fim

  montar path do tenant
  executar consulta apenas dentro do namespace do tenant
  validar retorno com tenantId antes de persistir
fim
```

```text
ao criar ou atualizar documento
  preencher tenantId
  preencher createdAt / updatedAt
  preencher createdBy / updatedBy
  validar se referencia de outro documento pertence ao mesmo tenant
  salvar somente se a validacao passar
fim
```

Regras de seguranca para gerar codigo:

- nunca expor `tenantId` como entrada livre para o usuario final;
- nunca manter query global para dado operacional;
- nunca copiar a regra antiga sem colocar o escopo do tenant;
- nunca migrar todos os services de uma vez;
- sempre testar primeiro em um service isolado e depois expandir.

Checklist tecnico da fase 1:

- [ ] definir contratos base com `tenantId`
- [ ] definir helper de resolucao de tenant ativo
- [ ] ajustar AuthContext para carregar tenant
- [ ] criar padrao de path `tenants/{tenantId}/...`
- [ ] preparar validacao de pertencimento antes do acesso
- [ ] documentar excecoes globais (`accounts`, `users`, `plans`)

---

## 12. Checklist de Implementacao

- [ ] `tenantId` definido como obrigatorio em todos os tipos de dominio
- [ ] AuthContext com tenant ativo no contexto da sessao
- [ ] Todos os services com path `tenants/{tenantId}/...`
- [ ] Nenhuma query operacional global restante
- [ ] Security Rules publicadas e testadas
- [ ] Indices criados para consultas criticas
- [ ] Modelo financeiro unico ativo (`alunosPagamentos`)
- [ ] Collection legada `pagamentos` desativada

---

## 13. Resposta Objetiva a Pergunta de Negocio

Pergunta: cada collection vai ter que estar ligada a uma idconta?

Resposta:

- sim para collections de negocio (operacionais): alunos, turmas, professores, agenda, reservas, pagamentos etc;
- nao necessariamente para collections globais de plataforma (accounts, users, plans), mas elas devem manter referencia de tenant quando aplicavel.

Em termos tecnicos:

- `idConta` de negocio = `tenantId` no banco.
