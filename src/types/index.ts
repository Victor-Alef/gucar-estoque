export type TipoMovimentacao = 'ENTRADA' | 'SAIDA';

export type MotivoMovimentacao = 
  | 'SERVICO_OS' 
  | 'VENDA_BALCAO' 
  | 'PERDA_DEFEITO' 
  | 'COMPRA_REPOSICAO';

export interface SessaoUsuario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
}

export interface ItemPeca {
  id: number;
  codigoSku: string | null;
  nome: string;
  categoria: string;
  compatibilidade: string;
  localizacaoPrateleira: string;
  quantidade: number;
  quantidadeMinima: number;
  precoCusto: number;
  precoVenda: number;
  ativo: boolean;
  criadoEm: string | Date;
  atualizadoEm: string | Date;
}

export interface ItemMovimentacaoEstoque {
  id: number;
  pecaId: number;
  usuarioId: number | null;
  tipo: TipoMovimentacao;
  quantidade: number;
  motivo: MotivoMovimentacao;
  custoUnitario: number | null;
  observacoes: string | null;
  criadoEm: string | Date;
  peca?: {
    id: number;
    nome: string;
    codigoSku: string | null;
    localizacaoPrateleira: string;
    quantidade: number;
    quantidadeMinima?: number;
    categoria?: string;
  };
  usuario?: {
    id: number;
    nome: string;
    email: string;
  } | null;
}

export interface EstatisticasPainel {
  totalPecas: number;
  pecasCriticasContagem: number;
  entradasSemanaContagem: number;
  saidasSemanaContagem: number;
  pecasCriticas: ItemPeca[];
  movimentacoesRecentes: ItemMovimentacaoEstoque[];
}

// Aliases para compatibilidade e transição suave
export type MovementType = TipoMovimentacao;
export type MovementReason = MotivoMovimentacao;
export type UserSession = SessaoUsuario;
export type ProductItem = ItemPeca;
export type StockMovementItem = ItemMovimentacaoEstoque;
export type DashboardStats = EstatisticasPainel;
