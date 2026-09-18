import { NextResponse } from 'next/server';
import { PainelService } from '@/services/painel.service';

export async function GET() {
  try {
    const dados = await PainelService.obterEstatisticas();

    return NextResponse.json({
      ...dados,
      // Retrocompatibilidade temporária com chaves antigas
      totalProducts: dados.totalPecas,
      criticalStockCount: dados.pecasCriticasContagem,
      weeklyEntriesCount: dados.entradasSemanaContagem,
      weeklyExitsCount: dados.saidasSemanaContagem,
      criticalProducts: dados.pecasCriticas,
      recentMovements: dados.movimentacoesRecentes,
    });
  } catch (error: any) {
    console.error('Erro ao carregar dados do painel:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar indicadores do painel operacional.' },
      { status: 500 }
    );
  }
}
