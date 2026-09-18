import { MotivoMovimentacao, TipoMovimentacao } from '@/types';

/**
 * Formata um valor numérico para o padrão de moeda brasileiro (R$).
 */
export function formatarMoeda(valor: number | null | undefined): string {
  const numero = typeof valor === 'number' ? valor : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numero);
}

/**
 * Formata uma data no padrão PT-BR (dd/mm/aaaa).
 */
export function formatarData(data: string | Date | null | undefined): string {
  if (!data) return '-';
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dataObj);
}

/**
 * Formata data e hora no padrão PT-BR (dd/mm/aaaa às HH:mm).
 */
export function formatarDataHora(data: string | Date | null | undefined): string {
  if (!data) return '-';
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dataObj);
}

/**
 * Retorna o rótulo amigável em português para o motivo da movimentação.
 */
export function obterRotuloMotivo(motivo: MotivoMovimentacao | string): string {
  switch (motivo) {
    case 'SERVICO_OS':
      return 'Ordem de Serviço (O.S.)';
    case 'VENDA_BALCAO':
      return 'Venda Balcão';
    case 'PERDA_DEFEITO':
      return 'Perda / Defeito';
    case 'COMPRA_REPOSICAO':
      return 'Compra / Reposição';
    // Suporte a possíveis termos legados
    case 'SERVICE':
      return 'Ordem de Serviço (O.S.)';
    case 'SALE':
      return 'Venda Balcão';
    case 'LOSS':
      return 'Perda / Defeito';
    case 'PURCHASE':
      return 'Compra / Reposição';
    default:
      return motivo || 'Não especificado';
  }
}

/**
 * Retorna o rótulo legível para o tipo de movimentação.
 */
export function obterRotuloTipo(tipo: TipoMovimentacao | string): string {
  if (tipo === 'ENTRADA' || tipo === 'IN') {
    return 'Entrada';
  }
  if (tipo === 'SAIDA' || tipo === 'OUT') {
    return 'Saída';
  }
  return tipo;
}
