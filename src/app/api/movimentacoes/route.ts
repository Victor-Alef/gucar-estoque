import { NextRequest, NextResponse } from 'next/server';
import { MovimentacoesService } from '@/services/movimentacoes.service';
import { obterUsuarioSessao } from '@/lib/auth';
import { MotivoMovimentacao, TipoMovimentacao } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo') || searchParams.get('type') || undefined;
    const motivo = searchParams.get('motivo') || searchParams.get('reason') || undefined;
    const pecaIdParam = searchParams.get('pecaId') || searchParams.get('productId');
    const limiteParam = searchParams.get('limite') || searchParams.get('limit');

    const pecaId = pecaIdParam ? parseInt(pecaIdParam, 10) : undefined;
    const limite = limiteParam ? parseInt(limiteParam, 10) : 50;

    const movimentacoes = await MovimentacoesService.listar({
      tipo: tipo as TipoMovimentacao,
      motivo: motivo as MotivoMovimentacao,
      pecaId,
      limite,
    });

    return NextResponse.json({
      movimentacoes,
      movements: movimentacoes, // compatibilidade
      total: movimentacoes.length,
    });
  } catch (error: any) {
    console.error('Erro ao buscar movimentações:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar histórico de movimentações.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await obterUsuarioSessao();
    const dados = await req.json();

    const pecaId = Number(dados.pecaId || dados.productId);
    const tipo = (dados.tipo || dados.type)?.toUpperCase();
    const quantidade = Number(dados.quantidade || dados.quantity);
    const motivoRaw = dados.motivo || dados.reason;
    const observacoes = dados.observacoes || dados.notes;
    const custoUnitario = dados.custoUnitario !== undefined ? Number(dados.custoUnitario) : (dados.unitCost ? Number(dados.unitCost) : null);

    // Mapeamento de motivos legados ou em inglês se fornecidos
    let motivoNormalizado: MotivoMovimentacao = 'SERVICO_OS';
    if (motivoRaw === 'SERVICO_OS' || motivoRaw === 'SERVICE') {
      motivoNormalizado = 'SERVICO_OS';
    } else if (motivoRaw === 'VENDA_BALCAO' || motivoRaw === 'SALE') {
      motivoNormalizado = 'VENDA_BALCAO';
    } else if (motivoRaw === 'PERDA_DEFEITO' || motivoRaw === 'LOSS') {
      motivoNormalizado = 'PERDA_DEFEITO';
    } else if (motivoRaw === 'COMPRA_REPOSICAO' || motivoRaw === 'PURCHASE') {
      motivoNormalizado = 'COMPRA_REPOSICAO';
    }

    if (tipo === 'ENTRADA' || tipo === 'IN') {
      const movimentacao = await MovimentacoesService.registrarEntrada({
        pecaId,
        usuarioId: usuario?.id || null,
        quantidade,
        motivo: motivoNormalizado,
        custoUnitario,
        observacoes,
      });

      return NextResponse.json(movimentacao, { status: 201 });
    }

    if (tipo === 'SAIDA' || tipo === 'OUT') {
      const movimentacao = await MovimentacoesService.registrarSaida({
        pecaId,
        usuarioId: usuario?.id || null,
        quantidade,
        motivo: motivoNormalizado,
        observacoes,
      });

      return NextResponse.json(movimentacao, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Tipo de movimentação inválido. Deve ser "ENTRADA" ou "SAIDA".' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erro ao registrar movimentação:', error);
    const status = error.message?.includes('insuficiente') ? 422 : 400;
    return NextResponse.json(
      { error: error.message || 'Falha ao registrar movimentação no estoque.' },
      { status }
    );
  }
}
