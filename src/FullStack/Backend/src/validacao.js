import { z } from 'zod';
import { falha } from './middlewares/erros.js';

export const email = z.string().trim().max(150).pipe(z.email());
export const senhaNova = z.string().min(8).refine(senha => Buffer.byteLength(senha, 'utf8') <= 72);
export const idPositivo = z.union([z.string().regex(/^[1-9]\d*$/), z.number()])
    .transform(Number).pipe(z.int().positive());
export const anoLetivo = z.int().min(1901).max(2155);
export const dataISO = z.iso.date();
export const textoObrigatorio = limite => z.string().trim().min(1).max(limite);

export function validar(schema, valor, mensagem) {
    const resultado = schema.safeParse(valor);
    if (!resultado.success) throw falha(400, mensagem);
    return resultado.data;
}
