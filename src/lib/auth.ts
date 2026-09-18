import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SessaoUsuario } from '@/types';

const COOKIE_NAME = 'gucar_session';
const SECRET = process.env.JWT_SECRET || 'gucar-autoletrica-pi2-univesp-secret-key-2026';

/**
 * Gera o hash da senha usando bcrypt.
 */
export async function gerarHashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 10);
}

/**
 * Compara a senha informada com o hash armazenado.
 */
export async function verificarSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

/**
 * Assina e codifica o payload da sessão.
 */
export function assinarSessao(usuario: SessaoUsuario): string {
  const payload = Buffer.from(JSON.stringify(usuario)).toString('base64url');
  const assinatura = Buffer.from(`${payload}.${SECRET}`).toString('base64url');
  return `${payload}.${assinatura}`;
}

/**
 * Verifica e decodifica o token de sessão.
 */
export function verificarSessao(token: string): SessaoUsuario | null {
  try {
    const [payload, assinatura] = token.split('.');
    if (!payload || !assinatura) return null;

    const assinaturaEsperada = Buffer.from(`${payload}.${SECRET}`).toString('base64url');
    if (assinatura !== assinaturaEsperada) return null;

    const decodificado = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decodificado) as SessaoUsuario;
  } catch {
    return null;
  }
}

/**
 * Obtém os dados do usuário autenticado na requisição atual via cookies.
 */
export async function obterUsuarioSessao(): Promise<SessaoUsuario | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verificarSessao(token);
  } catch {
    return null;
  }
}

/**
 * Opções padrão para o cookie de autenticação HttpOnly.
 */
export function obterOpcoesCookieSessao() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  };
}

// Aliases para retrocompatibilidade
export const hashPassword = gerarHashSenha;
export const verifyPassword = verificarSenha;
export const signSession = assinarSessao;
export const verifySession = verificarSessao;
export const getSessionUser = obterUsuarioSessao;
export const getSessionCookieOptions = obterOpcoesCookieSessao;
