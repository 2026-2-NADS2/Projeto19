import { Router } from 'express';
import autenticar from '../middlewares/autenticar.js';
import { cienciaAtiva, consultarCiencia, registrarCiencia, versoes } from '../cienciaDocumentos.js';

export function criarRotasCiencia(pool) {
    const router = Router();

    router.use('/ciencia-documentos', (req, res, next) => {
        res.set('Cache-Control', 'no-store');
        next();
    });

    router.get('/ciencia-documentos', autenticar, async (req, res) => {
        try {
            const ativo = cienciaAtiva();
            const confirmado = ativo ? await consultarCiencia(req.usuario, pool) : false;

            if (confirmado === null) {
                return res.status(401).json({ mensagem: 'Sessão inválida para esta conta.' });
            }

            res.json({ ativo, confirmado, perfil: req.usuario.perfil, ...versoes });
        } catch (erro) {
            console.error('Erro ao consultar ciência dos documentos:', erro.message);
            res.status(503).json({ mensagem: 'Não foi possível consultar a ciência dos documentos.' });
        }
    });

    router.post('/ciencia-documentos', autenticar, async (req, res) => {
        if (!cienciaAtiva()) {
            return res.status(403).json({ mensagem: 'A confirmação de ciência está desativada.' });
        }

        const { ciente, versaoTermos, versaoPrivacidade, ...outrosCampos } = req.body ?? {};

        if (ciente !== true || Object.keys(outrosCampos).length > 0) {
            return res.status(400).json({ mensagem: 'Envie apenas a confirmação e as versões exibidas.' });
        }

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
        } catch (erro) {
            console.error('Erro ao registrar ciência dos documentos:', erro.message);
            res.status(503).json({ mensagem: 'Não foi possível registrar a ciência dos documentos.' });
        }
    });

    return router;
}

export default criarRotasCiencia();
