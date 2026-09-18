'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Wrench, 
  LayoutDashboard, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  History, 
  LogOut, 
  Menu, 
  X,
  AlertTriangle,
  User as UserIcon,
  Zap
} from 'lucide-react';

interface NavbarProps {
  userName?: string;
  nomeUsuario?: string;
}

export default function Navbar({ userName, nomeUsuario }: NavbarProps) {
  const nomeExibicao = nomeUsuario || userName || 'Gustavo Martins';
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoggingOut(false);
    }
  };

  const navLinks = [
    { href: '/', label: 'Painel Geral', icon: LayoutDashboard },
    { href: '/pecas', label: 'Catálogo de Peças', icon: Package },
    { href: '/movimentacoes/saida', label: 'Baixa de Peça', icon: ArrowDownCircle, highlight: true },
    { href: '/movimentacoes/entrada', label: 'Entrada de Estoque', icon: ArrowUpCircle },
    { href: '/movimentacoes', label: 'Histórico', icon: History },
  ];

  return (
    <>
      {/* Header Superior Desktop e Mobile */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo e Identidade GUCAR */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-6 h-6 text-white fill-amber-300" />
              </div>
              <div>
                <span className="text-xl font-black tracking-wider text-white">GUCAR</span>
                <span className="text-xs block text-blue-400 font-medium -mt-1">AUTOELÉTRICA</span>
              </div>
            </Link>

            {/* Links Desktop */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      link.highlight
                        ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Usuário e Logout Desktop */}
            <div className="hidden md:flex items-center space-x-4 border-l border-slate-800 pl-4">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-semibold">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white leading-tight">{nomeExibicao}</p>
                  <p className="text-slate-400 text-[10px]">Proprietário</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                title="Sair do sistema"
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Botão Menu Mobile */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Expandido Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
            <div className="py-2 px-3 mb-2 bg-slate-800/60 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">{nomeExibicao}</span>
                  <span className="block text-[10px] text-slate-400">Autoelétrica GUCAR</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 hover:text-red-300 flex items-center space-x-1 bg-red-950/40 px-2.5 py-1 rounded-md border border-red-800/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    link.highlight
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                      : isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Barra de Navegação Inferior Fixa Mobile (App-like para oficina) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-1.5 px-3 flex justify-around items-center">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg ${
            pathname === '/' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Início</span>
        </Link>

        <Link
          href="/pecas"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg ${
            pathname === '/pecas' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Peças</span>
        </Link>

        {/* Botão de Destaque Central: Baixa Rápida de Peça no Pátio */}
        <Link
          href="/movimentacoes/saida"
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-red-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 active:scale-95 transition-transform border-2 border-slate-900">
            <ArrowDownCircle className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-amber-400 mt-0.5">Baixa O.S.</span>
        </Link>

        <Link
          href="/movimentacoes/entrada"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg ${
            pathname === '/movimentacoes/entrada' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpCircle className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Entrada</span>
        </Link>

        <Link
          href="/movimentacoes"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg ${
            pathname === '/movimentacoes' ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span className="text-[11px]">Histórico</span>
        </Link>
      </div>
    </>
  );
}
