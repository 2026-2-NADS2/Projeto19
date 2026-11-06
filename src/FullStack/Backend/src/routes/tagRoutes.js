
import {
    criarContexto,
    falha,
    id,
    texto
} from './apoioRotas.js';

export function criarTagRoutes(pool) {
    const {
        router,
        rota,
        equipe,
        todos,
        acompanhamento
    } = criarContexto(pool);

    // READ - Listar tags
    rota('get', '/tags', equipe, async (req, db) => {
        const [dados] = await db.query(
            `SELECT id, nome, descricao, ativo
       FROM tags
       ORDER BY nome`
        );

        return { dados };
    });

    // CREATE - Cadastrar tag
    rota('post', '/tags', ['administrador'], async (req, db) => {
        const nome = texto(req.body?.nome, 100);

        const descricao = req.body?.descricao == null
            ? null
            : texto(req.body.descricao, 255);

        const [resultado] = await db.query(
            `INSERT INTO tags (nome, descricao)
       VALUES (?, ?)`,
            [nome, descricao]
        );

        return {
            status: 201,
            dados: {
                id: resultado.insertId,
                nome,
                descricao,
                ativo: 1
            }
        };
    });

    // UPDATE - Editar tag
    rota('put', '/tags/:id', ['administrador'], async (req, db) => {
        const tagId = id(req.params.id);
        const nome = texto(req.body?.nome, 100);

        const descricao = req.body?.descricao == null
            ? null
            : texto(req.body.descricao, 255);

        const [resultado] = await db.query(
            `UPDATE tags
       SET nome = ?, descricao = ?
       WHERE id = ?`,
            [nome, descricao, tagId]
        );

        if (!resultado.affectedRows) {
            throw falha(404, 'Tag não encontrada.');
        }

        return {
            dados: {
                mensagem: 'Tag atualizada com sucesso.'
            }
        };
    });

    // DELETE LÓGICO - Desativar tag
    rota('delete', '/tags/:id', ['administrador'], async (req, db) => {
        const tagId = id(req.params.id);

        const [resultado] = await db.query(
            `UPDATE tags
       SET ativo = 0
       WHERE id = ? AND ativo = 1`,
            [tagId]
        );

        if (!resultado.affectedRows) {
            throw falha(404, 'Tag ativa não encontrada.');
        }

        return {
            dados: {
                mensagem: 'Tag desativada com sucesso.'
            }
        };
    });

    // Reativar tag
    rota('patch', '/tags/:id/reativar', ['administrador'], async (req, db) => {
        const tagId = id(req.params.id);

        const [resultado] = await db.query(
            `UPDATE tags
       SET ativo = 1
       WHERE id = ? AND ativo = 0`,
            [tagId]
        );

        if (!resultado.affectedRows) {
            throw falha(404, 'Tag inativa não encontrada.');
        }

        return {
            dados: {
                mensagem: 'Tag reativada com sucesso.'
            }
        };
    });

    // Listar tags de um acompanhamento
    rota('get', '/acompanhamentos/:id/tags', todos, async (req, db) => {
        const ac = await acompanhamento(req, db);

        const [dados] = await db.query(
            `SELECT t.id, t.nome, t.descricao
       FROM tags t
       INNER JOIN acompanhamentos_tags at
         ON at.tag_id = t.id
       WHERE at.acompanhamento_id = ?
       ORDER BY t.nome`,
            [ac.id]
        );

        return { dados };
    });

    // Vincular tag a acompanhamento
    rota('post', '/acompanhamentos/:id/tags', ['professor'], async (req, db) => {
        const ac = await acompanhamento(req, db, true);
        const tagId = id(req.body?.tag_id);

        const [tags] = await db.query(
            'SELECT id FROM tags WHERE id = ? AND ativo = 1',
            [tagId]
        );

        if (!tags.length) {
            throw falha(404, 'Tag ativa não encontrada.');
        }

        await db.query(
            `INSERT INTO acompanhamentos_tags
       (acompanhamento_id, tag_id)
       VALUES (?, ?)`,
            [ac.id, tagId]
        );

        return { status: 201 };
    });

    // Desvincular tag de acompanhamento
    rota('delete', '/acompanhamentos/:id/tags/:tagId', ['professor'], async (req, db) => {
        const ac = await acompanhamento(req, db, true);

        const [resultado] = await db.query(
            `DELETE FROM acompanhamentos_tags
       WHERE acompanhamento_id = ? AND tag_id = ?`,
            [ac.id, id(req.params.tagId)]
        );

        if (!resultado.affectedRows) {
            throw falha(404, 'Vínculo de tag não encontrado.');
        }
    });

    return router;
}

export default criarTagRoutes();
