'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  History, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search, 
  Calendar, 
  User, 
} from 'lucide-react';
import { ItemMovimentacaoEstoque, TipoMovimentacao } from '@/types';
import { formatarDataHora, formatarMoeda, obterRotuloMotivo } from '@/lib/formatadores';

export default function MovimentacoesPage() {
  const [movimentacoes, setMovimentacoes] = useState<ItemMovimentacaoEstoque[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'ENTRADA' | 'SAIDA'>('TODOS');
  const [filtroMotivo, setFiltroMotivo] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  const carregarMovimentacoes = async () => {
    try {
      setCarregando(true);
      const res = await fetch('/api/movimentacoes?limite=100');
      const data = await res.json();
      setMovimentacoes(data.movimentacoes || data.movements || []);
    } catch (err) {
      console.error('Erro ao buscar movimentações:', err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarMovimentacoes();
  }, []);

  const movimentacoesFiltradas = useMemo(() => {
    return movimentacoes.filter((m) => {
      if (filtroTipo !== 'TODOS') {
        const tipoNorm = (m.tipo === 'ENTRADA' || (m as any).type === 'IN') ? 'ENTRADA' : 'SAIDA';
        if (tipoNorm !== filtroTipo) return false;
      }
      if (filtroMotivo !== 'TODOS') {
        const motivoNorm = m.motivo || (m as any).reason;
        if (motivoNorm !== filtroMotivo) return false;
      }
      if (termoBusca.trim() !== '') {
        const q = termoBusca.toLowerCase();
        const nomePeca = m.peca?.nome?.toLowerCase() || (m as any).product?.name?.toLowerCase() || '';
        const skuPeca = m.peca?.codigoSku?.toLowerCase() || (m as any).product?.skuCode?.toLowerCase() || '';
        const obs = m.observacoes?.toLowerCase() || (m as any).notes?.toLowerCase() || '';
        const nomeUsuario = m.usuario?.nome?.toLowerCase() || (m as any).user?.name?.toLowerCase() || '';
        return nomePeca.includes(q) || skuPeca.includes(q) || obs.includes(q) || nomeUsuario.includes(q);
      }
      return true;
    });
  }, [movimentacoes, filtroTipo, filtroMotivo, termoBusca]);

  const limparFiltros = () => {
    setTermoBusca('');
    setFiltroTipo('TODOS');
    setFiltroMotivo('TODOS');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Histórico de Movimentações
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Auditoria completa de entradas de estoque, baixas para serviços e vendas de balcão.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/movimentacoes/saida"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center shadow-sm"
          >
            <ArrowDownCircle className="w-4 h-4 mr-1.5" />
            Nova Baixa
          </Link>
          <Link
            href="/movimentacoes/entrada"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 flex items-center shadow-sm"
          >
            <ArrowUpCircle className="w-4 h-4 mr-1.5" />
            Nova Entrada
          </Link>
        </div>
      </div>

      {/* Barra de Filtros [RF08] */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 lg:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar por peça, O.S., observação ou responsável..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-3">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="TODOS">Todos os Tipos</option>
              <option value="ENTRADA">Somente Entradas (+)</option>
              <option value="SAIDA">Somente Baixas / Saídas (-)</option>
            </select>
          </div>

          <div className="sm:col-span-3 lg:col-span-3">
            <select
              value={filtroMotivo}
              onChange={(e) => setFiltroMotivo(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="TODOS">Todos os Motivos</option>
              <option value="SERVICO_OS">Aplicação em O.S.</option>
              <option value="VENDA_BALCAO">Venda Balcão</option>
              <option value="COMPRA_REPOSICAO">Compra / Reposição</option>
              <option value="PERDA_DEFEITO">Perda / Defeito</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 pt-1 flex justify-between items-center">
          <span>Mostrando {movimentacoesFiltradas.length} registro(s)</span>
          {(termoBusca || filtroTipo !== 'TODOS' || filtroMotivo !== 'TODOS') && (
            <button
              onClick={limparFiltros}
              className="text-blue-600 font-semibold hover:underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de Movimentações */}
      {carregando ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <History className="w-10 h-10 mx-auto text-blue-500 animate-bounce mb-2" />
          <p className="text-sm font-semibold text-slate-600">Carregando histórico...</p>
        </div>
      ) : movimentacoesFiltradas.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <History className="w-12 h-12 mx-auto text-slate-400 mb-2" />
          <h3 className="text-base font-bold text-slate-800">Nenhum registro encontrado</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tente redefinir os filtros acima ou realize uma nova movimentação.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
          {movimentacoesFiltradas.map((mov) => {
            const isEntrada = mov.tipo === 'ENTRADA' || (mov as any).type === 'IN';
            const nomePeca = mov.peca?.nome || (mov as any).product?.name || 'Peça';
            const pecaId = mov.pecaId || (mov as any).productId;
            const nomeUsuario = mov.usuario?.nome || (mov as any).user?.name || 'Oficina GUCAR';
            const saldoPeca = mov.peca?.quantidade ?? (mov as any).product?.quantity;
            const custo = mov.custoUnitario ?? (mov as any).unitCost;

            return (
              <div
                key={mov.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isEntrada ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isEntrada ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <Link
                        href={`/pecas/${pecaId}`}
                        className="text-sm sm:text-base font-bold text-slate-900 hover:text-blue-600 hover:underline"
                      >
                        {nomePeca}
                      </Link>

                      {/* Motivo Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        mov.motivo === 'SERVICO_OS' || (mov as any).reason === 'SERVICE'
                          ? 'bg-blue-100 text-blue-800'
                          : mov.motivo === 'VENDA_BALCAO' || (mov as any).reason === 'SALE'
                          ? 'bg-purple-100 text-purple-800'
                          : mov.motivo === 'COMPRA_REPOSICAO' || (mov as any).reason === 'PURCHASE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {obterRotuloMotivo(mov.motivo || (mov as any).reason)}
                      </span>
                    </div>

                    {(mov.observacoes || (mov as any).notes) && (
                      <p className="text-xs text-slate-600 font-medium">
                        {mov.observacoes || (mov as any).notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatarDataHora(mov.criadoEm || (mov as any).createdAt)}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {nomeUsuario}
                      </span>
                      {custo && custo > 0 && (
                        <>
                          <span>&bull;</span>
                          <span>Custo unitário: {formatarMoeda(custo)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center justify-between sm:justify-end sm:flex-col self-end sm:self-auto w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className={`text-base sm:text-lg font-black px-3 py-1 rounded-xl ${
                    isEntrada
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {isEntrada ? `+${mov.quantidade}` : `-${mov.quantidade}`} un.
                  </span>
                  {saldoPeca !== undefined && (
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Saldo restante: {saldoPeca} un.
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
