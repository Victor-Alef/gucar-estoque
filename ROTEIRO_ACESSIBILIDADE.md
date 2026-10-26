# ♿ Roteiro Passo a Passo de Acessibilidade (A11y) para a Equipe

Este roteiro foi criado para que os integrantes do grupo possam realizar alterações **pequenas, simples e pontuais**, divididas em **7 commits/branches independentes**. 

Cada colaborador pode escolher uma tarefa abaixo, seguir o passo a passo com o código exato e enviar seu Pull Request no GitHub.

---

## 📌 Sumário das Tarefas

| Tarefa | Branch Sugerida | Arquivos Afetados | Nível |
|---|---|---|---|
| **Tarefa 1** | `a11y/skip-link` | `src/app/(dashboard)/layout.tsx` | Fácil |
| **Tarefa 2** | `a11y/aria-labels-navbar` | `src/components/Navbar.tsx` | Fácil |
| **Tarefa 3** | `a11y/fonte-context` | `src/contexts/AccessibilityContext.tsx`, `src/app/layout.tsx` | Médio |
| **Tarefa 4** | `a11y/estilos-alto-contraste` | `src/app/globals.css` | Fácil |
| **Tarefa 5** | `a11y/barra-acessibilidade` | `src/components/AccessibilityToolbar.tsx`, `src/components/Navbar.tsx` | Médio |
| **Tarefa 6** | `a11y/vlibras` | `src/components/VLibras.tsx`, `src/app/layout.tsx` | Fácil |
| **Tarefa 7** | `docs/acessibilidade` | `README.md`, `DOCUMENTACAO.md` | Fácil |

---

## 🛠️ Tarefa 1: Adicionar Skip Link (Navegação por Teclado)
> **Objetivo:** Adicionar um atalho oculto que se torna visível ao pressionar a tecla `Tab`. Permite que usuários de leitor de tela ou que usam apenas teclado pulem o menu e vão direto para o conteúdo.

### 1. Criar a branch no terminal:
```bash
git checkout main
git pull origin main
git checkout -b a11y/skip-link
```

### 2. Arquivo a editar: `src/app/(dashboard)/layout.tsx`
Substitua o retorno do componente pelo código abaixo, adicionando o link e o `id="main-content"` na tag `<main>`:

```tsx
import React from 'react';
import Navbar from '@/components/Navbar';
import { obterUsuarioSessao } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await obterUsuarioSessao();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Skip Link para navegabilidade por teclado (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-400 focus:text-slate-950 focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
      >
        Pular para o conteúdo principal
      </a>

      <Navbar userName={usuario?.nome || 'Gustavo Martins'} />

      <main 
        id="main-content" 
        tabIndex={-1}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 focus:outline-none"
      >
        {children}
      </main>

      <footer className="hidden md:block border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <p>
          Autoelétrica GUCAR &bull; Sistema de Gestão e Controle de Estoque &bull; UNIVESP Projeto Integrador II
        </p>
      </footer>
    </div>
  );
}
```

### 3. Como testar:
Execute `npm run dev`. Abra `http://localhost:3000` e aperte a tecla `Tab`. O botão amarelo *"Pular para o conteúdo principal"* aparecerá no canto superior esquerdo.

### 4. Salvar e enviar o commit:
```bash
git add src/app/(dashboard)/layout.tsx
git commit -m "feat(a11y): adiciona skip link para navegacao por teclado"
git push -u origin a11y/skip-link
```
*(Abra o Pull Request no GitHub com o título do commit).*

---

## 🛠️ Tarefa 2: Rótulos ARIA e Foco Acessível na Navbar
> **Objetivo:** Adicionar atributos semânticos para leitores de tela saberem o estado dos botões (ex.: menu aberto/fechado, página atual).

### 1. Criar a branch no terminal:
```bash
git checkout main
git pull origin main
git checkout -b a11y/aria-labels-navbar
```

### 2. Arquivo a editar: `src/components/Navbar.tsx`
* Na tag `<nav className="hidden md:flex...">`: Adicione `aria-label="Menu principal de navegação"`.
* No `Link` de cada item de navegação: Adicione `aria-current={isActive ? 'page' : undefined}`.
* No botão de Logout: Adicione `aria-label="Encerrar sessão no sistema"`.
* No botão do Menu Mobile: Adicione `aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}` e `aria-expanded={mobileMenuOpen}`.

### 3. Salvar e enviar o commit:
```bash
git add src/components/Navbar.tsx
git commit -m "feat(a11y): aprimora rotulos aria e foco na barra de navegacao"
git push -u origin a11y/aria-labels-navbar
```

---

## 🛠️ Tarefa 3: Criar Contexto de Redimensionamento de Fonte
> **Objetivo:** Permitir que o usuário altere o tamanho do texto (Normal, Grande, Extra Grande) e salvar a preferência no navegador.

### 1. Criar a branch no terminal:
```bash
git checkout main
git pull origin main
git checkout -b a11y/fonte-context
```

