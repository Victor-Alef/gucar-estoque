'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Plus, 
  MapPin, 
  AlertTriangle, 
  Package, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Edit3, 
  Car, 
  CheckCircle2,
} from 'lucide-react';
import { ItemPeca } from '@/types';

function PecasContent() {
  const searchParams = useSearchParams();
  const initialAlertOnly = 
    searchParams.get('apenasCriticos') === 'true' || 
    searchParams.get('alertOnly') === 'true';

  const [pecas, setPecas] = useState<ItemPeca[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('ALL');
  const [apenasCriticos, setApenasCriticos] = useState(initialAlertOnly);

  const carregarPecas = async () => {
    try {
      setCarregando(true);
      const res = await fetch('/api/pecas');
      if (!res.ok) throw new Error('Falha ao obter catálogo de peças.');
      const data = await res.json();
      setPecas(data.pecas || data.products || []);
      setCategorias(data.categorias || data.categories || []);
    } catch (err) {
      console.error('Erro ao buscar catálogo de peças:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPecas();
  }, []);

  // Filtragem local instantânea para alta performance
  const pecasFiltradas = useMemo(() => {
    return pecas.filter((p) => {
      // Filtro por categoria
      if (categoriaSelecionada !== 'ALL' && p.categoria !== categoriaSelecionada) {
        return false;
      }

      // Filtro por estoque crítico
      if (apenasCriticos && p.quantidade > p.quantidadeMinima) {
        return false;
      }

      // Filtro por texto (Nome, SKU, Compatibilidade ou Localização)
      if (termoBusca.trim() !== '') {
        const termo = termoBusca.toLowerCase();
        const correspondeNome = p.nome.toLowerCase().includes(termo);
        const correspondeSku = p.codigoSku?.toLowerCase().includes(termo);
        const correspondeCompat = p.compatibilidade.toLowerCase().includes(termo);
        const correspondeLocal = p.localizacaoPrateleira.toLowerCase().includes(termo);
        return Boolean(correspondeNome || correspondeSku || correspondeCompat || correspondeLocal);
      }

      return true;
    });
  }, [pecas, categoriaSelecionada, apenasCriticos, termoBusca]);

  const limparFiltros = () => {
    setTermoBusca('');
    setCategoriaSelecionada('ALL');
    setApenasCriticos(false);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Catálogo de Peças Automotivas
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Consulte disponibilidade, localização física na oficina e faça baixas imediatas.
          </p>
        </div>

        <Link
          href="/pecas/nova"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Cadastrar Nova Peça
        </Link>
      </div>

      {/* Barra de Filtros e Busca Rápida [RF05] */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Campo de Busca Principal */}
          <div className="sm:col-span-6 lg:col-span-7 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar por nome, SKU, carro (ex: Gol, Palio) ou gaveta..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filtro de Categoria */}
          <div className="sm:col-span-3 lg:col-span-3">
            <div className="relative">
              <select
                value={categoriaSelecionada}
                onChange={(e) => setCategoriaSelecionada(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="ALL">Todas as Categorias</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggle de Somente Críticos */}
          <div className="sm:col-span-3 lg:col-span-2 flex items-center">
            <button
              onClick={() => setApenasCriticos(!apenasCriticos)}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all border ${
                apenasCriticos
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Só Críticos</span>
            </button>
          </div>
        </div>

        {/* Contador de Resultados */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Mostrando <strong>{pecasFiltradas.length}</strong> de <strong>{pecas.length}</strong> peças cadastradas
          </span>
          {(termoBusca || categoriaSelecionada !== 'ALL' || apenasCriticos) && (
            <button
              onClick={limparFiltros}
              className="text-blue-600 font-semibold hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid Responsivo de Peças */}
      {carregando ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Package className="w-10 h-10 mx-auto text-blue-500 animate-bounce mb-2" />
          <p className="text-sm font-semibold text-slate-600">Carregando catálogo...</p>
        </div>
      ) : pecasFiltradas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
          <Package className="w-12 h-12 mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-slate-800">Nenhuma peça encontrada</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Não encontramos peças com os critérios de busca atuais. Tente mudar os filtros ou cadastre um novo item.
          </p>
          <div className="mt-4 flex justify-center space-x-3">
            <button
              onClick={limparFiltros}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Resetar Filtros
            </button>
            <Link
              href="/pecas/nova"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
            >
              Cadastrar Peça
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pecasFiltradas.map((p) => {
            const isCritico = p.quantidade <= p.quantidadeMinima;
            const isZerado = p.quantidade === 0;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl shadow-sm border p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-md ${
                  isZerado
                    ? 'border-rose-300 bg-rose-50/20'
                    : isCritico
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Cabeçalho do Card: Categoria, SKU e Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {p.categoria}
                    </span>

                    {/* Badge de Alerta de Estoque */}
                    {isZerado ? (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        ESGOTADO
                      </span>
                    ) : isCritico ? (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        CRÍTICO (Mín: {p.quantidadeMinima})
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Normal
                      </span>
                    )}
                  </div>

                  {/* Nome da Peça */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {p.nome}
                  </h3>

                  {/* SKU / Código */}
                  {p.codigoSku && (
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      Cód: <span className="font-semibold text-slate-700">{p.codigoSku}</span>
                    </p>
                  )}

                  {/* Detalhes de Oficina: Localização e Compatibilidade */}
                  <div className="mt-3.5 space-y-1.5 text-xs">
                    {/* Localização Física em Destaque [RF04] */}
                    <div className="flex items-center text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/70">
                      <MapPin className="w-4 h-4 mr-1.5 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-slate-800">{p.localizacaoPrateleira}</span>
                    </div>

                    {/* Compatibilidade de Veículos */}
                    <div className="flex items-start text-slate-600 px-1">
                      <Car className="w-3.5 h-3.5 mr-1.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{p.compatibilidade}</span>
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card: Quantidade em Estoque e Ações Rápidas */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                      Saldo Atual
                    </span>
                    <span className={`text-xl font-black ${
                      isZerado ? 'text-rose-600' : isCritico ? 'text-amber-600' : 'text-slate-900'
                    }`}>
                      {p.quantidade} <span className="text-xs font-normal text-slate-500">un.</span>
                    </span>
                  </div>

                  {/* Botões de Ação Imediata */}
                  <div className="flex items-center space-x-1.5">
                    {/* Botão Baixa Rápida (< 3 cliques) */}
                    <Link
                      href={`/movimentacoes/saida?pecaId=${p.id}`}
                      title="Dar baixa nesta peça"
                      className={`p-2 rounded-xl text-xs font-bold flex items-center transition-all ${
                        p.quantidade > 0
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      <ArrowDownCircle className="w-4 h-4 mr-1 text-amber-700" />
                      Baixa
                    </Link>

                    {/* Botão Entrada */}
                    <Link
                      href={`/movimentacoes/entrada?pecaId=${p.id}`}
                      title="Dar entrada no estoque"
                      className="p-2 rounded-xl text-xs font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 flex items-center transition-all"
                    >
                      <ArrowUpCircle className="w-4 h-4 mr-1 text-emerald-700" />
                      Entrada
                    </Link>

                    {/* Editar Peça */}
                    <Link
                      href={`/pecas/${p.id}`}
                      title="Editar cadastro"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PecasPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-16">
        <Package className="w-10 h-10 mx-auto text-blue-500 animate-bounce mb-2" />
        <p className="text-sm font-semibold text-slate-600">Carregando catálogo...</p>
      </div>
    }>
      <PecasContent />
    </Suspense>
  );
}
