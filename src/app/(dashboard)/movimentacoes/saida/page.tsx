'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowDownCircle, 
  Search, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft, 
  Wrench, 
  ShoppingBag, 
  AlertOctagon,
  Plus,
  Minus
} from 'lucide-react';
import { ItemPeca, MotivoMovimentacao } from '@/types';

function BaixaPecaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedId = searchParams.get('pecaId') || searchParams.get('productId');

  const [pecas, setPecas] = useState<ItemPeca[]>([]);
  const [carregandoPecas, setCarregandoPecas] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [pecaSelecionada, setPecaSelecionada] = useState<ItemPeca | null>(null);

  const [quantidade, setQuantidade] = useState<number>(1);
  const [motivo, setMotivo] = useState<MotivoMovimentacao>('SERVICO_OS');
  const [observacoes, setObservacoes] = useState('');
  
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Carregar catálogo de peças
  useEffect(() => {
    const carregarCatalogo = async () => {
      try {
        setCarregandoPecas(true);
        const res = await fetch('/api/pecas');
        const data = await res.json();
        const lista: ItemPeca[] = data.pecas || data.products || [];
        setPecas(lista);

        if (preSelectedId) {
          const encontrada = lista.find((p) => p.id === parseInt(preSelectedId, 10));
          if (encontrada) setPecaSelecionada(encontrada);
        }
      } catch (err) {
        console.error('Erro ao carregar peças para baixa:', err);
      } finally {
        setCarregandoPecas(false);
      }
    };

    carregarCatalogo();
  }, [preSelectedId]);

  // Filtrar peças pelo campo de busca
  const resultadosBusca = useMemo(() => {
    if (!termoBusca.trim()) return pecas.slice(0, 6);
    const q = termoBusca.toLowerCase();
    return pecas.filter((p) => 
      p.nome.toLowerCase().includes(q) ||
      p.codigoSku?.toLowerCase().includes(q) ||
      p.compatibilidade.toLowerCase().includes(q) ||
      p.localizacaoPrateleira.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [pecas, termoBusca]);

  // Validação estrita de saldo negativo [RF07]
  const estoqueInsuficiente = pecaSelecionada ? quantidade > pecaSelecionada.quantidade : false;
  const estoqueZerado = pecaSelecionada ? pecaSelecionada.quantidade <= 0 : false;

  const handleConfirmarBaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pecaSelecionada) {
      setErro('Por favor, selecione uma peça.');
      return;
    }

    if (quantidade <= 0) {
      setErro('A quantidade deve ser maior que zero.');
      return;
    }

    if (estoqueInsuficiente) {
      setErro(`Saldo insuficiente! Há apenas ${pecaSelecionada.quantidade} unidade(s) disponível(is).`);
      return;
    }

    setErro('');
    setEnviando(true);

    try {
      const res = await fetch('/api/movimentacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pecaId: pecaSelecionada.id,
          tipo: 'SAIDA',
          quantidade,
          motivo,
          observacoes: observacoes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao registrar baixa.');
      }

      const novoSaldo = pecaSelecionada.quantidade - quantidade;
      setMensagemSucesso(`Baixa de ${quantidade} un. realizada com sucesso! Novo saldo: ${novoSaldo} un.`);
      
      setPecaSelecionada((prev) => prev ? { ...prev, quantidade: novoSaldo } : null);
      setPecas((prev) =>
        prev.map((p) => (p.id === pecaSelecionada.id ? { ...p, quantidade: novoSaldo } : p))
      );

      setObservacoes('');
      setQuantidade(1);
    } catch (err: any) {
      setErro(err.message || 'Falha ao processar baixa.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Botão de Retorno */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Voltar ao Painel
        </Link>
        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
          Uso Rápido no Pátio (&lt; 3 cliques)
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Cabeçalho de Destaque */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-red-600 p-5 sm:p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <ArrowDownCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">Baixa Rápida de Peça</h1>
              <p className="text-amber-100 text-xs sm:text-sm">
                Retirada para Ordem de Serviço, conserto ou balcão
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          {/* Mensagens de Sucesso e Erro */}
          {mensagemSucesso && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{mensagemSucesso}</span>
              </div>
              <button
                onClick={() => setMensagemSucesso('')}
                className="text-xs underline text-emerald-700 font-bold ml-2"
              >
                Fechar
              </button>
            </div>
          )}

          {erro && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-sm flex items-start space-x-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Atenção no Estoque:</strong>
                <span>{erro}</span>
              </div>
            </div>
          )}

          {/* PASSO 1: Seleção da Peça (Busca Rápida) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              1. Selecione a Peça a Retirar:
            </label>

            {!pecaSelecionada ? (
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    autoFocus
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    placeholder="Digite o nome, código ou carro (ex: relé, gol, h7)..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-amber-500 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {carregandoPecas ? (
                    <p className="text-xs text-center py-4 text-slate-400">Buscando peças...</p>
                  ) : resultadosBusca.length === 0 ? (
                    <p className="text-xs text-center py-4 text-slate-400">Nenhuma peça encontrada.</p>
                  ) : (
                    resultadosBusca.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPecaSelecionada(p);
                          setTermoBusca('');
                          setErro('');
                        }}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-300 text-left flex items-center justify-between transition-all group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-amber-900">
                            {p.nome}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center font-medium text-slate-700">
                              <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              {p.localizacaoPrateleira}
                            </span>
                            <span>&bull;</span>
                            <span>{p.compatibilidade}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-xs font-black px-2 py-1 rounded-lg ${
                            p.quantidade > 0 ? 'bg-slate-200 text-slate-900' : 'bg-rose-100 text-rose-700'
                          }`}>
                            Saldo: {p.quantidade} un.
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50/60 border-2 border-amber-300 rounded-2xl p-4 relative">
                <button
                  type="button"
                  onClick={() => {
                    setPecaSelecionada(null);
                    setErro('');
                  }}
                  className="absolute top-3 right-3 text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Trocar Peça
                </button>

                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded">
                  {pecaSelecionada.categoria}
                </span>

                <h2 className="text-lg font-black text-slate-900 mt-1">
                  {pecaSelecionada.nome}
                </h2>

                <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-700">
                  <div className="flex items-center font-bold text-blue-900 bg-blue-100/70 px-2.5 py-1 rounded-lg">
                    <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                    Local: {pecaSelecionada.localizacaoPrateleira}
                  </div>
                  <div>
                    Compatível: <span className="font-semibold">{pecaSelecionada.compatibilidade}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Disponível na Prateleira:</span>
                  <span className={`text-lg font-black ${
                    pecaSelecionada.quantidade > 0 ? 'text-slate-900' : 'text-rose-600'
                  }`}>
                    {pecaSelecionada.quantidade} unidade(s)
                  </span>
                </div>
              </div>
            )}
          </div>

          {pecaSelecionada && (
            <form onSubmit={handleConfirmarBaixa} className="space-y-6">
              {/* PASSO 2: Quantidade a Retirar */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  2. Quantidade a Retirar:
                </label>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 flex items-center justify-center font-bold transition-all text-xl"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={pecaSelecionada.quantidade > 0 ? pecaSelecionada.quantidade : 1}
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value, 10) || 1)}
                    className="w-24 h-12 text-center text-2xl font-black bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-amber-500 focus:outline-none focus:bg-white"
                  />

                  <button
                    type="button"
                    onClick={() => setQuantidade((q) => q + 1)}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 flex items-center justify-center font-bold transition-all text-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </button>

                  <div className="flex space-x-1.5 ml-2">
                    {[1, 2, 4].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setQuantidade(n)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                          quantidade === n
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        +{n}
                      </button>
                    ))}
                  </div>
                </div>

                {estoqueInsuficiente && (
                  <p className="mt-2 text-xs font-bold text-rose-600 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Quantidade solicitada ({quantidade}) excede o saldo em estoque ({pecaSelecionada.quantidade}). Baixa bloqueada!
                  </p>
                )}
              </div>

              {/* PASSO 3: Motivo da Saída */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                  3. Motivo da Saída:
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMotivo('SERVICO_OS')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      motivo === 'SERVICO_OS'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-5 h-5 mb-1" />
                    <span className="text-xs">Ordem de Serv.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMotivo('VENDA_BALCAO')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      motivo === 'VENDA_BALCAO'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5 mb-1" />
                    <span className="text-xs">Venda Balcão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMotivo('PERDA_DEFEITO')}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      motivo === 'PERDA_DEFEITO'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-md font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <AlertOctagon className="w-5 h-5 mb-1" />
                    <span className="text-xs">Perda / Defeito</span>
                  </button>
                </div>
              </div>

              {/* Observação / Número O.S. (Opcional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Observações / Placa do Veículo / Número da O.S. (Opcional):
                </label>
                <input
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: O.S. 1042 - Gol Branco placa ABC-1234"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                />
              </div>

              {/* Botão Principal de Confirmação */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={enviando || estoqueInsuficiente || estoqueZerado}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center space-x-2 shadow-xl transition-all active:scale-[0.98] ${
                    estoqueInsuficiente || estoqueZerado
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-slate-950 shadow-amber-500/30'
                  }`}
                >
                  <ArrowDownCircle className="w-6 h-6 text-slate-950" />
                  <span>
                    {enviando
                      ? 'Registrando Baixa...'
                      : estoqueZerado
                      ? 'Peça Esgotada no Estoque'
                      : estoqueInsuficiente
                      ? 'Saldo Insuficiente para Baixa'
                      : `Confirmar Baixa de ${quantidade} un.`}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BaixaPecaPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-16">
        <ArrowDownCircle className="w-10 h-10 mx-auto text-amber-500 animate-bounce mb-2" />
        <p className="text-sm font-semibold text-slate-600">Carregando baixa de peça...</p>
      </div>
    }>
      <BaixaPecaContent />
    </Suspense>
  );
}
