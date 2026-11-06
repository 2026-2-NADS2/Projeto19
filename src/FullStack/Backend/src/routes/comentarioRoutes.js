import { criarContexto, falha, id, texto } from './apoioRotas.js';

export function criarComentarioRoutes(pool) {
    const { router, rota, equipe, todos, acompanhamento } = criarContexto(pool);
    rota('get', '/acompanhamentos/:id/comentarios', todos, async (req, db) => {
        const ac = await acompanhamento(req, db);
        const [dados] = await db.query('SELECT c.id, c.responsavel_id, u.nome AS responsavel, c.texto, c.criado_em FROM comentarios c INNER JOIN usuarios u ON u.id = c.responsavel_id WHERE c.acompanhamento_id = ? ORDER BY c.criado_em, c.id', [ac.id]);
        return { dados };
    });
    rota('post', '/acompanhamentos/:id/comentarios', ['responsavel'], async (req, db) => {
        const ac = await acompanhamento(req, db);
        const conteudo = texto(req.body?.texto, 16000);
        const [resultado] = await db.query('INSERT INTO comentarios (acompanhamento_id, responsavel_id, texto) VALUES (?, ?, ?)', [ac.id, req.usuario.id, conteudo]);
        return { status: 201, dados: { id: resultado.insertId, texto: conteudo } };
    });
    return router;
}

export default criarComentarioRoutes();
