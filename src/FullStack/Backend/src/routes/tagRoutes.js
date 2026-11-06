import { criarContexto, falha, id, texto } from './apoioRotas.js';

export function criarTagRoutes(pool) {
    const { router, rota, equipe, todos, acompanhamento } = criarContexto(pool);
    rota('get', '/tags', equipe, async (req, db) => {
        const [dados] = await db.query('SELECT id, nome, descricao, ativo FROM tags ORDER BY nome');
        return { dados };
    });
    rota('post', '/tags', ['administrador'], async (req, db) => {
        const nome = texto(req.body?.nome, 100);
        const descricao = req.body?.descricao == null ? null : texto(req.body.descricao, 255);
        const [resultado] = await db.query('INSERT INTO tags (nome, descricao) VALUES (?, ?)', [nome, descricao]);
        return { status: 201, dados: { id: resultado.insertId, nome, descricao } };
    });
    rota('get', '/acompanhamentos/:id/tags', todos, async (req, db) => {
        const ac = await acompanhamento(req, db);
        const [dados] = await db.query('SELECT t.id, t.nome, t.descricao FROM tags t INNER JOIN acompanhamentos_tags at ON at.tag_id = t.id WHERE at.acompanhamento_id = ? ORDER BY t.nome', [ac.id]);
        return { dados };
    });
    rota('post', '/acompanhamentos/:id/tags', ['professor'], async (req, db) => {
        const ac = await acompanhamento(req, db, true);
        const tagId = id(req.body?.tag_id);
        const [tags] = await db.query('SELECT id FROM tags WHERE id = ? AND ativo = 1', [tagId]);
        if (!tags.length) throw falha(404, 'Tag ativa não encontrada.');
        await db.query('INSERT INTO acompanhamentos_tags (acompanhamento_id, tag_id) VALUES (?, ?)', [ac.id, tagId]);
        return { status: 201 };
    });
    rota('delete', '/acompanhamentos/:id/tags/:tagId', ['professor'], async (req, db) => {
        const ac = await acompanhamento(req, db, true);
        const [resultado] = await db.query('DELETE FROM acompanhamentos_tags WHERE acompanhamento_id = ? AND tag_id = ?', [ac.id, id(req.params.tagId)]);
        if (!resultado.affectedRows) throw falha(404, 'Vínculo de tag não encontrado.');
    });
    return router;
}

export default criarTagRoutes();
