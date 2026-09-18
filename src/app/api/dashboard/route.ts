import { NextResponse } from 'next/server';
import { PainelService } from '@/services/painel.service';

export async function GET() {
  try {
    const dados = await PainelService.obterEstatisticas();

    return NextResponse.json({
      totalProducts: dados.totalPecas,
      criticalStockCount: dados.pecasCriticasContagem,
      weeklyEntriesCount: dados.entradasSemanaContagem,
      weeklyExitsCount: dados.saidasSemanaContagem,
      criticalProducts: dados.pecasCriticas,
      recentMovements: dados.movimentacoesRecentes,
      // Suporte PT-BR
      ...dados,
    });
  } catch (error: any) {
    console.error('Erro no painel (legacy):', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar indicadores do painel.' },
      { status: 500 }
    );
  }
}
