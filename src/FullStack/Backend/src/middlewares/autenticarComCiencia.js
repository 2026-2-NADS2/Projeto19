import autenticar from './autenticar.js';
import { cienciaAtiva, consultarCiencia } from '../cienciaDocumentos.js';

export default function autenticarComCiencia(req, res, next) {
    if (!cienciaAtiva()) return autenticar(req, res, next);

    return autenticar(req, res, async () => {
        try {
            const confirmado = await consultarCiencia(req.usuario);

            if (confirmado === null) {
                return res.status(401).json({ mensagem: 'Sessão inválida para esta conta.' });
            }

            if (!confirmado) {
                return res.status(403).json({
                    codigo: 'CIENCIA_DOCUMENTOS_PENDENTE',
                    mensagem: 'Confirme a ciência das minutas para continuar no ambiente de teste.'
                });
            }

            next();
        } catch (erro) {
            console.error('Erro ao verificar a ciência dos documentos:', erro.message);
            res.status(503).json({ mensagem: 'Não foi possível verificar a ciência dos documentos.' });
        }
    });
}
