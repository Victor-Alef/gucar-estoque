import { NextRequest, NextResponse } from 'next/server';
import { PecasService } from '@/services/pecas.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const busca = searchParams.get('busca') || searchParams.get('q') || '';
    const categoria = searchParams.get('categoria') || searchParams.get('category') || '';
    const apenasCriticos = 
      searchParams.get('apenasCriticos') === 'true' || 
      searchParams.get('alertOnly') === 'true';

    const pecas = await PecasService.listar({
      busca,
      categoria,
      apenasCriticos,
    });

    const categorias = await PecasService.listarCategoriasDistintas();

    return NextResponse.json({
      pecas,
      products: pecas, // compatibilidade
      categorias,
      categories: categorias, // compatibilidade
      total: pecas.length,
    });
  } catch (error: any) {
    console.error('Erro ao listar peças:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao buscar catálogo de peças.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const dados = await req.json();

    const novaPeca = await PecasService.criar({
      codigoSku: dados.codigoSku || dados.skuCode,
      nome: dados.nome || dados.name,
      categoria: dados.categoria || dados.category,
      compatibilidade: dados.compatibilidade || dados.compatibility,
      localizacaoPrateleira: dados.localizacaoPrateleira || dados.shelfLocation,
      quantidade: dados.quantidade !== undefined ? dados.quantidade : dados.quantity,
      quantidadeMinima: dados.quantidadeMinima !== undefined ? dados.quantidadeMinima : dados.minQuantity,
      precoCusto: dados.precoCusto !== undefined ? dados.precoCusto : dados.costPrice,
      precoVenda: dados.precoVenda !== undefined ? dados.precoVenda : dados.salePrice,
    });

    return NextResponse.json(novaPeca, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao cadastrar peça:', error);
    return NextResponse.json(
      { error: error.message || 'Falha ao criar cadastro da peça.' },
      { status: 400 }
    );
  }
}
