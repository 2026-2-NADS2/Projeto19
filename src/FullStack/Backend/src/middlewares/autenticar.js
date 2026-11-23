
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const sessao = z.object({
    id: z.int().positive(),
    perfil: z.enum(['administrador', 'professor', 'responsavel']),
    exp: z.number()
});

export default function autenticar(req, res, next) {
    const autorizacao = req.headers.authorization;

    if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
        return res.status(401).json({
            mensagem: 'Token não informado.'
        });
    }

    const token = autorizacao.slice(7);

    try {
        req.usuario = sessao.parse(jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }));
        next();
    } catch {
        return res.status(401).json({
            mensagem: 'Token inválido ou expirado.'
        });
    }
}
