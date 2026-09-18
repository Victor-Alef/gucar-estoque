# 📋 Registro de Tarefas e Débitos Técnicos (Backlog / Issues)

Este documento registra as melhorias, tarefas de segurança e débitos técnicos mapeados para implementação posterior no **Sistema de Controle de Estoque da Autoelétrica GUCAR**.

---

## 🔒 [SEC-01] Remover Credenciais Padrão Auto-Inseridas na Tela de Login

* **Prioridade:** Alta (Segurança / Produção)
* **Status:** Pendente
* **Tipo:** Melhoria de Segurança / Interface

### Contexto
Durante a fase de prototipação e testes, a tela de login foi configurada para vir com o e-mail e senha pré-carregados nos estados iniciais dos inputs para agilizar a validação dos avaliadores. Em ambiente real de produção, os campos devem iniciar limpos.

### Arquivos Afetados
* [`src/app/login/page.tsx`](./src/app/login/page.tsx):
  * Linha 9: Remover valor default de `email` (`useState('')`).
  * Linha 10: Remover valor default de `password` (`useState('')`).
  * Linhas 130-136: Remover o card de dica inferior que exibe o e-mail e senha em texto claro.

### Critérios de Aceitação
- [ ] A tela de login deve carregar com os campos de e-mail e senha vazios.
- [ ] Não exibir credenciais padrão em nenhum elemento visual da tela de login.
- [ ] Formulário deve continuar validando campos vazios antes do envio.

---

## 🔑 [SEC-02] Parametrização e Alteração da Senha Padrão do Usuário Administrador

* **Prioridade:** Alta (Segurança / Produção)
* **Status:** Pendente
* **Tipo:** Segurança de Dados

### Contexto
A senha de carga inicial (`gucar@123`) foi utilizada como credencial temporária para criação da base pelo `seed.js`. É necessário permitir que a senha seja definida via variável de ambiente no seed e criar um fluxo para o usuário proprietário alterar sua própria senha.

### Ações Necessárias
1. **Configuração de Seed Dinâmico:**
   * Atualizar [`prisma/seed.js`](./prisma/seed.js) para ler `process.env.ADMIN_INITIAL_PASSWORD || '...'`.
2. **Tela / Modal de Alteração de Senha:**
   * Criar endpoint `PUT /api/auth/alterar-senha` que valida a senha atual e grava o novo hash Bcrypt.
   * Adicionar opção "Alterar Senha" no menu do perfil do usuário no cabeçalho.
3. **Atualização da Suíte de Testes:**
   * Adaptar [`verify_system.js`](./verify_system.js) para aceitar senha configurada via variável de ambiente.

### Critérios de Aceitação
- [ ] O usuário proprietário pode alterar sua senha a qualquer momento logado no sistema.
- [ ] Nova senha deve ser criptografada com Bcrypt antes de salvar no banco.
- [ ] A senha antiga é invalidada imediatamente.

---

## 📄 [FEAT-01] Exportação da Lista de Compras de Peças Críticas

* **Prioridade:** Média (Operacional)
* **Status:** Pendente
* **Tipo:** Nova Funcionalidade

### Contexto
Facilitar a cotação com distribuidoras de autopeças gerando uma lista limpa (PDF ou formatação para WhatsApp) com os itens em estoque crítico diretamente do Dashboard.

---

## 📷 [FEAT-02] Leitor de Código de Barras / QR Code via Câmera

* **Prioridade:** Baixa (Diferencial)
* **Status:** Pendente
* **Tipo:** Nova Funcionalidade / Mobile-First

### Contexto
Permitir a leitura do SKU/código da peça através da câmera do smartphone no momento da baixa no pátio.
