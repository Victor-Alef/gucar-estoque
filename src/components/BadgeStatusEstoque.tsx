import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BadgeStatusEstoqueProps {
  quantidade: number;
  quantidadeMinima: number;
  exibirDetalhes?: boolean;
}

export const BadgeStatusEstoque: React.FC<BadgeStatusEstoqueProps> = ({
  quantidade,
  quantidadeMinima,
  exibirDetalhes = true,
}) => {
  const isCritico = quantidade <= quantidadeMinima;

  if (isCritico) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Estoque Crítico</span>
        {exibirDetalhes && (
          <span className="text-amber-400/80 font-normal">
            ({quantidade}/{quantidadeMinima} un.)
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span>Estoque Normal</span>
      {exibirDetalhes && (
        <span className="text-emerald-400/80 font-normal">
          ({quantidade} un.)
        </span>
      )}
    </span>
  );
};
