
import jwt from 'jsonwebtoken';

export default function autenticar(req, res, next) {
    const autorizacao = req.headers.authorization;

    if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
        return res.status(401).json({
            mensagem: 'Token não informado.'
        });
    }

    const token = autorizacao.slice(7);

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            mensagem: 'Token inválido ou expirado.'
        });
    }
}
