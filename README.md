# Sistema Web de Gestão e Controle de Estoque - Autoelétrica GUCAR

[![Projeto Integrador II - UNIVESP](https://img.shields.io/badge/UNIVESP-PI%20II-blue.svg)](https://univesp.br)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.22-darkblue.svg)](https://prisma.io/)
[![Database](https://img.shields.io/badge/SQLite-Local-003B57.svg)](https://sqlite.org/)

Aplicação web responsiva, rápida e mobile-first desenvolvida sob medida para a **Autoelétrica GUCAR** (Proprietário: Gustavo Martins), atendendo integralmente à Especificação de Requisitos de Software (ERS) da disciplina de **Projeto Integrador em Computação II** da Universidade Virtual do Estado de São Paulo (**UNIVESP**).

> 📖 **Documentação Técnica Completa:** Consulte [`DOCUMENTACAO.md`](./DOCUMENTACAO.md).  
> 🤝 **Guia de Contribuição da Equipe:** Consulte [`CONTRIBUTING.md`](./CONTRIBUTING.md) para saber como clonar, rodar localmente e abrir Pull Requests.

---

## 🚗 Cenário Real e Justificativa

Em uma oficina autoelétrica, peças pequenas como relés auxiliares, soquetes, fusíveis lâmina e lâmpadas frequentemente sofrem com perdas ou falta no momento em que um veículo já está desmontado no pátio. 

Este sistema substitui anotações manuais e controle mental por uma plataforma digital que:
1. **Opera na palma da mão do mecânico** (Mobile-First): permite consultar prateleiras/gavetas e dar baixa em peças embaixo do capô do carro.
2. **Baixa em menos de 3 cliques** (< 15 segundos) com bloqueio estrito contra estoque negativo.
3. **Painel de Alertas Visuais (Dashboard)**: destaca imediatamente peças que atingiram o estoque crítico para compra preventiva junto a distribuidoras.

---

## 📋 Módulos e Requisitos Implementados

| Requisito | Descrição | Status |
|---|---|---|
| **[RF01]** | Autenticação simples com e-mail/usuário e senha criptografada (bcrypt). | ✅ Concluído |
| **[RF02]** | Sessão ativa e segura via cookies HttpOnly com botão de logout explícito. | ✅ Concluído |
| **[RF03]** | CRUD completo de peças (cadastrar, listar, buscar, editar e inativar). | ✅ Concluído |
| **[RF04]** | Atributos obrigatórios: SKU, nome, categoria, compatibilidade veicular, **localização física na oficina (prateleira/gaveta)**, saldo atual, estoque mínimo, preço de custo e venda. | ✅ Concluído |
| **[RF05]** | Busca rápida instantânea por nome, SKU, veículo ou gaveta com filtros por categoria e status crítico. | ✅ Concluído |
| **[RF06]** | Registro ágil de Entrada com soma automática no estoque e atualização de custo. | ✅ Concluído |
| **[RF07]** | Baixa de Peça (< 3 cliques) por O.S., venda balcão ou perda, **com bloqueio transacional de saldo negativo**. | ✅ Concluído |
| **[RF08]** | Histórico/Log completo com Data/Hora, Peça, Tipo, Quantidade, Motivo e Responsável. | ✅ Concluído |
| **[RF09]** | Painel com KPIs: Total de itens, Estoque Crítico, Entradas da Semana e Saídas da Semana. | ✅ Concluído |
| **[RF10]** | Alerta visual de reposição destacando itens críticos com ação imediata para repor. | ✅ Concluído |
| **[RNF01]** | Design **Mobile-First** com menu inferior estilo app nativo para smartphone no pátio. | ✅ Concluído |
| **[RNF02]** | Usabilidade mecânica: baixa em menos de 3 cliques. | ✅ Concluído |
| **[RNF03]** | Resposta em milissegundos com filtros em memória e queries otimizadas. | ✅ Concluído |
| **[RNF04]** | Confiabilidade de dados e integridade transacional (Prisma `$transaction`). | ✅ Concluído |
| **[RNF05]** | Código limpo, tipado com TypeScript e pronto para versionamento no GitHub. | ✅ Concluído |

---

## 🛠️ Stack Tecnológica

- **Frontend & Backend Integrado:** Next.js 14 (App Router) + TypeScript.
- **Estilização:** Tailwind CSS com paleta automotiva e design responsivo mobile-first.
- **Ícones:** Lucide React.
- **ORM & Banco de Dados:** Prisma ORM com SQLite (local com zero setup) e compatibilidade total para migração imediata para PostgreSQL (Supabase / Neon / Railway).
- **Autenticação:** Bcrypt.js + Sessão com cookies HttpOnly seguros.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js (v18, v20 ou v22+)
- NPM

### Passo a Passo

1. **Clone o repositório ou acesse a pasta do projeto:**
   ```bash
   cd gucar-estoque
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo de exemplo para `.env`:
   ```bash
   cp .env.example .env
   # No Windows PowerShell: copy .env.example .env
   ```
   O arquivo já vem preparado com suporte a **PostgreSQL (Supabase)** e **SQLite Local**:
   ```env
   # Para Supabase PostgreSQL (Padrão de Produção):
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[SENHA]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[SENHA]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

   JWT_SECRET="gucar-autoletrica-pi2-univesp-secret-key-2026"
   NEXT_PUBLIC_APP_NAME="Autoelétrica GUCAR"
   ```

4. **Gere o banco de dados e sincronize as tabelas:**
   ```bash
   npx prisma db push
   ```

5. **Execute o Seed (Carga inicial de dados de autoelétrica):**
   ```bash
   node prisma/seed.js
   ```
   *Isso criará o usuário administrador e 12 peças automotivas reais (relés, lâmpadas H4/H7, chicotes Fiat Fire, alternadores, fusíveis lâmina) além de movimentações iniciais.*

6. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

7. **Acesse no navegador:**
   - URL: `http://localhost:3000`
   - **E-mail de acesso:** `gustavo@gucar.com.br`
   - **Senha:** `gucar@123`

---

## 📁 Estrutura de Pastas do Projeto (Clean Architecture & PT-BR)

```
gucar-estoque/
├── prisma/
│   ├── schema.prisma            # Modelagem das entidades Usuario, Peca e MovimentacaoEstoque
│   ├── seed.js                  # Carga de dados reais de autoelétrica (Padrão PT-BR)
│   └── dev.db                   # Banco SQLite local
├── src/
│   ├── app/
│   │   ├── (dashboard)/         # Telas operacionais do sistema
│   │   │   ├── layout.tsx       # Layout com Navbar e barra inferior mobile
│   │   │   ├── page.tsx         # Dashboard com KPIs e alertas críticos [RF09, RF10]
│   │   │   ├── pecas/
│   │   │   │   ├── page.tsx     # Catálogo com busca ágil e localização física [RF03, RF04, RF05]
│   │   │   │   ├── nova/page.tsx # Cadastro de nova peça
│   │   │   │   └── [id]/page.tsx # Edição, inativação e histórico da peça
│   │   │   └── movimentacoes/
│   │   │       ├── page.tsx     # Histórico completo de auditoria [RF08]
│   │   │       ├── saida/page.tsx # Baixa Rápida no Pátio (< 3 cliques) [RF07]
│   │   │       └── entrada/page.tsx # Registro de entrada / compra [RF06]
│   │   ├── api/                 # Controladores REST finos
│   │   │   ├── auth/            # Login, Logout e verificação de sessão [RF01, RF02]
│   │   │   ├── pecas/           # Endpoints de peças (listagem, cadastro, edição)
│   │   │   ├── movimentacoes/   # Endpoints de entradas e saídas de estoque
│   │   │   └── painel/          # Métricas consolidadas em tempo real
│   │   ├── login/page.tsx       # Tela de login responsiva da GUCAR
│   │   ├── globals.css          # Estilos e Tailwind CSS
│   │   └── layout.tsx           # Layout base da aplicação
│   ├── components/              # Componentes de interface reutilizáveis
│   │   ├── Navbar.tsx           # Navegação mobile-first com botões de ação rápida
│   │   ├── CardKpi.tsx          # Card de métrica e indicador de desempenho
│   │   └── BadgeStatusEstoque.tsx # Indicador visual de estoque normal ou crítico
│   ├── services/                # Camada de Domínio / Regras de Negócio (Clean Code)
│   │   ├── pecas.service.ts     # Casos de uso do catálogo de peças
│   │   ├── movimentacoes.service.ts # Regra de baixa atômica e bloqueio de saldo negativo
│   │   ├── painel.service.ts    # Consolidação e cálculo de KPIs
│   │   └── autenticacao.service.ts # Validação de credenciais e tokens
│   ├── lib/
│   │   ├── prisma.ts            # Cliente Prisma singleton
│   │   ├── auth.ts              # Funções de hash bcrypt e sessões HttpOnly
│   │   └── formatadores.ts      # Utilitários de moeda R$, datas e rótulos PT-BR
│   ├── middleware.ts            # Proteção de rotas autenticadas
│   └── types/
│       └── index.ts             # Tipagens TypeScript estritas em Português
├── .env.example
├── package.json
└── tsconfig.json
```
