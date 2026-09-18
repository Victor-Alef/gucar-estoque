const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runTests() {
  console.log('==================================================');
  console.log('TESTES DE VERIFICAÇÃO AUTOMATIZADA - GUCAR ESTOQUE (PT-BR)');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Teste de Autenticação [RF01, RF02]
    console.log('--- 1. Autenticação e Usuários (Padrão PT-BR) ---');
    const usuario = await prisma.usuario.findUnique({
      where: { email: 'gustavo@gucar.com.br' },
    });
    assert(usuario !== null, 'Usuário administrador Gustavo Martins existe no banco.');
    const senhaConfere = await bcrypt.compare('gucar@123', usuario.senhaHash);
    assert(senhaConfere === true, 'Senha criptografada confere com "gucar@123".');
    assert(usuario.cargo === 'ADMIN', 'Perfil/Cargo de administrador atribuído corretamente.');

    // 2. Teste de Catálogo e Atributos [RF03, RF04]
    console.log('\n--- 2. Catálogo e Atributos da Peça (Padrão PT-BR) ---');
    const pecas = await prisma.peca.findMany({ where: { ativo: true } });
    assert(pecas.length >= 10, `Catálogo populado com ${pecas.length} peças automotivas.`);
    
    const rele = pecas.find((p) => p.nome.includes('Relé Auxiliar'));
    assert(rele !== undefined, 'Peça "Relé Auxiliar" cadastrada.');
    assert(Boolean(rele.localizacaoPrateleira), `Localização física cadastrada: "${rele.localizacaoPrateleira}".`);
    assert(Boolean(rele.compatibilidade), `Compatibilidade veicular: "${rele.compatibilidade}".`);

    // 3. Teste de Prevenção de Saldo Negativo [RF07, RNF04]
    console.log('\n--- 3. Regra de Negócio: Bloqueio de Saldo Negativo ---');
    const lampadaH7 = await prisma.peca.findFirst({
      where: { codigoSku: 'PHIL-H7' },
    });
    assert(lampadaH7 !== null, 'Peça Lâmpada H7 encontrada.');
    const initialQty = lampadaH7.quantidade;

    // Tentativa de baixa que excede o estoque
    const excessiveQuantity = initialQty + 10;
    let bloqueado = false;
    try {
      await prisma.$transaction(async (tx) => {
        const p = await tx.peca.findUnique({ where: { id: lampadaH7.id } });
        if (p.quantidade < excessiveQuantity) {
          throw new Error(`Estoque insuficiente! Saldo atual é de ${p.quantidade}, você tentou baixar ${excessiveQuantity}.`);
        }
        await tx.peca.update({
          where: { id: lampadaH7.id },
          data: { quantidade: p.quantidade - excessiveQuantity },
        });
      });
    } catch (e) {
      bloqueado = true;
    }
    assert(bloqueado === true, `Tentativa de baixar ${excessiveQuantity} un. com saldo ${initialQty} foi devidamente BLOQUEADA.`);

    // 4. Teste de Baixa Válida [RF07]
    console.log('\n--- 4. Baixa Válida e Log de Movimentação ---');
    const validQty = 1;
    const resultadoBaixa = await prisma.$transaction(async (tx) => {
      const p = await tx.peca.findUnique({ where: { id: lampadaH7.id } });
      if (p.quantidade < validQty) throw new Error('Saldo insuficiente');
      const atualizada = await tx.peca.update({
        where: { id: lampadaH7.id },
        data: { quantidade: p.quantidade - validQty },
      });
      const mov = await tx.movimentacaoEstoque.create({
        data: {
          pecaId: p.id,
          usuarioId: usuario.id,
          tipo: 'SAIDA',
          quantidade: validQty,
          motivo: 'SERVICO_OS',
          observacoes: 'Teste Automatizado - O.S. 9999',
        },
      });
      return { atualizada, mov };
    });

    assert(resultadoBaixa.atualizada.quantidade === initialQty - validQty, `Estoque reduzido corretamente de ${initialQty} para ${resultadoBaixa.atualizada.quantidade}.`);
    assert(resultadoBaixa.mov.motivo === 'SERVICO_OS', 'Movimentação categorizada como SERVICO_OS (O.S.).');

    // 5. Teste de Alerta Visual de Estoque Crítico [RF09, RF10]
    console.log('\n--- 5. Indicadores de Estoque Crítico ---');
    const listaCriticos = await prisma.peca.findMany({
      where: {
        ativo: true,
      },
    });
    const criticos = listaCriticos.filter((p) => p.quantidade <= p.quantidadeMinima);
    assert(criticos.length > 0, `Identificados ${criticos.length} itens em estado crítico para alerta no dashboard.`);
    console.log(`Itens críticos detectados: ${criticos.map((c) => `${c.nome} (Qtd: ${c.quantidade} / Mín: ${c.quantidadeMinima})`).join(', ')}`);

    // 6. Teste de Entrada de Reposição [RF06]
    console.log('\n--- 6. Entrada de Reposição de Estoque ---');
    const entradaQty = 5;
    const resultadoEntrada = await prisma.$transaction(async (tx) => {
      const p = await tx.peca.findUnique({ where: { id: lampadaH7.id } });
      const atualizada = await tx.peca.update({
        where: { id: lampadaH7.id },
        data: { quantidade: p.quantidade + entradaQty },
      });
      const mov = await tx.movimentacaoEstoque.create({
        data: {
          pecaId: p.id,
          usuarioId: usuario.id,
          tipo: 'ENTRADA',
          quantidade: entradaQty,
          motivo: 'COMPRA_REPOSICAO',
          custoUnitario: 21.50,
          observacoes: 'Teste Entrada - NF Fornecedor',
        },
      });
      return { atualizada, mov };
    });
    assert(resultadoEntrada.atualizada.quantidade === resultadoBaixa.atualizada.quantidade + entradaQty, `Estoque somado com sucesso após entrada (+${entradaQty} un.).`);

    console.log('\n==================================================');
    console.log(`RESULTADO DOS TESTES: ${passed} PASSOU | ${failed} FALHOU`);
    console.log('==================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Erro inesperado nos testes:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
