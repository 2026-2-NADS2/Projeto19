import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticarComCiencia from '../middlewares/autenticarComCiencia.js';

import { falha } from '../middlewares/erros.js';
import { idPositivo, textoObrigatorio, validar } from '../validacao.js';

export { falha };
export const id = valor => validar(idPositivo, valor, 'ID inválido.');
export const texto = (valor, limite) => validar(textoObrigatorio(limite), valor,
    'Texto ausente ou acima do limite permitido.');

// A injeção do pool permite testar permissões sem acessar o banco real.
export function criarContexto(pool = bancoDados) {
    const router = Router();

    const rota = (metodo, caminho, perfis, executar) =>
        router[metodo](caminho, autenticarComCiencia, async (req, res) => {
            let conexao;
            try {
                if (!perfis.includes(req.usuario.perfil)) throw falha(403, 'Acesso não autorizado.');
                conexao = await pool.getConnection();
                await conexao.beginTransaction();
                const [usuarios] = await conexao.query(
                    'SELECT id FROM usuarios WHERE id = ? AND perfil = ? AND ativo = 1',
                    [req.usuario.id, req.usuario.perfil]);
                if (!usuarios.length) throw falha(401, 'Usuário inativo ou não encontrado.');
                const resultado = await executar(req, conexao);
                await conexao.commit();
                res.status(resultado?.status ?? 200).json(resultado?.dados ?? { mensagem: 'Operação realizada com sucesso.' });
            } catch (erro) {
                if (conexao) await conexao.rollback().catch(() => { });
                throw erro;
            } finally {
                conexao?.release();
            }
        });
    const equipe = ['administrador', 'professor'];
    const todos = [...equipe, 'responsavel'];
    async function acompanhamento(req, db, escrita = false) {
        const [linhas] = await db.query('SELECT * FROM acompanhamentos WHERE id = ? FOR UPDATE', [id(req.params.id)]);
        const ac = linhas[0];
        if (!ac) throw falha(404, 'Acompanhamento não encontrado.');
        if (req.usuario.perfil === 'professor' && ac.professor_id !== Number(req.usuario.id)) {
            throw falha(403, 'Acompanhamento de outro professor.');
        }
        if (req.usuario.perfil === 'responsavel') {
            const [vinculos] = await db.query('SELECT id FROM responsaveis_alunos WHERE responsavel_id = ? AND aluno_id = ? FOR UPDATE', [req.usuario.id, ac.aluno_id]);
            if (ac.status !== 'publicado' || !vinculos.length) throw falha(403, 'Acompanhamento não disponível para este responsável.');
        }
        if (escrita && !['rascunho', 'devolvido'].includes(ac.status)) {
            throw falha(409, 'Somente rascunhos ou acompanhamentos devolvidos podem ser alterados.');
        }
        return ac;
    }
    return { router, rota, equipe, todos, acompanhamento };
}
