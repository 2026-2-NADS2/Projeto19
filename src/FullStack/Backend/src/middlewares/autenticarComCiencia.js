import autenticar from './autenticar.js';
import bancoDados from '../bancoDados.js';
import { falha } from './erros.js';
import { cienciaAtiva, consultarCiencia } from '../cienciaDocumentos.js';

export default function autenticarComCiencia(req, res, next) {
    return autenticar(req, res, async () => {
        if (!cienciaAtiva()) {
            try {
                const [usuarios] = await bancoDados.execute(
                    'SELECT id FROM usuarios WHERE id = ? AND perfil = ? AND ativo = 1',
                    [req.usuario.id, req.usuario.perfil]
                );
                if (!usuarios.length) return res.status(401).json({ mensagem: 'Sessão inválida para esta conta.' });
                return next();
            } catch (erro) {
                return next(erro);
            }
        }

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
        } catch {
            next(falha(503, 'Não foi possível verificar a ciência dos documentos.'));
        }
    });
}
