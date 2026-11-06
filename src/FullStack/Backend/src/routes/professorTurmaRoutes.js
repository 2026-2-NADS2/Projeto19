
import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

router.use(autenticar);

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
    try {
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
    } catch (erro) {
        console.error('Erro ao listar vínculos:', erro.message);
        res.status(500).json({
            mensagem: 'Erro ao listar vínculos dos professores.'
        });
    }
});

// POST - Vincular professor, turma e disciplina
router.post('/', async (req, res) => {
    try {
        const { professor_id, turma_id, disciplina_id } = req.body ?? {};

        const professorId = Number(professor_id);
        const turmaId = Number(turma_id);
        const disciplinaId = Number(disciplina_id);

        if (
            !Number.isInteger(professorId) || professorId <= 0 ||
            !Number.isInteger(turmaId) || turmaId <= 0 ||
            !Number.isInteger(disciplinaId) || disciplinaId <= 0
        ) {
            return res.status(400).json({
                mensagem: 'Informe IDs válidos de professor, turma e disciplina.'
            });
        }

        const [professores] = await bancoDados.query(
            `SELECT id FROM usuarios
             WHERE id = ? AND perfil = 'professor' AND ativo = 1`,
            [professorId]
        );

        if (professores.length === 0) {
            return res.status(404).json({
                mensagem: 'Professor ativo não encontrado.'
            });
        }

        const [turmas] = await bancoDados.query(
            'SELECT id FROM turmas WHERE id = ? AND ativo = 1',
            [turmaId]
        );

        if (turmas.length === 0) {
            return res.status(404).json({
                mensagem: 'Turma ativa não encontrada.'
            });
        }

        const [disciplinas] = await bancoDados.query(
            'SELECT id FROM disciplinas WHERE id = ? AND ativo = 1',
            [disciplinaId]
        );

        if (disciplinas.length === 0) {
            return res.status(404).json({
                mensagem: 'Disciplina ativa não encontrada.'
            });
        }

        const [existentes] = await bancoDados.query(
            `SELECT id FROM professores_turmas_disciplinas
             WHERE professor_id = ? AND turma_id = ? AND disciplina_id = ?`,
            [professorId, turmaId, disciplinaId]
        );

        if (existentes.length > 0) {
            return res.status(409).json({
                mensagem: 'Esse vínculo já existe.'
            });
        }

        const [resultado] = await bancoDados.query(
            `INSERT INTO professores_turmas_disciplinas
             (professor_id, turma_id, disciplina_id)
             VALUES (?, ?, ?)`,
            [professorId, turmaId, disciplinaId]
        );

        res.status(201).json({
            mensagem: 'Professor vinculado com sucesso!',
            vinculo: {
                id: resultado.insertId,
                professor_id: professorId,
                turma_id: turmaId,
                disciplina_id: disciplinaId
            }
        });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Esse vínculo já existe.'
            });
        }

        console.error('Erro ao vincular professor:', erro.message);
        res.status(500).json({
            mensagem: 'Erro interno ao vincular professor.'
        });
    }
});

export default router;
