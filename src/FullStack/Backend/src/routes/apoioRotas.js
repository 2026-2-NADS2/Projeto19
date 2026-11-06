import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

export const falha = (status, mensagem) => Object.assign(new Error(mensagem), { status });
export const id = valor => {
    if (!/^[1-9]\d*$/.test(String(valor)) || !Number.isSafeInteger(Number(valor))) {
        throw falha(400, 'ID inválido.');
    }
    return Number(valor);
};
export const texto = (valor, limite) => {
    if (typeof valor !== 'string' || !valor.trim() || valor.trim().length > limite) {
        throw falha(400, 'Texto ausente ou acima do limite permitido.');
    }
    return valor.trim();
};

// A injeção do pool permite testar permissões sem acessar o banco real.
export function criarContexto(pool = bancoDados) {
    const router = Router();
    router.use(autenticar);
    const rota = (metodo, caminho, perfis, executar) => router[metodo](caminho, async (req, res) => {
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
            if (conexao) await conexao.rollback().catch(() => {});
            const status = erro.status ?? (erro.code === 'ER_DUP_ENTRY' ? 409 : 500);
            if (status === 500) console.error('Erro nas rotas complementares:', erro.message);
            res.status(status).json({ mensagem: erro.status ? erro.message : status === 409 ? 'Registro já existente.' : 'Erro interno ao realizar operação.' });
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
