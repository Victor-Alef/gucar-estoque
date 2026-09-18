import { prisma } from '@/lib/prisma';
import { ItemMovimentacaoEstoque, MotivoMovimentacao, TipoMovimentacao } from '@/types';

export interface DadosEntradaEstoque {
  pecaId: number;
  usuarioId?: number | null;
  quantidade: number;
  motivo?: MotivoMovimentacao;
  custoUnitario?: number | null;
  observacoes?: string | null;
}

export interface DadosSaidaEstoque {
  pecaId: number;
  usuarioId?: number | null;
  quantidade: number;
  motivo: MotivoMovimentacao;
  observacoes?: string | null;
}

export interface FiltrosMovimentacoes {
  tipo?: TipoMovimentacao | string;
  motivo?: MotivoMovimentacao | string;
  pecaId?: number;
  limite?: number;
}

export class MovimentacoesService {
  /**
   * Registra a entrada de peças no estoque, incrementando o saldo e opcionalmente o preço de custo.
   */
  static async registrarEntrada(dados: DadosEntradaEstoque) {
    const { pecaId, usuarioId, quantidade, custoUnitario, observacoes } = dados;
    const motivo = dados.motivo || 'COMPRA_REPOSICAO';

    if (!pecaId || isNaN(pecaId)) {
      throw new Error('A identificação da peça é obrigatória.');
    }
    if (!quantidade || quantidade <= 0) {
      throw new Error('A quantidade de entrada deve ser maior que zero.');
    }

    return await prisma.$transaction(async (tx) => {
      const peca = await tx.peca.findUnique({
        where: { id: pecaId },
      });

      if (!peca) {
        throw new Error('Peça não encontrada para dar entrada.');
      }

      const dadosAtualizacaoPeca: any = {
        quantidade: peca.quantidade + quantidade,
      };

      if (custoUnitario && custoUnitario > 0) {
        dadosAtualizacaoPeca.precoCusto = custoUnitario;
      }

      await tx.peca.update({
        where: { id: pecaId },
        data: dadosAtualizacaoPeca,
      });

      const movimentacao = await tx.movimentacaoEstoque.create({
        data: {
          pecaId,
          usuarioId: usuarioId || null,
          tipo: 'ENTRADA',
          quantidade,
          motivo,
          custoUnitario: custoUnitario || peca.precoCusto,
          observacoes: observacoes?.trim() || null,
        },
        include: {
          peca: true,
          usuario: {
            select: { id: true, nome: true, email: true },
          },
        },
      });

      return movimentacao;
    });
  }

  /**
   * Registra a saída (baixa) de peças no estoque com bloqueio estrito de saldo negativo.
   */
  static async registrarSaida(dados: DadosSaidaEstoque) {
    const { pecaId, usuarioId, quantidade, motivo, observacoes } = dados;

    if (!pecaId || isNaN(pecaId)) {
      throw new Error('A identificação da peça é obrigatória.');
    }
    if (!quantidade || quantidade <= 0) {
      throw new Error('A quantidade de saída deve ser maior que zero.');
    }
    if (!motivo) {
      throw new Error('O motivo da baixa é obrigatório (Ex: O.S., Venda, Perda).');
    }

    return await prisma.$transaction(async (tx) => {
      const peca = await tx.peca.findUnique({
        where: { id: pecaId },
      });

      if (!peca) {
        throw new Error('Peça não encontrada para dar baixa.');
      }

      // Regra de Negócio Crítica: Bloqueio estrito de saldo negativo
      if (peca.quantidade < quantidade) {
        throw new Error(
          `Estoque insuficiente! Saldo atual é de ${peca.quantidade}, você tentou baixar ${quantidade}.`
        );
      }

      await tx.peca.update({
        where: { id: pecaId },
        data: {
          quantidade: peca.quantidade - quantidade,
        },
      });

      const movimentacao = await tx.movimentacaoEstoque.create({
        data: {
          pecaId,
          usuarioId: usuarioId || null,
          tipo: 'SAIDA',
          quantidade,
          motivo,
          custoUnitario: peca.precoCusto,
          observacoes: observacoes?.trim() || null,
        },
        include: {
          peca: true,
          usuario: {
            select: { id: true, nome: true, email: true },
          },
        },
      });

      return movimentacao;
    });
  }

  /**
   * Lista o histórico de movimentações com filtros de tipo, motivo e peça.
   */
  static async listar(filtros: FiltrosMovimentacoes = {}) {
    const { tipo, motivo, pecaId, limite = 50 } = filtros;

    const where: any = {};

    if (tipo) {
      if (tipo === 'ENTRADA' || tipo === 'IN') where.tipo = 'ENTRADA';
      if (tipo === 'SAIDA' || tipo === 'OUT') where.tipo = 'SAIDA';
    }

    if (motivo) {
      where.motivo = motivo;
    }

    if (pecaId && !isNaN(pecaId)) {
      where.pecaId = Number(pecaId);
    }

    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      take: Math.min(100, Math.max(1, limite)),
      include: {
        peca: {
          select: {
            id: true,
            nome: true,
            codigoSku: true,
            localizacaoPrateleira: true,
            quantidade: true,
            quantidadeMinima: true,
            categoria: true,
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return movimentacoes as ItemMovimentacaoEstoque[];
  }
}
