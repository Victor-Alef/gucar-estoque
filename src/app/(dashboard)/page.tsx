'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  AlertTriangle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Plus, 
  ArrowRight, 
  MapPin, 
  RotateCcw,
  Zap,
} from 'lucide-react';
import { EstatisticasPainel, ItemPeca, ItemMovimentacaoEstoque } from '@/types';
import { CardKpi } from '@/components/CardKpi';
import { formatarDataHora, obterRotuloMotivo } from '@/lib/formatadores';

export default function DashboardPage() {
  const [stats, setStats] = useState<EstatisticasPainel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarDadosPainel = async () => {
    try {
      setCarregando(true);
      setErro('');
      const resposta = await fetch('/api/painel');
      if (!resposta.ok) {
        throw new Error('Falha ao carregar indicadores operacionais.');
      }
      const dados = await resposta.json();
      setStats({
        totalPecas: dados.totalPecas ?? dados.totalProducts ?? 0,
        pecasCriticasContagem: dados.pecasCriticasContagem ?? dados.criticalStockCount ?? 0,
        entradasSemanaContagem: dados.entradasSemanaContagem ?? dados.weeklyEntriesCount ?? 0,
        saidasSemanaContagem: dados.saidasSemanaContagem ?? dados.weeklyExitsCount ?? 0,
        pecasCriticas: dados.pecasCriticas ?? dados.criticalProducts ?? [],
        movimentacoesRecentes: dados.movimentacoesRecentes ?? dados.recentMovements ?? [],
      });
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar dados do painel.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosPainel();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner de Boas-vindas e Ações Rápidas */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-5 sm:p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Painel Operacional da Autoelétrica</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Controle de Estoque GUCAR
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Visão em tempo real de peças, baixas para ordens de serviço e alertas de compra.
          </p>
        </div>

        {/* Botões de Ação Imediata no Pátio */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/movimentacoes/saida"
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <ArrowDownCircle className="w-4 h-4 mr-1.5" />
            <span>Dar Baixa (O.S.)</span>
          </Link>
          <Link
            href="/movimentacoes/entrada"
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <ArrowUpCircle className="w-4 h-4 mr-1.5" />
            <span>Nova Entrada</span>
          </Link>
          <Link
            href="/pecas/nova"
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Cadastrar Peça</span>
          </Link>
        </div>
      </div>

      {/* Alerta de erro */}
      {erro && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between text-sm">
          <span>{erro}</span>
          <button
            onClick={carregarDadosPainel}
            className="flex items-center text-xs font-semibold underline ml-2 hover:text-red-800"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Tentar novamente
          </button>
        </div>
      )}

      {/* Grid de Cards de Métricas Rápidas (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <CardKpi
          titulo="Total de Itens"
          valor={carregando ? '-' : stats?.totalPecas ?? 0}
          icone={<Package className="w-5 h-5 text-blue-400" />}
          corIcone="bg-blue-500/20"
          subtitulo="Modelos ativos no catálogo"
        />

        <CardKpi
          titulo="Estoque Crítico"
          valor={carregando ? '-' : stats?.pecasCriticasContagem ?? 0}
          icone={<AlertTriangle className="w-5 h-5 text-rose-400" />}
          corIcone="bg-rose-500/20"
          subtitulo={
            (stats?.pecasCriticasContagem ?? 0) > 0
              ? 'Abaixo do mínimo recomendado'
              : 'Estoque regularizado'
          }
          alerta={(stats?.pecasCriticasContagem ?? 0) > 0}
        />

        <CardKpi
          titulo="Entradas (7 dias)"
          valor={carregando ? '-' : stats?.entradasSemanaContagem ?? 0}
          icone={<ArrowUpCircle className="w-5 h-5 text-emerald-400" />}
          corIcone="bg-emerald-500/20"
          subtitulo="Reposições recebidas"
        />

        <CardKpi
          titulo="Saídas (7 dias)"
          valor={carregando ? '-' : stats?.saidasSemanaContagem ?? 0}
          icone={<ArrowDownCircle className="w-5 h-5 text-amber-400" />}
          corIcone="bg-amber-500/20"
          subtitulo="Peças aplicadas em O.S."
        />
      </div>

      {/* Seção de Alertas Visuais de Reposição Urgente */}
      {stats && stats.pecasCriticas && stats.pecasCriticas.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-rose-200 overflow-hidden">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50 via-red-50/50 to-white border-b border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-rose-500 text-white">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-rose-950">
                  Atenção: Peças com Estoque Crítico (Comprar c/ Urgência)
                </h2>
                <p className="text-xs text-rose-700">
                  Estes itens atingiram o limite de segurança e precisam de reposição imediata.
                </p>
              </div>
            </div>
            <Link
              href="/pecas?apenasCriticos=true"
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center self-start sm:self-auto underline"
            >
              Ver todos os críticos <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-rose-100">
            {stats.pecasCriticas.map((peca: ItemPeca) => (
              <div
                key={peca.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose-50/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {peca.nome}
                    </span>
                    {peca.codigoSku && (
                      <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {peca.codigoSku}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                      Saldo: {peca.quantidade} un. (Mín: {peca.quantidadeMinima})
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center text-slate-600">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {peca.localizacaoPrateleira}
                    </span>
                    <span>&bull;</span>
                    <span>
                      Compatível: <strong className="text-slate-700">{peca.compatibilidade}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <Link
                    href={`/movimentacoes/entrada?pecaId=${peca.id}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5 mr-1" />
                    Repor Peça
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Histórico Recente & Atalhos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Histórico Recente de Movimentações */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Últimas Movimentações na Oficina
              </h2>
              <p className="text-xs text-slate-500">Registro em tempo real de entradas e saídas</p>
            </div>
            <Link
              href="/movimentacoes"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center"
            >
              Ver tudo <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {carregando ? (
            <p className="text-center py-8 text-sm text-slate-400">Carregando movimentações...</p>
          ) : !stats?.movimentacoesRecentes || stats.movimentacoesRecentes.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Package className="w-8 h-8 mx-auto text-slate-400 mb-1" />
              <p className="text-sm font-medium text-slate-600">Nenhuma movimentação recente</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.movimentacoesRecentes.map((mov: ItemMovimentacaoEstoque) => {
                const isEntrada = mov.tipo === 'ENTRADA';
                return (
                  <div key={mov.id} className="py-3 flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isEntrada ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isEntrada ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {mov.peca?.nome || 'Peça'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {obterRotuloMotivo(mov.motivo)}
                          {mov.observacoes && ` • ${mov.observacoes}`}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatarDataHora(mov.criadoEm)} &bull; por {mov.usuario?.nome || 'Oficina'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm font-black px-2 py-0.5 rounded-md ${
                        isEntrada ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {isEntrada ? `+${mov.quantidade}` : `-${mov.quantidade}`} un.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Coluna Direita: Atalhos Rápidos da Oficina */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-2xl p-5 text-white shadow-md">
            <h3 className="font-black text-lg">Autoelétrica GUCAR</h3>
            <p className="text-xs text-blue-200 mt-1">
              Atendimento ágil no pátio e controle preventivo de reposição de relés, chicotes e fusíveis.
            </p>

            <div className="mt-5 space-y-2">
              <Link
                href="/movimentacoes/saida"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <ArrowDownCircle className="w-4 h-4 text-amber-400" />
                  <span>Baixar Peça em 3 Cliques</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-300" />
              </Link>

              <Link
                href="/pecas"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span>Consultar Gavetas e Prateleiras</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-300" />
              </Link>

              <Link
                href="/movimentacoes/entrada"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold transition-colors"
              >
                <div className="flex items-center space-x-2.5">
                  <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                  <span>Registrar Chegada de Peça</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-300" />
              </Link>
            </div>
          </div>

          {/* Dica de Operação */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-amber-900">
            <div className="flex items-start space-x-2.5">
              <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Dica de Agilidade
                </h4>
                <p className="text-xs text-amber-700 mt-1">
                  Você pode usar o atalho de <strong>Baixa O.S.</strong> diretamente pelo botão redondo no menu inferior do smartphone sem sair de perto do veículo!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
