
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
      {/* Link de acessibilidade para pular ao conteúdo principal */}
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