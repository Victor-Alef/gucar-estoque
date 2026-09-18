import React, { ReactNode } from 'react';

interface CardKpiProps {
  titulo: string;
  valor: number | string;
  icone: ReactNode;
  corIcone?: string;
  subtitulo?: string;
  destaque?: boolean;
  alerta?: boolean;
}

export const CardKpi: React.FC<CardKpiProps> = ({
  titulo,
  valor,
  icone,
  corIcone = 'text-blue-500 bg-blue-500/10',
  subtitulo,
  destaque = false,
  alerta = false,
}) => {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 ${
        alerta
          ? 'bg-red-950/20 border-red-500/40 shadow-lg shadow-red-950/20'
          : destaque
          ? 'bg-slate-900 border-slate-700 shadow-lg shadow-slate-950/40'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {titulo}
        </span>
        <div className={`p-2.5 rounded-xl ${corIcone}`}>{icone}</div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span
          className={`text-3xl font-extrabold tracking-tight ${
            alerta ? 'text-red-400' : 'text-white'
          }`}
        >
          {valor}
        </span>
        {alerta && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">
            Atenção
          </span>
        )}
      </div>

      {subtitulo && (
        <p className="mt-1 text-xs text-slate-400 font-medium">{subtitulo}</p>
      )}
    </div>
  );
};
