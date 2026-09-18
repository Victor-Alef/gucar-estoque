'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  ArrowLeft, 
  Save, 
  Trash2, 
  MapPin, 
  Car, 
  AlertCircle,
  History,
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle2,
} from 'lucide-react';
import { ItemPeca } from '@/types';
import { formatarDataHora, obterRotuloMotivo } from '@/lib/formatadores';

const CATEGORIAS_PADRAO = [
  'Iluminação',
  'Chicotes',
  'Fusíveis',
  'Alternadores',
  'Sensores',
  'Ignição',
  'Baterias',
  'Acessórios',
  'Outros',
];

export default function EditarPecaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [peca, setPeca] = useState<any>(null);

  const [formData, setFormData] = useState({
    codigoSku: '',
    nome: '',
    categoria: 'Iluminação',
    compatibilidade: 'Universal',
    localizacaoPrateleira: '',
    quantidadeMinima: '2',
    precoCusto: '',
    precoVenda: '',
  });

  useEffect(() => {
    if (!id) return;

    const carregarPeca = async () => {
      try {
        setCarregando(true);
        const res = await fetch(`/api/pecas/${id}`);
        if (!res.ok) throw new Error('Peça não encontrada.');
        const data = await res.json();
        const p = data.peca || data.product;
        setPeca(p);
        setFormData({
          codigoSku: p.codigoSku || p.skuCode || '',
          nome: p.nome || p.name || '',
          categoria: p.categoria || p.category || 'Iluminação',
          compatibilidade: p.compatibilidade || p.compatibility || 'Universal',
          localizacaoPrateleira: p.localizacaoPrateleira || p.shelfLocation || '',
          quantidadeMinima: String(p.quantidadeMinima ?? p.minQuantity ?? 2),
          precoCusto: String(p.precoCusto ?? p.costPrice ?? 0),
          precoVenda: String(p.precoVenda ?? p.salePrice ?? 0),
        });
      } catch (err: any) {
        setErro(err.message || 'Erro ao carregar dados da peça.');
      } finally {
        setCarregando(false);
      }
    };

    carregarPeca();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    try {
      setSalvando(true);
      const res = await fetch(`/api/pecas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoSku: formData.codigoSku.trim() || null,
          nome: formData.nome.trim(),
          categoria: formData.categoria.trim(),
          compatibilidade: formData.compatibilidade.trim(),
          localizacaoPrateleira: formData.localizacaoPrateleira.trim(),
          quantidadeMinima: parseInt(formData.quantidadeMinima, 10) || 2,
          precoCusto: parseFloat(formData.precoCusto) || 0,
          precoVenda: parseFloat(formData.precoVenda) || 0,
        }),
      });

      if (!res.ok) throw new Error('Falha ao atualizar dados da peça.');
      setSucesso('Dados da peça atualizados com sucesso!');
      router.refresh();
    } catch (err: any) {
      setErro(err.message || 'Erro ao atualizar.');
    } finally {
      setSalvando(false);
    }
  };

  const handleInactivate = async () => {
    if (!confirm('Deseja realmente inativar esta peça do catálogo? O histórico de movimentações será preservado.')) {
      return;
    }

    try {
      setSalvando(true);
      const res = await fetch(`/api/pecas/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao inativar peça.');
      router.push('/pecas');
    } catch (err: any) {
      setErro(err.message || 'Erro ao inativar peça.');
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="text-center py-20">
        <Package className="w-10 h-10 mx-auto text-blue-500 animate-bounce mb-2" />
        <p className="text-sm font-semibold text-slate-600">Carregando dados da peça...</p>
      </div>
    );
  }

  const saldo = peca?.quantidade ?? peca?.quantity ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Voltar */}
      <div className="flex items-center justify-between">
        <Link
          href="/pecas"
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Voltar ao Catálogo
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8">
        {/* Topo com Saldo Atual e Ações */}
        <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{peca?.nome || peca?.name}</h1>
              <p className="text-xs text-slate-500">
                Localização: <strong className="text-slate-700">{peca?.localizacaoPrateleira || peca?.shelfLocation}</strong>
              </p>
            </div>
          </div>

          {/* Badge de Saldo Atual */}
          <div className="flex items-center space-x-3 self-start sm:self-auto bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Saldo Atual
              </span>
              <span className="text-xl font-black text-slate-900">
                {saldo} un.
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <Link
                href={`/movimentacoes/saida?pecaId=${id}`}
                className="px-2.5 py-1 text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg flex items-center"
              >
                <ArrowDownCircle className="w-3.5 h-3.5 mr-1" /> Baixa
              </Link>
              <Link
                href={`/movimentacoes/entrada?pecaId=${id}`}
                className="px-2.5 py-1 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg flex items-center"
              >
                <ArrowUpCircle className="w-3.5 h-3.5 mr-1" /> Entrada
              </Link>
            </div>
          </div>
        </div>

        {erro && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{erro}</span>
          </div>
        )}

        {sucesso && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>{sucesso}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nome / Descrição da Peça *
            </label>
            <input
              type="text"
              name="nome"
              required
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Código SKU / Fabricante
              </label>
              <input
                type="text"
                name="codigoSku"
                value={formData.codigoSku}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Categoria / Família *
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                {CATEGORIAS_PADRAO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Localização Física na Oficina *
              </label>
              <input
                type="text"
                name="localizacaoPrateleira"
                required
                value={formData.localizacaoPrateleira}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center">
                <Car className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Veículo / Modelo Compatível *
              </label>
              <input
                type="text"
                name="compatibilidade"
                required
                value={formData.compatibilidade}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estoque Mínimo
              </label>
              <input
                type="number"
                name="quantidadeMinima"
                min="1"
                value={formData.quantidadeMinima}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-center text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Custo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                name="precoCusto"
                value={formData.precoCusto}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-center text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                name="precoVenda"
                value={formData.precoVenda}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-center text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleInactivate}
              disabled={salvando}
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Inativar Peça
            </button>

            <button
              type="submit"
              disabled={salvando}
              className="inline-flex items-center px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>

        {/* Histórico Específico desta Peça */}
        {peca?.movimentacoes && peca.movimentacoes.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center">
              <History className="w-4 h-4 mr-1.5 text-slate-500" />
              Últimas Movimentações desta Peça
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {peca.movimentacoes.map((m: any) => {
                const isEntrada = m.tipo === 'ENTRADA' || m.type === 'IN';
                return (
                  <div key={m.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className={`font-bold mr-2 ${isEntrada ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {isEntrada ? '+ Entrada' : '- Saída'} ({m.quantidade ?? m.quantity} un.)
                      </span>
                      <span className="text-slate-500">
                        {obterRotuloMotivo(m.motivo || m.reason)}
                        {m.observacoes && ` • ${m.observacoes}`}
                      </span>
                    </div>
                    <span className="text-slate-400">
                      {formatarDataHora(m.criadoEm || m.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
