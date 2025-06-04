import { hash } from 'bcryptjs';

// criptografia da senha
export async function hashPassword(password: string): Promise<string> {
    return hash(password, 10);
}


// verifica se a senha está correta
export async function isCorrecthashPassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
}