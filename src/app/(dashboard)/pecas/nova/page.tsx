'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  ArrowLeft, 
  Save, 
  MapPin, 
  Car, 
  AlertCircle,
} from 'lucide-react';

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

export default function NovaPecaPage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [formData, setFormData] = useState({
    codigoSku: '',
    nome: '',
    categoria: 'Iluminação',
    compatibilidade: 'Universal',
    localizacaoPrateleira: '',
    quantidade: '0',
    quantidadeMinima: '2',
    precoCusto: '',
    precoVenda: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!formData.nome.trim()) {
      setErro('O nome ou descrição da peça é obrigatório.');
      return;
    }

    if (!formData.localizacaoPrateleira.trim()) {
      setErro('A localização física (prateleira/gaveta) é obrigatória para localização rápida na oficina.');
      return;
    }

    try {
      setCarregando(true);
      const res = await fetch('/api/pecas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoSku: formData.codigoSku.trim() || null,
          nome: formData.nome.trim(),
          categoria: formData.categoria.trim(),
          compatibilidade: formData.compatibilidade.trim() || 'Universal',
          localizacaoPrateleira: formData.localizacaoPrateleira.trim(),
          quantidade: parseInt(formData.quantidade, 10) || 0,
          quantidadeMinima: parseInt(formData.quantidadeMinima, 10) || 2,
          precoCusto: parseFloat(formData.precoCusto) || 0,
          precoVenda: parseFloat(formData.precoVenda) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao cadastrar peça.');
      }

      router.push('/pecas');
      router.refresh();
    } catch (err: any) {
      setErro(err.message || 'Erro ao cadastrar peça.');
      setCarregando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Botão Voltar */}
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
        {/* Título do Formulário */}
        <div className="border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Cadastrar Nova Peça</h1>
              <p className="text-xs text-slate-500">
                Preencha os dados do componente elétrico para controle de estoque da GUCAR.
              </p>
            </div>
          </div>
        </div>

        {erro && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start space-x-2.5">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <span>{erro}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome / Descrição */}
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
              placeholder="Ex: Relé Auxiliar 12V 4 Pinos 40A DNI"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Código SKU / OEM */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Código SKU / Fabricante (Opcional)
              </label>
              <input
                type="text"
                name="codigoSku"
                value={formData.codigoSku}
                onChange={handleChange}
                placeholder="Ex: DNI-0101, H4-60W"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Categoria */}
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
            {/* Localização Física na Oficina [RF04] */}
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
                placeholder="Ex: Prateleira B, Gaveta 03"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Veículo Compatível */}
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
                placeholder="Ex: Universal, Gol G5, Fiat Fire..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* Quantidade Inicial */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Qtd. Inicial
              </label>
              <input
                type="number"
                name="quantidade"
                min="0"
                value={formData.quantidade}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-center text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Estoque Mínimo */}
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

            {/* Preço de Custo */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Custo (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="precoCusto"
                value={formData.precoCusto}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-right text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Preço de Venda */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Venda (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="precoVenda"
                value={formData.precoVenda}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-right text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <Link
              href="/pecas"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={carregando}
              className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {carregando ? 'Cadastrando...' : 'Salvar Peça'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
