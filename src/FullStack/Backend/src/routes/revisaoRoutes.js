import { criarContexto, falha, id, texto } from './apoioRotas.js';

export function criarRevisaoRoutes(pool) {
    const { router, rota, equipe, todos, acompanhamento } = criarContexto(pool);
    async function revisar(req, db, acao) {
        const ac = await acompanhamento(req, db);
        if (ac.status !== 'pendente') throw falha(409, 'O acompanhamento precisa estar pendente de revisão.');
        const observacao = req.body?.observacao == null ? null : texto(req.body.observacao, 16000);
        if (acao === 'devolvido' && !observacao) throw falha(400, 'Informe o motivo da devolução.');
        await db.query('INSERT INTO revisoes_acompanhamentos (acompanhamento_id, administrador_id, acao, observacao) VALUES (?, ?, ?, ?)', [ac.id, req.usuario.id, acao, observacao]);
        await db.query('UPDATE acompanhamentos SET status = ?, publicado_em = ? WHERE id = ?', [acao === 'aprovado' ? 'publicado' : 'devolvido', acao === 'aprovado' ? new Date() : null, ac.id]);
    }
    rota('patch', '/acompanhamentos/:id/publicar', ['administrador'], (req, db) => revisar(req, db, 'aprovado'));
    rota('post', '/acompanhamentos/:id/revisoes', ['administrador'], (req, db) => {
        if (!['aprovado', 'devolvido'].includes(req.body?.acao)) throw falha(400, 'Ação de revisão inválida.');
        return revisar(req, db, req.body.acao);
    });
    rota('get', '/acompanhamentos/:id/revisoes', equipe, async (req, db) => {
        const ac = await acompanhamento(req, db);
        const [dados] = await db.query('SELECT id, administrador_id, acao, observacao, criado_em FROM revisoes_acompanhamentos WHERE acompanhamento_id = ? ORDER BY criado_em, id', [ac.id]);
        return { dados };
    });
    return router;
}

export default criarRevisaoRoutes();
