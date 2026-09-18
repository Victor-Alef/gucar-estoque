import { prisma } from '@/lib/prisma';
import { verificarSenha, assinarSessao } from '@/lib/auth';
import { SessaoUsuario } from '@/types';

export interface CredenciaisLogin {
  email: string;
  senha: string;
}

export interface ResultadoAutenticacao {
  usuario: SessaoUsuario;
  token: string;
}

export class AutenticacaoService {
  /**
   * Valida credenciais e gera a sessão para o usuário.
   */
  static async login(credenciais: CredenciaisLogin): Promise<ResultadoAutenticacao> {
    const { email, senha } = credenciais;

    if (!email || !senha) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!usuario) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    const senhaValida = await verificarSenha(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
    }

    const sessao: SessaoUsuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
    };

    const token = assinarSessao(sessao);

    return {
      usuario: sessao,
      token,
    };
  }
}
