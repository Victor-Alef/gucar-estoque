import { NextRequest, NextResponse } from 'next/server';
import { MovimentacoesService } from '@/services/movimentacoes.service';
import { obterUsuarioSessao } from '@/lib/auth';
import { MotivoMovimentacao, TipoMovimentacao } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || searchParams.get('tipo');
    const reason = searchParams.get('reason') || searchParams.get('motivo');
    const productId = searchParams.get('productId') || searchParams.get('pecaId');
    const limit = parseInt(searchParams.get('limit') || searchParams.get('limite') || '50', 10);

    const movements = await MovimentacoesService.listar({
      tipo: type as TipoMovimentacao,
      motivo: reason as MotivoMovimentacao,
      pecaId: productId ? parseInt(productId, 10) : undefined,
      limite: limit,
    });

    return NextResponse.json({ movements, movimentacoes: movements });
  } catch (error: any) {
    console.error('Erro ao buscar movimentações (legacy):', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar histórico de movimentações.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await obterUsuarioSessao();
    const data = await req.json();

    const productId = Number(data.productId || data.pecaId);
    const type = (data.type || data.tipo)?.toUpperCase();
    const quantity = Number(data.quantity || data.quantidade);
    const reasonRaw = data.reason || data.motivo;
    const unitCost = data.unitCost !== undefined ? Number(data.unitCost) : (data.custoUnitario ? Number(data.custoUnitario) : null);
    const notes = data.notes || data.observacoes;

    let motivoNormalizado: MotivoMovimentacao = 'SERVICO_OS';
    if (reasonRaw === 'SERVICE' || reasonRaw === 'SERVICO_OS') {
      motivoNormalizado = 'SERVICO_OS';
    } else if (reasonRaw === 'SALE' || reasonRaw === 'VENDA_BALCAO') {
      motivoNormalizado = 'VENDA_BALCAO';
    } else if (reasonRaw === 'LOSS' || reasonRaw === 'PERDA_DEFEITO') {
      motivoNormalizado = 'PERDA_DEFEITO';
    } else if (reasonRaw === 'PURCHASE' || reasonRaw === 'COMPRA_REPOSICAO') {
      motivoNormalizado = 'COMPRA_REPOSICAO';
    }

    if (type === 'IN' || type === 'ENTRADA') {
      const movement = await MovimentacoesService.registrarEntrada({
        pecaId: productId,
        usuarioId: user?.id || null,
        quantidade: quantity,
        motivo: motivoNormalizado,
        custoUnitario: unitCost,
        observacoes: notes,
      });

      return NextResponse.json(movement, { status: 201 });
    }

    if (type === 'OUT' || type === 'SAIDA') {
      const movement = await MovimentacoesService.registrarSaida({
        pecaId: productId,
        usuarioId: user?.id || null,
        quantidade: quantity,
        motivo: motivoNormalizado,
        observacoes: notes,
      });

      return NextResponse.json(movement, { status: 201 });
    }

    return NextResponse.json({ error: 'Tipo de movimentação inválido.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro ao registrar movimentação (legacy):', error);
    const status = error.message?.includes('insuficiente') ? 422 : 400;
    return NextResponse.json(
      { error: error.message || 'Falha ao registrar movimentação.' },
      { status }
    );
  }
}
