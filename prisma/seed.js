const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados da Autoelétrica GUCAR...');

  // Limpar tabelas existentes
  await prisma.movimentacaoEstoque.deleteMany();
  await prisma.peca.deleteMany();
  await prisma.usuario.deleteMany();

  // 1. Criar Usuário Proprietário / Administrador
  const senhaHash = await bcrypt.hash('gucar@123', 10);
  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Gustavo Martins',
      email: 'gustavo@gucar.com.br',
      senhaHash,
      cargo: 'ADMIN',
    },
  });
  console.log(`Usuário criado: ${usuario.nome} (${usuario.email}) com senha 'gucar@123'`);//Precisa ser alterado posteriormente, essa seed é apenas de teste/validação

  // 2. Criar Peças Automotivas Reais
  const pecasData = [
    {
      codigoSku: 'DNI-0101',
      nome: 'Relé Auxiliar 12V 4 Pinos 40A',
      categoria: 'Iluminação',
      compatibilidade: 'Universal',
      localizacaoPrateleira: 'Prateleira A, Gaveta 01',
      quantidade: 14,
      quantidadeMinima: 5,
      precoCusto: 14.50,
      precoVenda: 32.00,
    },
    {
      codigoSku: 'DNI-1104',
      nome: 'Relé de Pisca 12V 3 Pinos Eletrônico',
      categoria: 'Iluminação',
      compatibilidade: 'Universal / Linha Leve',
      localizacaoPrateleira: 'Prateleira A, Gaveta 02',
      quantidade: 6,
      quantidadeMinima: 3,
      precoCusto: 18.00,
      precoVenda: 38.00,
    },
    {
      codigoSku: 'OSRAM-H4',
      nome: 'Lâmpada Halógena H4 12V 60/55W Standard',
      categoria: 'Iluminação',
      compatibilidade: 'Universal (Farol Principal)',
      localizacaoPrateleira: 'Prateleira B, Caixa 01',
      quantidade: 8,
      quantidadeMinima: 4,
      precoCusto: 16.00,
      precoVenda: 35.00,
    },
    {
      codigoSku: 'PHIL-H7',
      nome: 'Lâmpada Halógena H7 12V 55W',
      categoria: 'Iluminação',
      compatibilidade: 'Linha Gol G5 / Astra / Civic / Fox',
      localizacaoPrateleira: 'Prateleira B, Caixa 02',
      quantidade: 2, // Crítico! (Abaixo do mínimo de 4)
      quantidadeMinima: 4,
      precoCusto: 22.00,
      precoVenda: 48.00,
    },
    {
      codigoSku: 'FUS-LAM',
      nome: 'Fusível Lâmina 15A Azul (Kit c/ 10)',
      categoria: 'Fusíveis',
      compatibilidade: 'Universal',
      localizacaoPrateleira: 'Gaveteiro Balcão 1',
      quantidade: 35,
      quantidadeMinima: 15,
      precoCusto: 5.00,
      precoVenda: 15.00,
    },
    {
      codigoSku: 'FUS-MAXI-30',
      nome: 'Fusível Maxi Lâmina 30A Verde',
      categoria: 'Fusíveis',
      compatibilidade: 'Universal (Circuito Ventoinha / Módulo)',
      localizacaoPrateleira: 'Gaveteiro Balcão 2',
      quantidade: 1, // Crítico! (Abaixo do mínimo de 3)
      quantidadeMinima: 3,
      precoCusto: 4.50,
      precoVenda: 12.00,
    },
    {
      codigoSku: 'BOSCH-0124',
      nome: 'Alternador 12V 90A Bosch Recondicionado c/ Garantia',
      categoria: 'Alternadores',
      compatibilidade: 'Linha VW EA111 (Gol G5 / Fox / Voyage 1.0 e 1.6)',
      localizacaoPrateleira: 'Prateleira D, Vão 04',
      quantidade: 1, // Crítico! (Abaixo do mínimo de 2)
      quantidadeMinima: 2,
      precoCusto: 520.00,
      precoVenda: 890.00,
    },
    {
      codigoSku: 'IKRO-505',
      nome: 'Regulador de Voltagem 14V Sistema Bosch',
      categoria: 'Alternadores',
      compatibilidade: 'Universal Linha Bosch',
      localizacaoPrateleira: 'Prateleira D, Gaveta 02',
      quantidade: 4,
      quantidadeMinima: 2,
      precoCusto: 65.00,
      precoVenda: 135.00,
    },
    {
      codigoSku: 'TC-1044',
      nome: 'Chicote Conector Bobina de Ignição 4 Vias',
      categoria: 'Chicotes',
      compatibilidade: 'Linha Fiat Fire (Palio, Uno, Siena, Strada)',
      localizacaoPrateleira: 'Prateleira C, Gaveta 05',
      quantidade: 5,
      quantidadeMinima: 3,
      precoCusto: 18.50,
      precoVenda: 45.00,
    },
    {
      codigoSku: 'TC-1012',
      nome: 'Chicote Conector Farol H4 com Fio Cerâmico',
      categoria: 'Chicotes',
      compatibilidade: 'Universal',
      localizacaoPrateleira: 'Prateleira C, Gaveta 08',
      quantidade: 1, // Crítico! (Abaixo do mínimo de 4)
      quantidadeMinima: 4,
      precoCusto: 12.00,
      precoVenda: 28.00,
    },
    {
      codigoSku: 'MTE-3025',
      nome: 'Sensor de Temperatura da Água MTE-Thomson',
      categoria: 'Sensores',
      compatibilidade: 'Linha Chevrolet Corsa / Celta / Prisma 1.0 e 1.4',
      localizacaoPrateleira: 'Prateleira B, Gaveta 04',
      quantidade: 3,
      quantidadeMinima: 2,
      precoCusto: 34.00,
      precoVenda: 72.00,
    },
    {
      codigoSku: 'MOURA-60',
      nome: 'Bateria Moura 60Ah M60GD Livre de Manutenção',
      categoria: 'Baterias',
      compatibilidade: 'Universal Linha Leve',
      localizacaoPrateleira: 'Palete Principal Oficina',
      quantidade: 5,
      quantidadeMinima: 3,
      precoCusto: 380.00,
      precoVenda: 530.00,
    }
  ];

  const pecasCriadas = [];
  for (const item of pecasData) {
    const peca = await prisma.peca.create({ data: item });
    pecasCriadas.push(peca);
  }
  console.log(`${pecasCriadas.length} peças cadastradas com sucesso.`);

  // 3. Registrar Histórico de Movimentações Recentes
  const movimentacoesData = [
    {
      pecaId: pecasCriadas[0].id, // Relé 12V
      usuarioId: usuario.id,
      tipo: 'ENTRADA',
      quantidade: 10,
      motivo: 'COMPRA_REPOSICAO',
      custoUnitario: 14.50,
      observacoes: 'Nota Fiscal NF-4521 Fornecedor Distribuidora Elétrica SP',
      criadoEm: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      pecaId: pecasCriadas[0].id, // Relé 12V
      usuarioId: usuario.id,
      tipo: 'SAIDA',
      quantidade: 2,
      motivo: 'SERVICO_OS',
      observacoes: 'O.S. #1024 - Reparo instalação elétrica farol de milha Gol G4',
      criadoEm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      pecaId: pecasCriadas[3].id, // Lâmpada H7
      usuarioId: usuario.id,
      tipo: 'SAIDA',
      quantidade: 2,
      motivo: 'SERVICO_OS',
      observacoes: 'O.S. #1028 - Troca de par de lâmpadas farol baixo Fox 2012',
      criadoEm: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      pecaId: pecasCriadas[6].id, // Alternador
      usuarioId: usuario.id,
      tipo: 'SAIDA',
      quantidade: 1,
      motivo: 'SERVICO_OS',
      observacoes: 'O.S. #1031 - Substituição de alternador que não carregava bateria - Voyage 1.6',
      criadoEm: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      pecaId: pecasCriadas[4].id, // Fusíveis
      usuarioId: usuario.id,
      tipo: 'SAIDA',
      quantidade: 3,
      motivo: 'VENDA_BALCAO',
      observacoes: 'Venda direta balcão ao cliente',
      criadoEm: new Date(Date.now() - 1 * 60 * 60 * 1000),
    }
  ];

  for (const mov of movimentacoesData) {
    await prisma.movimentacaoEstoque.create({ data: mov });
  }
  console.log(`${movimentacoesData.length} movimentações iniciais registradas.`);
  console.log('Seed em padrão PT-BR finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
