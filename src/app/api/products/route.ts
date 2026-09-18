import { NextRequest, NextResponse } from 'next/server';
import { PecasService } from '@/services/pecas.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const alertOnly = searchParams.get('alertOnly') === 'true';

    const pecas = await PecasService.listar({
      busca: q,
      categoria: category,
      apenasCriticos: alertOnly,
    });

    const categories = await PecasService.listarCategoriasDistintas();

    return NextResponse.json({
      products: pecas,
      pecas,
      categories,
      total: pecas.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar peças (legacy):', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar catálogo de peças.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const peca = await PecasService.criar({
      codigoSku: data.skuCode || data.codigoSku,
      nome: data.name || data.nome,
      categoria: data.category || data.categoria,
      compatibilidade: data.compatibility || data.compatibilidade,
      localizacaoPrateleira: data.shelfLocation || data.localizacaoPrateleira,
      quantidade: data.quantity !== undefined ? Number(data.quantity) : Number(data.quantidade),
      quantidadeMinima: data.minQuantity !== undefined ? Number(data.minQuantity) : Number(data.quantidadeMinima),
      precoCusto: data.costPrice !== undefined ? Number(data.costPrice) : Number(data.precoCusto),
      precoVenda: data.salePrice !== undefined ? Number(data.salePrice) : Number(data.precoVenda),
    });

    return NextResponse.json(peca, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar peça (legacy):', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao criar cadastro da peça.' },
      { status: 400 }
    );
  }
}
