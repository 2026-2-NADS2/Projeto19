import { z } from 'zod';
import { falha } from '../middlewares/erros.js';
import { Router } from 'express';
import autenticar from '../middlewares/autenticar.js';
import { cienciaAtiva, consultarCiencia, registrarCiencia, versoes } from '../cienciaDocumentos.js';

export function criarRotasCiencia(pool) {
    const router = Router();
    const aceite = z.strictObject({
        ciente: z.literal(true), versaoTermos: z.string(), versaoPrivacidade: z.string()
    });

    router.use('/ciencia-documentos', (req, res, next) => {
        res.set('Cache-Control', 'no-store');
        next();
    });

    router.get('/ciencia-documentos', autenticar, async (req, res, next) => {
        try {
            const ativo = cienciaAtiva();
            const confirmado = ativo ? await consultarCiencia(req.usuario, pool) : false;

            if (confirmado === null) {
                return res.status(401).json({ mensagem: 'Sessão inválida para esta conta.' });
            }

            res.json({ ativo, confirmado, perfil: req.usuario.perfil, ...versoes });
        } catch {
            next(falha(503, 'Não foi possível consultar a ciência dos documentos.'));
        }
    });

    router.post('/ciencia-documentos', autenticar, async (req, res, next) => {
        if (!cienciaAtiva()) {
            return res.status(403).json({ mensagem: 'A confirmação de ciência está desativada.' });
        }

        const dados = aceite.safeParse(req.body);

        if (!dados.success) {
            return res.status(400).json({ mensagem: 'Envie apenas a confirmação e as versões exibidas.' });
        }

        const { versaoTermos, versaoPrivacidade } = dados.data;
        if (versaoTermos !== versoes.versaoTermos || versaoPrivacidade !== versoes.versaoPrivacidade) {
            return res.status(409).json({
                mensagem: 'As versões das minutas mudaram. Atualize a página e consulte os documentos novamente.'
            });
        }

        try {
            if (!(await registrarCiencia(req.usuario, pool))) {
                return res.status(401).json({ mensagem: 'Sessão inválida para esta conta.' });
            }

            res.json({ ativo: true, confirmado: true, perfil: req.usuario.perfil, ...versoes });
        } catch {
            next(falha(503, 'Não foi possível registrar a ciência dos documentos.'));
        }
    });

    return router;
}

export default criarRotasCiencia();
