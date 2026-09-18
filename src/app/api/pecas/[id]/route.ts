import { NextRequest, NextResponse } from 'next/server';
import { PecasService } from '@/services/pecas.service';

interface ContextoParametros {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: ContextoParametros) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID da peça inválido.' }, { status: 400 });
    }

    const peca = await PecasService.buscarPorId(id);
    if (!peca) {
      return NextResponse.json({ error: 'Peça não encontrada.' }, { status: 404 });
    }

    return NextResponse.json({
      peca,
      product: peca, // compatibilidade
    });
  } catch (error: any) {
    console.error('Erro ao buscar peça:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar dados da peça.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: ContextoParametros) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID da peça inválido.' }, { status: 400 });
    }

    const dados = await req.json();

    const pecaAtualizada = await PecasService.atualizar(id, {
      codigoSku: dados.codigoSku !== undefined ? dados.codigoSku : dados.skuCode,
      nome: dados.nome !== undefined ? dados.nome : dados.name,
      categoria: dados.categoria !== undefined ? dados.categoria : dados.category,
      compatibilidade: dados.compatibilidade !== undefined ? dados.compatibilidade : dados.compatibility,
      localizacaoPrateleira: dados.localizacaoPrateleira !== undefined ? dados.localizacaoPrateleira : dados.shelfLocation,
      quantidade: dados.quantidade !== undefined ? dados.quantidade : dados.quantity,
      quantidadeMinima: dados.quantidadeMinima !== undefined ? dados.quantidadeMinima : dados.minQuantity,
      precoCusto: dados.precoCusto !== undefined ? dados.precoCusto : dados.costPrice,
      precoVenda: dados.precoVenda !== undefined ? dados.precoVenda : dados.salePrice,
      ativo: dados.ativo !== undefined ? dados.ativo : dados.isActive,
    });

    return NextResponse.json(pecaAtualizada);
  } catch (error: any) {
    console.error('Erro ao atualizar peça:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao atualizar dados da peça.' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: ContextoParametros) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID da peça inválido.' }, { status: 400 });
    }

    await PecasService.inativar(id);

    return NextResponse.json({
      success: true,
      message: 'Peça inativada do catálogo com sucesso.',
    });
  } catch (error: any) {
    console.error('Erro ao inativar peça:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao inativar peça.' },
      { status: 500 }
    );
  }
}