### 2. Criar novo arquivo: `src/contexts/AccessibilityContext.tsx`
```tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type TamanhoFonte = 'normal' | 'grande' | 'extra-grande';

interface AccessibilityContextType {
  tamanhoFonte: TamanhoFonte;
  aumentarFonte: () => void;
  diminuirFonte: () => void;
  resetarFonte: () => void;
  altoContraste: boolean;
  alternarAltoContraste: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [tamanhoFonte, setTamanhoFonte] = useState<TamanhoFonte>('normal');
  const [altoContraste, setAltoContraste] = useState(false);

  useEffect(() => {
    const fonteSalva = localStorage.getItem('gucar_a11y_fonte') as TamanhoFonte;
    const contrasteSalvo = localStorage.getItem('gucar_a11y_contraste') === 'true';

    if (fonteSalva) setTamanhoFonte(fonteSalva);
    if (contrasteSalvo) setAltoContraste(contrasteSalvo);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-grande', 'font-extra-grande');
    root.classList.add(`font-${tamanhoFonte}`);
    localStorage.setItem('gucar_a11y_fonte', tamanhoFonte);
  }, [tamanhoFonte]);

  useEffect(() => {
    const root = document.documentElement;
    if (altoContraste) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('gucar_a11y_contraste', String(altoContraste));
  }, [altoContraste]);

  const aumentarFonte = () => {
    setTamanhoFonte((atual) => (atual === 'normal' ? 'grande' : 'extra-grande'));
  };

  const diminuirFonte = () => {
    setTamanhoFonte((atual) => (atual === 'extra-grande' ? 'grande' : 'normal'));
  };

  const resetarFonte = () => {
    setTamanhoFonte('normal');
  };

  const alternarAltoContraste = () => {
    setAltoContraste((prev) => !prev);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        tamanhoFonte,
        aumentarFonte,
        diminuirFonte,
        resetarFonte,
        altoContraste,
        alternarAltoContraste,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider');
  }
  return context;
}
```

### 3. Conectar no arquivo `src/app/layout.tsx`:
Envolva o `{children}` com `<AccessibilityProvider>`:
```tsx
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';

// No return do RootLayout:
<AccessibilityProvider>
  {children}
</AccessibilityProvider>
```

### 4. Salvar e enviar o commit:
```bash
git add src/contexts/AccessibilityContext.tsx src/app/layout.tsx
git commit -m "feat(a11y): cria contexto para redimensionamento de fonte e alto contraste"
git push -u origin a11y/fonte-context
```

---

## 🛠️ Tarefa 4: Estilos CSS de Alto Contraste e Escalas de Fonte
> **Objetivo:** Adicionar regras CSS para garantir contraste AAA (fundo escuro puro, textos amarelos e brancos com bordas reforçadas) e as escalas de fonte.

### 1. Criar a branch no terminal:
```bash
git checkout main
git pull origin main
git checkout -b a11y/estilos-alto-contraste
```

### 2. Arquivo a editar: `src/app/globals.css`
Adicione ao final do arquivo:

```css
/* Escalas de Acessibilidade de Fonte */
html.font-normal {
  font-size: 16px;
}

html.font-grande {
  font-size: 18px;
}

html.font-extra-grande {
  font-size: 20px;
}

/* Modo de Alto Contraste (WCAG 2.1 AAA) */
html.high-contrast {
  filter: contrast(120%);
}

html.high-contrast body {
  background-color: #000000 !important;
  color: #FFFFFF !important;
}

html.high-contrast .bg-white,
html.high-contrast .bg-slate-50,
html.high-contrast .bg-slate-100 {
  background-color: #0a0a0a !important;
  border-color: #ffffff !important;
  color: #ffffff !important;
}

html.high-contrast p,
html.high-contrast span,
html.high-contrast label,
html.high-contrast h1,
html.high-contrast h2,
html.high-contrast h3 {
  color: #ffffff !important;
}

html.high-contrast a,
html.high-contrast button {
  outline: 2px solid #ffff00 !important;
}
```

### 3. Salvar e enviar o commit:
```bash
git add src/app/globals.css
git commit -m "feat(a11y): implementa regras css para alto contraste e escalas de texto"
git push -u origin a11y/estilos-alto-contraste
```

---

## 🛠️ Tarefa 5: Criar Barra Visual de Ferramentas de Acessibilidade
> **Objetivo:** Adicionar botões visuais (`A-`, `A+`, `Alto Contraste`) no topo do site para o usuário clicar.

### 1. Criar a branch no terminal:
```bash
git checkout main
git pull origin main
git checkout -b a11y/barra-acessibilidade
```

