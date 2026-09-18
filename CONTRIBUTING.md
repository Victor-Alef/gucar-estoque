# 🤝 Guia de Contribuição e Participação da Equipe

**Projeto:** Sistema de Controle de Estoque – Autoelétrica GUCAR  
**Disciplina:** Projeto Integrador em Computação II (PI II) – UNIVESP  

Este guia foi elaborado para que todos os integrantes do grupo possam clonar o projeto, executar em suas máquinas locais e registrar suas contribuições no GitHub de forma simples, organizada e orgânica.

---

## 🛠️ 1. Pré-requisitos na sua Máquina

Antes de começar, certifique-se de ter instalado:
1. **[Node.js](https://nodejs.org/)** (Versão 18, 20 ou superior).
2. **[Git](https://git-scm.com/)**.
3. **[VS Code](https://code.visualstudio.com/)** (ou seu editor de preferência).

> 💡 **Configuração Inicial do Git (Importante):**  
> No seu terminal, verifique se o Git está configurado com o seu nome e o e-mail da sua conta do GitHub para que seus commits fiquem vinculados ao seu perfil:
> ```bash
> git config --global user.name "Seu Nome Completo"
> git config --global user.email "seu-email-do-github@exemplo.com"
> ```

---

## 🚀 2. Como Baixar e Executar o Projeto Localmente

Abra o terminal (Git Bash, CMD ou PowerShell) na pasta onde você guarda seus projetos e execute:

```bash
# 1. Clone o repositório
git clone https://github.com/Victor-Alef/gucar-estoque.git

# 2. Acesse a pasta do projeto
cd gucar-estoque

# 3. Instale as dependências
npm install

# 4. Crie o seu arquivo .env a partir do modelo
# (No Windows PowerShell pode usar: copy .env.example .env)
copy .env.example .env

# 5. Gere o cliente Prisma
npx prisma generate

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Abra o navegador no endereço: **`http://localhost:3000`**

---

## 🌿 3. Fluxo de Trabalho em Equipe (Passo a Passo)

Para manter o histórico do repositório limpo, colaborativo e bem avaliado pelos professores, **nunca commitamos direto na branch `main`**. Seguimos o fluxo de *Feature Branches*:

```
main ───────────●───────────────────────────● (Merge do seu PR!)
                 \                         /
  sua branch      ●──────●────────────────● (Seus commits)
```

### Passo 1: Atualize sua máquina com a versão mais recente
```bash
git checkout main
git pull origin main
```

### Passo 2: Crie uma nova branch para a sua tarefa
Escolha um nome descritivo para o que você vai fazer:
* Se for uma funcionalidade: `git checkout -b feature/nome-da-tarefa`
* Se for uma correção de bug: `git checkout -b fix/nome-do-ajuste`
* Se for documentação: `git checkout -b docs/ajuste-documento`

*Exemplo:*
```bash
git checkout -b feature/remover-senha-padrao
```

### Passo 3: Faça as alterações no código e teste localmente
Edite os arquivos necessários e valide no navegador (`npm run dev`).

### Passo 4: Salve suas alterações com um commit claro
Use o padrão de mensagens:
* `feat:` quando criar ou melhorar uma funcionalidade.
* `fix:` quando corrigir um erro ou bug.
* `docs:` quando alterar documentação (`README.md`, atas, etc.).
* `style:` formatações visuais ou de código sem alterar lógica.

*Exemplo:*
```bash
git add .
git commit -m "fix: remove preenchimento automatico de senha na tela de login"
```

### Passo 5: Envie sua branch para o GitHub
```bash
git push -u origin feature/remover-senha-padrao
```

### Passo 6: Abra o Pull Request (PR) no GitHub
1. Acesse o repositório no navegador: [github.com/Victor-Alef/gucar-estoque](https://github.com/Victor-Alef/gucar-estoque).
2. O GitHub exibirá um botão amarelo: **"Compare & pull request"**. Clique nele.
3. Descreva brevemente o que você fez e clique em **"Create pull request"**.
4. Avise o grupo no WhatsApp para que outro integrante revise e faça o **Merge**!

---

## 🎯 4. Sugestões de Tarefas para os Integrantes Começarem

Consulte o arquivo [`ISSUES.md`](./ISSUES.md) para ver tarefas prontas para pegar. Algumas sugestões imediatas:

| Integrante | Sugestão de Contribuição | Tipo de Branch |
|---|---|---|
| **Colaborador 1** | Remover campos auto-preenchidos e a dica de senha na tela de login (`src/app/login/page.tsx`). | `fix/limpar-login` |
| **Colaborador 2** | Cadastrar mais peças reais da oficina no arquivo `prisma/seed.js` (novos relés, fusíveis e lâmpadas). | `feat/novas-pecas-seed` |
| **Colaborador 3** | Implementar a exportação da lista de compras em PDF ou botão de impressão no Dashboard. | `feat/exportar-compras` |
| **Colaborador 4** | Adicionar validação de confirmação visual ao excluir ou inativar uma peça do catálogo. | `feat/confirmacao-inativar` |
| **Colaborador 5** | Revisar e enriquecer os textos do `README.md` com fotos e atas de reuniões do PI. | `docs/atas-reunioes-pi` |

---

## 💬 5. Dúvidas ou Problemas Comuns

* **"Deu conflito no Git (Merge Conflict)":** Não se desespere! Avise no grupo antes de forçar qualquer comando.
* **"Alterei algo e quero desfazer antes de commitar":** Use `git restore .` para voltar os arquivos ao estado original.
* **"Esqueci qual branch estou":** Digite `git branch` para ver a branch ativa com um asterisco verde.
