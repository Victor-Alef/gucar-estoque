import { prisma } from '@/lib/prisma';
import { ItemPeca } from '@/types';

export interface FiltrosListagemPecas {
  busca?: string;
  categoria?: string;
  apenasCriticos?: boolean;
}

export interface DadosCriacaoPeca {
  codigoSku?: string | null;
  nome: string;
  categoria: string;
  compatibilidade: string;
  localizacaoPrateleira: string;
  quantidade?: number;
  quantidadeMinima?: number;
  precoCusto?: number;
  precoVenda?: number;
}

export interface DadosAtualizacaoPeca {
  codigoSku?: string | null;
  nome?: string;
  categoria?: string;
  compatibilidade?: string;
  localizacaoPrateleira?: string;
  quantidade?: number;
  quantidadeMinima?: number;
  precoCusto?: number;
  precoVenda?: number;
  ativo?: boolean;
}

export class PecasService {
  /**
   * Lista peças ativas aplicando filtros opcionais de busca textual, categoria e alerta de estoque crítico.
   */
  static async listar(filtros: FiltrosListagemPecas = {}) {
    const { busca, categoria, apenasCriticos } = filtros;

    const where: any = {
      ativo: true,
    };

    if (categoria && categoria !== 'ALL' && categoria !== 'TODAS') {
      where.categoria = categoria;
    }

    if (busca && busca.trim()) {
      const termo = busca.trim();
      where.OR = [
        { nome: { contains: termo } },
        { codigoSku: { contains: termo } },
        { compatibilidade: { contains: termo } },
        { localizacaoPrateleira: { contains: termo } },
      ];
    }

    let pecas = await prisma.peca.findMany({
      where,
      orderBy: [{ quantidade: 'asc' }, { nome: 'asc' }],
    });

    if (apenasCriticos) {
      pecas = pecas.filter((p) => p.quantidade <= p.quantidadeMinima);
    }

    return pecas as ItemPeca[];
  }

  /**
   * Busca uma peça específica pelo seu ID.
   */
  static async buscarPorId(id: number): Promise<ItemPeca | null> {
    const peca = await prisma.peca.findUnique({
      where: { id },
      include: {
        movimentacoes: {
          orderBy: { criadoEm: 'desc' },
          take: 10,
          include: {
            usuario: {
              select: { id: true, nome: true, email: true },
            },
          },
        },
      },
    });

    return peca as ItemPeca | null;
  }

  /**
   * Cadastra uma nova peça no catálogo da oficina.
   */
  static async criar(dados: DadosCriacaoPeca): Promise<ItemPeca> {
    if (!dados.nome || !dados.nome.trim()) {
      throw new Error('O nome da peça é obrigatório.');
    }
    if (!dados.categoria || !dados.categoria.trim()) {
      throw new Error('A categoria da peça é obrigatória.');
    }
    if (!dados.localizacaoPrateleira || !dados.localizacaoPrateleira.trim()) {
      throw new Error('A localização física (prateleira/gaveta) é obrigatória.');
    }

    const novaPeca = await prisma.peca.create({
      data: {
        codigoSku: dados.codigoSku?.trim() || null,
        nome: dados.nome.trim(),
        categoria: dados.categoria.trim(),
        compatibilidade: dados.compatibilidade?.trim() || 'Universal',
        localizacaoPrateleira: dados.localizacaoPrateleira.trim(),
        quantidade: Math.max(0, Number(dados.quantidade) || 0),
        quantidadeMinima: Math.max(0, Number(dados.quantidadeMinima) || 2),
        precoCusto: Math.max(0, Number(dados.precoCusto) || 0),
        precoVenda: Math.max(0, Number(dados.precoVenda) || 0),
        ativo: true,
      },
    });

    return novaPeca as ItemPeca;
  }

  /**
   * Atualiza os dados de uma peça existente.
   */
  static async atualizar(id: number, dados: DadosAtualizacaoPeca): Promise<ItemPeca> {
    const pecaExistente = await prisma.peca.findUnique({ where: { id } });
    if (!pecaExistente) {
      throw new Error(`Peça com ID ${id} não encontrada.`);
    }

    const pecaAtualizada = await prisma.peca.update({
      where: { id },
      data: {
        ...(dados.codigoSku !== undefined && { codigoSku: dados.codigoSku?.trim() || null }),
        ...(dados.nome !== undefined && { nome: dados.nome.trim() }),
        ...(dados.categoria !== undefined && { categoria: dados.categoria.trim() }),
        ...(dados.compatibilidade !== undefined && { compatibilidade: dados.compatibilidade.trim() }),
        ...(dados.localizacaoPrateleira !== undefined && { localizacaoPrateleira: dados.localizacaoPrateleira.trim() }),
        ...(dados.quantidade !== undefined && { quantidade: Math.max(0, Number(dados.quantidade)) }),
        ...(dados.quantidadeMinima !== undefined && { quantidadeMinima: Math.max(0, Number(dados.quantidadeMinima)) }),
        ...(dados.precoCusto !== undefined && { precoCusto: Math.max(0, Number(dados.precoCusto)) }),
        ...(dados.precoVenda !== undefined && { precoVenda: Math.max(0, Number(dados.precoVenda)) }),
        ...(dados.ativo !== undefined && { ativo: Boolean(dados.ativo) }),
      },
    });

    return pecaAtualizada as ItemPeca;
  }

  /**
   * Inativa uma peça logicamente do catálogo (soft delete).
   */
  static async inativar(id: number): Promise<void> {
    await prisma.peca.update({
      where: { id },
      data: { ativo: false },
    });
  }

  /**
   * Obtém a lista com todas as categorias distintas cadastradas.
   */
  static async listarCategoriasDistintas(): Promise<string[]> {
    const categorias = await prisma.peca.findMany({
      where: { ativo: true },
      select: { categoria: true },
      distinct: ['categoria'],
      orderBy: { categoria: 'asc' },
    });

    return categorias.map((c) => c.categoria).filter(Boolean);
  }
}
