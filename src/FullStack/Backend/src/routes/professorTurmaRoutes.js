import { z } from 'zod';
import { idPositivo, validar } from '../validacao.js';
import { falha } from '../middlewares/erros.js';

import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticarComCiencia from '../middlewares/autenticarComCiencia.js';

const router = Router();

router.use(autenticarComCiencia);

// Somente administradores
router.use((req, res, next) => {
    if (req.usuario.perfil !== 'administrador') {
        return res.status(403).json({
            mensagem: 'Acesso permitido apenas para administradores.'
        });
    }
    next();
});

// GET - Listar vínculos de professores
router.get('/', async (req, res) => {
    const [vinculos] = await bancoDados.query(
        `SELECT
            ptd.id,
            ptd.professor_id,
            u.nome AS professor,
            ptd.turma_id,
            t.nome AS turma,
            ptd.disciplina_id,
            d.nome AS disciplina
         FROM professores_turmas_disciplinas ptd
         INNER JOIN usuarios u ON u.id = ptd.professor_id
         INNER JOIN turmas t ON t.id = ptd.turma_id
         INNER JOIN disciplinas d ON d.id = ptd.disciplina_id
         ORDER BY u.nome, t.nome, d.nome`
    );

    res.json(vinculos);
});

const dadosVinculo = z.object({
    professor_id: idPositivo, turma_id: idPositivo, disciplina_id: idPositivo
});

router.post('/', salvarVinculo);
router.put('/:id', salvarVinculo);

async function salvarVinculo(req, res) {
    const vinculo = validar(dadosVinculo, req.body, 'Informe IDs válidos de professor, turma e disciplina.');
    const { professor_id, turma_id, disciplina_id } = vinculo;
    const [[validos]] = await bancoDados.query(
        `SELECT
            EXISTS (SELECT 1 FROM usuarios WHERE id = ? AND perfil = 'professor' AND ativo = 1) AS professor,
            EXISTS (SELECT 1 FROM turmas WHERE id = ? AND ativo = 1) AS turma,
            EXISTS (SELECT 1 FROM disciplinas WHERE id = ? AND ativo = 1) AS disciplina`,
        [professor_id, turma_id, disciplina_id]
    );
    if (!validos.professor || !validos.turma || !validos.disciplina) {
        throw falha(404, 'Selecione professor, turma e disciplina ativos.');
    }
    const parametros = [professor_id, turma_id, disciplina_id];
    try {
        if (req.method === 'POST') {
            const [resultado] = await bancoDados.query(
                'INSERT INTO professores_turmas_disciplinas (professor_id, turma_id, disciplina_id) VALUES (?, ?, ?)',
                parametros
            );
            return res.status(201).json({ mensagem: 'Professor vinculado com sucesso!', vinculo: { id: resultado.insertId, ...vinculo } });
        }
        const id = validar(idPositivo, req.params.id, 'Informe um ID de vínculo válido.');
        const [resultado] = await bancoDados.query(
            'UPDATE professores_turmas_disciplinas SET professor_id = ?, turma_id = ?, disciplina_id = ? WHERE id = ?',
            [...parametros, id]
        );
        if (!resultado.affectedRows) throw falha(404, 'Vínculo não encontrado.');
        res.json({ mensagem: 'Vínculo atualizado com sucesso!' });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') throw falha(409, 'Esse vínculo já existe.');
        throw erro;
    }
}

router.delete('/:id', async (req, res) => {
    const id = validar(idPositivo, req.params.id, 'Informe um ID de vínculo válido.');
    const [resultado] = await bancoDados.query('DELETE FROM professores_turmas_disciplinas WHERE id = ?', [id]);
    if (!resultado.affectedRows) throw falha(404, 'Vínculo não encontrado.');
    res.json({ mensagem: 'Vínculo removido com sucesso!' });
});

export default router;