### 2. Criar novo arquivo: `src/components/AccessibilityToolbar.tsx`
```tsx
'use client';

import React from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Eye, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function AccessibilityToolbar() {
  const { 
    aumentarFonte, 
    diminuirFonte, 
    resetarFonte, 
    tamanhoFonte, 
    altoContraste, 
    alternarAltoContraste 
  } = useAccessibility();

  return (
    <div 
      role="region" 
      aria-label="Barra de ferramentas de acessibilidade"
      className="bg-slate-950 text-slate-300 border-b border-slate-800 text-xs py-1 px-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="hidden sm:inline text-[11px] font-semibold text-slate-400">
          Acessibilidade:
        </span>

        <div className="flex items-center space-x-2 ml-auto">
          {/* Diminuir Fonte */}
          <button
            onClick={diminuirFonte}
            disabled={tamanhoFonte === 'normal'}
            title="Diminuir tamanho da letra (A-)"
            aria-label="Diminuir tamanho da letra"
            className="p-1 px-2 rounded hover:bg-slate-800 disabled:opacity-40 font-bold transition-colors flex items-center"
          >
            <ZoomOut className="w-3.5 h-3.5 mr-1" /> A-
          </button>

          {/* Resetar Fonte */}
          <button
            onClick={resetarFonte}
            title="Redefinir tamanho padrão da letra"
            aria-label="Redefinir tamanho padrão da letra"
            className="p-1 px-1.5 rounded hover:bg-slate-800 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Aumentar Fonte */}
          <button
            onClick={aumentarFonte}
            disabled={tamanhoFonte === 'extra-grande'}
            title="Aumentar tamanho da letra (A+)"
            aria-label="Aumentar tamanho da letra"
            className="p-1 px-2 rounded hover:bg-slate-800 disabled:opacity-40 font-bold transition-colors flex items-center"
          >
            <ZoomIn className="w-3.5 h-3.5 mr-1" /> A+
          </button>

          {/* Alternar Alto Contraste */}
          <button
            onClick={alternarAltoContraste}
            title={altoContraste ? "Desativar alto contraste" : "Ativar alto contraste"}
            aria-label={altoContraste ? "Desativar alto contraste" : "Ativar alto contraste"}
            className={`p-1 px-2.5 rounded font-bold transition-colors flex items-center ml-2 border ${
              altoContraste 
                ? 'bg-amber-400 text-slate-950 border-amber-300' 
                : 'hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> Alto Contraste
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 3. Exibir no topo do componente `src/components/Navbar.tsx`:
No início do `return (` do `Navbar.tsx`, chame `<AccessibilityToolbar />`.

### 4. Salvar e enviar o commit:
```bash
git add src/components/AccessibilityToolbar.tsx src/components/Navbar.tsx
git commit -m "feat(a11y): adiciona barra de ferramentas visual de acessibilidade"
git push -u origin a11y/barra-acessibilidade
```

---

## 🛠️ Tarefa 6: Integração do VLibras (Língua Brasileira de Sinais)
> **Objetivo:** Adicionar o widget oficial do VLibras para tradução automática em Libras com o avatar 3D.

### 1. Criar a branch no terminal:
```bash
git checkout main
git pull origin main
git checkout -b a11y/vlibras
```

### 2. Criar novo arquivo: `src/components/VLibras.tsx`
```tsx
'use client';

import Script from 'next/script';
import React from 'react';

export default function VLibras() {
  return (
    <>
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active" />
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper" />
        </div>
      </div>
      <Script
        src="https://vlibras.gov.br/app/vlibras-plugin.js"
        strategy="lazyOnload"
        onLoad={() => {
          // @ts-ignore
          if (window.VLibras) {
            // @ts-ignore
            new window.VLibras.Widget('https://vlibras.gov.br/app');
          }
        }}
      />
    </>
  );
}
```

### 3. Chamar no arquivo `src/app/layout.tsx`:
Importe `<VLibras />` e adicione logo antes do fechamento `</body>`.

### 4. Salvar e enviar o commit:
```bash
git add src/components/VLibras.tsx src/app/layout.tsx
git commit -m "feat(a11y): integra plugin oficial do VLibras para traducao em Libras"
git push -u origin a11y/vlibras
```

---

## 🛠️ Tarefa 7: Documentar a Acessibilidade no README e DOCUMENTACAO
> **Objetivo:** Registrar formalmente no `README.md` e `DOCUMENTACAO.md` a lista de diretrizes e recursos de acessibilidade para a banca avaliadora.

### 1. Criar a branch no terminal:
```bash
git checkout main
git pull origin main
git checkout -b docs/acessibilidade
```

### 2. Arquivos a editar: `README.md` e `DOCUMENTACAO.md`
Adicionar uma seção:
```markdown
## ♿ Recursos de Acessibilidade Implementados (WCAG 2.1 e e-MAG)

1. **Navegação por Teclado e Skip Link:** Atalho invisível para foco direto no conteúdo principal (`Tab`).
2. **Barra de Ferramentas de Acessibilidade:** Controle de tamanho de fontes (`A+` / `A-`) com persistência em `localStorage`.
3. **Modo de Alto Contraste:** Tema com contraste aumentado conforme padrão WCAG AAA.
4. **Semântica e Leitores de Tela:** Atributos ARIA (`aria-label`, `aria-expanded`, `aria-current`) implementados em botões e navegação.
5. **Acessibilidade em Libras (VLibras):** Integração do avatar 3D oficial para tradução em Língua Brasileira de Sinais.
```

### 3. Salvar e enviar o commit:
```bash
git add README.md DOCUMENTACAO.md
git commit -m "docs(a11y): documenta conformidade com diretrizes de acessibilidade WCAG"
git push -u origin docs/acessibilidade
```
