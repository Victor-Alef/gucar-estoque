'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowUpCircle, 
  Search, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft, 
  Plus, 
  Truck, 
  AlertCircle
} from 'lucide-react';
import { ItemPeca } from '@/types';

function EntradaEstoqueContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedId = searchParams.get('pecaId') || searchParams.get('productId');

  const [pecas, setPecas] = useState<ItemPeca[]>([]);
  const [carregandoPecas, setCarregandoPecas] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');
  const [pecaSelecionada, setPecaSelecionada] = useState<ItemPeca | null>(null);

  const [quantidade, setQuantidade] = useState<string>('5');
  const [custoUnitario, setCustoUnitario] = useState<string>('');
  const [observacoes, setObservacoes] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  useEffect(() => {
    const carregarPecas = async () => {
      try {
        setCarregandoPecas(true);
        const res = await fetch('/api/pecas');
        const data = await res.json();
        const lista: ItemPeca[] = data.pecas || data.products || [];
        setPecas(lista);

        if (preSelectedId) {
          const encontrada = lista.find((p) => p.id === parseInt(preSelectedId, 10));
          if (encontrada) {
            setPecaSelecionada(encontrada);
            setCustoUnitario(String(encontrada.precoCusto || ''));
          }
        }
      } catch (err) {
        console.error('Erro ao carregar peças para entrada:', err);
      } finally {
        setCarregandoPecas(false);
      }
    };

    carregarPecas();
  }, [preSelectedId]);

  const resultadosBusca = useMemo(() => {
    if (!termoBusca.trim()) return pecas.slice(0, 6);
    const q = termoBusca.toLowerCase();
    return pecas.filter((p) => 
      p.nome.toLowerCase().includes(q) ||
      p.codigoSku?.toLowerCase().includes(q) ||
      p.compatibilidade.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [pecas, termoBusca]);

  const handleConfirmarEntrada = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pecaSelecionada) {
      setErro('Por favor, selecione uma peça para dar entrada.');
      return;
    }

    const qtd = parseInt(quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) {
      setErro('A quantidade deve ser um número maior que zero.');
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
          tipo: 'ENTRADA',
          quantidade: qtd,
          motivo: 'COMPRA_REPOSICAO',
          custoUnitario: custoUnitario ? parseFloat(custoUnitario) : undefined,
          observacoes: observacoes.trim() || 'Reposição de estoque',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar entrada.');

      const novoSaldo = pecaSelecionada.quantidade + qtd;
      setMensagemSucesso(`Entrada de ${qtd} un. registrada com sucesso! Novo saldo: ${novoSaldo} un.`);
      setPecaSelecionada((prev) => prev ? { ...prev, quantidade: novoSaldo } : null);
      setPecas((prev) =>
        prev.map((p) => (p.id === pecaSelecionada.id ? { ...p, quantidade: novoSaldo } : p))
      );

      setObservacoes('');
    } catch (err: any) {
      setErro(err.message || 'Falha ao processar entrada.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Voltar ao Painel
        </Link>
        <Link
          href="/pecas/nova"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Peça não cadastrada? Criar nova
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 sm:p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <ArrowUpCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black">Entrada de Estoque</h1>
              <p className="text-emerald-100 text-xs sm:text-sm">
                Registro de compras de fornecedores e reposição na oficina
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
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
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Erro:</strong>
                <span>{erro}</span>
              </div>
            </div>
          )}

          {/* Seleção de Peça */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              1. Selecione a Peça Recebida:
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
                    placeholder="Digite o nome, código ou modelo de carro..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:bg-white transition-all shadow-inner"
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
                          setCustoUnitario(String(p.precoCusto || ''));
                          setTermoBusca('');
                          setErro('');
                        }}
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-300 text-left flex items-center justify-between transition-all group"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-900">
                            {p.nome}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center text-slate-700">
                              <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              {p.localizacaoPrateleira}
                            </span>
                            <span>&bull;</span>
                            <span>{p.compatibilidade}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black px-2 py-1 rounded-lg bg-slate-200 text-slate-900">
                            Saldo: {p.quantidade} un.
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/60 border-2 border-emerald-300 rounded-2xl p-4 relative">
                <button
                  type="button"
                  onClick={() => {
                    setPecaSelecionada(null);
                    setErro('');
                  }}
                  className="absolute top-3 right-3 text-xs font-bold text-emerald-900 bg-emerald-200/80 hover:bg-emerald-300 px-2.5 py-1 rounded-lg transition-colors"
                >
                  Trocar Peça
                </button>

                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/70 px-2 py-0.5 rounded">
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
                    Saldo Atual: <strong className="text-slate-900">{pecaSelecionada.quantidade} un.</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {pecaSelecionada && (
            <form onSubmit={handleConfirmarEntrada} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    2. Quantidade Chegando:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    className="w-full px-4 py-3 text-xl font-black bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Valor de Custo Unitário (R$):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={custoUnitario}
                    onChange={(e) => setCustoUnitario(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 text-lg font-bold bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Fornecedor / Nota Fiscal / Observações:
                </label>
                <input
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: NF-5840 Distribuidora Elétrica SP"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-xl shadow-emerald-600/25 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <ArrowUpCircle className="w-6 h-6 text-white" />
                  <span>
                    {enviando ? 'Registrando Entrada...' : `Confirmar Entrada de ${quantidade} un.`}
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

export default function EntradaEstoquePage() {
  return (
    <Suspense fallback={
      <div className="text-center py-16">
        <ArrowUpCircle className="w-10 h-10 mx-auto text-emerald-500 animate-bounce mb-2" />
        <p className="text-sm font-semibold text-slate-600">Carregando entrada de estoque...</p>
      </div>
    }>
      <EntradaEstoqueContent />
    </Suspense>
  );
}
