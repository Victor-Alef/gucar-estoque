import { NextRequest, NextResponse } from 'next/server';
import { PecasService } from '@/services/pecas.service';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const peca = await PecasService.buscarPorId(id);
    if (!peca) {
      return NextResponse.json({ error: 'Peça não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ product: peca, peca });
  } catch (error: any) {
    console.error('Erro ao buscar peça (legacy):', error);
    return NextResponse.json({ error: error.message || 'Erro ao buscar detalhes da peça.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    const data = await req.json();

    const pecaAtualizada = await PecasService.atualizar(id, {
      codigoSku: data.skuCode !== undefined ? data.skuCode : data.codigoSku,
      nome: data.name !== undefined ? data.name : data.nome,
      categoria: data.category !== undefined ? data.category : data.categoria,
      compatibilidade: data.compatibility !== undefined ? data.compatibility : data.compatibilidade,
      localizacaoPrateleira: data.shelfLocation !== undefined ? data.shelfLocation : data.localizacaoPrateleira,
      quantidade: data.quantity !== undefined ? Number(data.quantity) : (data.quantidade !== undefined ? Number(data.quantidade) : undefined),
      quantidadeMinima: data.minQuantity !== undefined ? Number(data.minQuantity) : (data.quantidadeMinima !== undefined ? Number(data.quantidadeMinima) : undefined),
      precoCusto: data.costPrice !== undefined ? Number(data.costPrice) : (data.precoCusto !== undefined ? Number(data.precoCusto) : undefined),
      precoVenda: data.salePrice !== undefined ? Number(data.salePrice) : (data.precoVenda !== undefined ? Number(data.precoVenda) : undefined),
      ativo: data.isActive !== undefined ? Boolean(data.isActive) : (data.ativo !== undefined ? Boolean(data.ativo) : undefined),
    });

    return NextResponse.json({ success: true, product: pecaAtualizada, peca: pecaAtualizada });
  } catch (error: any) {
    console.error('Erro ao atualizar peça (legacy):', error);
    return NextResponse.json({ error: error.message || 'Erro ao atualizar dados da peça.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
    }

    await PecasService.inativar(id);

    return NextResponse.json({ success: true, message: 'Peça inativada com sucesso.' });
  } catch (error: any) {
    console.error('Erro ao inativar peça (legacy):', error);
    return NextResponse.json({ error: error.message || 'Erro ao inativar peça.' }, { status: 500 });
  }
}
