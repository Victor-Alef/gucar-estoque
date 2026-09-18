import { prisma } from '@/lib/prisma';
import { EstatisticasPainel, ItemMovimentacaoEstoque, ItemPeca } from '@/types';

export class PainelService {
  /**
   * Consolida métricas, KPIs e dados operacionais para o dashboard principal da oficina.
   */
  static async obterEstatisticas(): Promise<EstatisticasPainel> {
    const seteDiasAtras = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalPecas,
      todasPecasAtivas,
      entradasSemana,
      saidasSemana,
      movimentacoesRecentes,
    ] = await Promise.all([
      // Total de peças ativas cadastradas
      prisma.peca.count({
        where: { ativo: true },
      }),

      // Consulta de peças para cálculo em memória de itens críticos
      prisma.peca.findMany({
        where: { ativo: true },
        orderBy: [{ quantidade: 'asc' }, { nome: 'asc' }],
      }),

      // Total de entradas nos últimos 7 dias
      prisma.movimentacaoEstoque.count({
        where: {
          tipo: 'ENTRADA',
          criadoEm: { gte: seteDiasAtras },
        },
      }),

      // Total de saídas nos últimos 7 dias
      prisma.movimentacaoEstoque.count({
        where: {
          tipo: 'SAIDA',
          criadoEm: { gte: seteDiasAtras },
        },
      }),

      // Movimentações mais recentes com relações
      prisma.movimentacaoEstoque.findMany({
        orderBy: { criadoEm: 'desc' },
        take: 8,
        include: {
          peca: {
            select: {
              id: true,
              nome: true,
              codigoSku: true,
              localizacaoPrateleira: true,
              quantidade: true,
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
      }),
    ]);

    // Filtragem de peças críticas (saldo menor ou igual ao mínimo de segurança)
    const pecasCriticas = todasPecasAtivas.filter(
      (peca) => peca.quantidade <= peca.quantidadeMinima
    );

    return {
      totalPecas,
      pecasCriticasContagem: pecasCriticas.length,
      entradasSemanaContagem: entradasSemana,
      saidasSemanaContagem: saidasSemana,
      pecasCriticas: pecasCriticas as ItemPeca[],
      movimentacoesRecentes: movimentacoesRecentes as ItemMovimentacaoEstoque[],
    };
  }
}
