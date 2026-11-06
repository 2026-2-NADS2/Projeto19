import { criarContexto, falha, id, texto } from './apoioRotas.js';

export function criarResponsavelRoutes(pool) {
    const { router, rota, equipe, todos, acompanhamento } = criarContexto(pool);
    rota('post', '/responsaveis-alunos', ['administrador'], async (req, db) => {
        const responsavelId = id(req.body?.responsavel_id);
        const alunoId = id(req.body?.aluno_id);
        const parentesco = req.body?.parentesco == null ? null : texto(req.body.parentesco, 50);
        const [usuarios] = await db.query("SELECT id FROM usuarios WHERE id = ? AND perfil = 'responsavel' AND ativo = 1", [responsavelId]);
        const [alunos] = await db.query('SELECT id FROM alunos WHERE id = ? AND ativo = 1', [alunoId]);
        if (!usuarios.length || !alunos.length) throw falha(404, 'Responsável ou aluno ativo não encontrado.');
        const [resultado] = await db.query('INSERT INTO responsaveis_alunos (responsavel_id, aluno_id, parentesco) VALUES (?, ?, ?)', [responsavelId, alunoId, parentesco]);
        return { status: 201, dados: { id: resultado.insertId, responsavel_id: responsavelId, aluno_id: alunoId, parentesco } };
    });
    rota('get', '/responsaveis-alunos', ['administrador', 'responsavel'], async (req, db) => {
        const filtro = req.usuario.perfil === 'responsavel' ? ' WHERE ra.responsavel_id = ?' : '';
        const [dados] = await db.query('SELECT ra.id, ra.responsavel_id, ra.aluno_id, ra.parentesco, a.nome AS aluno FROM responsaveis_alunos ra INNER JOIN alunos a ON a.id = ra.aluno_id' + filtro + ' ORDER BY a.nome', filtro ? [req.usuario.id] : []);
        return { dados };
    });
    rota('delete', '/responsaveis-alunos/:id', ['administrador'], async (req, db) => {
        const [resultado] = await db.query('DELETE FROM responsaveis_alunos WHERE id = ?', [id(req.params.id)]);
        if (!resultado.affectedRows) throw falha(404, 'Vínculo não encontrado.');
    });
    rota('get', '/responsaveis/acompanhamentos', ['responsavel'], async (req, db) => {
        const [dados] = await db.query("SELECT ac.*, a.nome AS aluno, d.nome AS disciplina, p.nome AS periodo, u.nome AS professor FROM acompanhamentos ac INNER JOIN alunos a ON a.id = ac.aluno_id INNER JOIN disciplinas d ON d.id = ac.disciplina_id INNER JOIN periodos_avaliativos p ON p.id = ac.periodo_id INNER JOIN usuarios u ON u.id = ac.professor_id WHERE ac.status = 'publicado' AND EXISTS (SELECT 1 FROM responsaveis_alunos ra WHERE ra.aluno_id = ac.aluno_id AND ra.responsavel_id = ?) ORDER BY ac.publicado_em DESC, ac.id DESC", [req.usuario.id]);
        return { dados };
    });
    return router;
}

export default criarResponsavelRoutes();
