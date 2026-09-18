import { NextRequest, NextResponse } from 'next/server';
import { AutenticacaoService } from '@/services/autenticacao.service';
import { obterOpcoesCookieSessao } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const corpo = await req.json();
    const email = corpo.email;
    const senha = corpo.senha || corpo.password;

    const { usuario, token } = await AutenticacaoService.login({ email, senha });

    const opcoesCookie = obterOpcoesCookieSessao();
    const resposta = NextResponse.json({
      success: true,
      sucesso: true,
      usuario,
      user: usuario,
    });

    resposta.cookies.set(opcoesCookie.name, token, opcoesCookie);

    return resposta;
  } catch (error: any) {
    const status = error.message?.includes('inválidas') ? 401 : 400;
    return NextResponse.json(
      { error: error.message || 'Erro ao realizar login.' },
      { status }
    );
  }
}
