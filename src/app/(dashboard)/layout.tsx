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
      <Navbar userName={usuario?.nome || 'Gustavo Martins'} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
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
