
import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

// Todas as rotas exigem login
router.use(autenticar);

// Apenas administradores podem gerenciar turmas
router.use((req, res, next) => {
    if (req.usuario.perfil !== 'administrador') {
        return res.status(403).json({
            mensagem: 'Acesso permitido apenas para administradores.'
        });
    }

    next();
});

// GET - Listar turmas
router.get('/', async (req, res) => {
    try {
        const [turmas] = await bancoDados.query(
            `SELECT id, nome, ano_letivo, periodo, ativo, criado_em
             FROM turmas
             ORDER BY ano_letivo DESC, nome`
        );

        res.json(turmas);
    } catch (erro) {
        console.error('Erro ao listar turmas:', erro.message);
        res.status(500).json({
            mensagem: 'Erro ao listar turmas.'
        });
    }
});

// POST - Cadastrar turma
router.post('/', async (req, res) => {
    try {
        const { nome, ano_letivo, periodo } = req.body ?? {};

        const periodosValidos = ['manha', 'tarde', 'noite', 'integral'];

        if (
            typeof nome !== 'string' ||
            !nome.trim() ||
            !Number.isInteger(Number(ano_letivo)) ||
            Number(ano_letivo) < 1901 ||
            Number(ano_letivo) > 2155 ||
            !periodosValidos.includes(periodo)
        ) {
            return res.status(400).json({
                mensagem: 'Informe nome, ano letivo e período válido.'
            });
        }

        const [resultado] = await bancoDados.query(
            `INSERT INTO turmas (nome, ano_letivo, periodo)
             VALUES (?, ?, ?)`,
            [nome.trim(), Number(ano_letivo), periodo]
        );

        res.status(201).json({
            mensagem: 'Turma cadastrada com sucesso!',
            turma: {
                id: resultado.insertId,
                nome: nome.trim(),
                ano_letivo: Number(ano_letivo),
                periodo,
                ativo: 1
            }
        });
    } catch (erro) {
        console.error('Erro ao cadastrar turma:', erro.message);
        res.status(500).json({
            mensagem: 'Erro interno ao cadastrar turma.'
        });
    }
});

// GET - Listar alunos de uma turma
router.get('/:id/alunos', async (req, res) => {
    try {
        const turmaId = Number(req.params.id);

        if (!Number.isInteger(turmaId) || turmaId <= 0) {
            return res.status(400).json({
                mensagem: 'ID da turma inválido.'
            });
        }

        const [turmas] = await bancoDados.query(
            'SELECT id FROM turmas WHERE id = ?',
            [turmaId]
        );

        if (turmas.length === 0) {
            return res.status(404).json({
                mensagem: 'Turma não encontrada.'
            });
        }

        const [alunos] = await bancoDados.query(
            `SELECT a.id, a.nome, a.matricula, a.data_nascimento
             FROM alunos a
             INNER JOIN alunos_turmas at ON at.aluno_id = a.id
             WHERE at.turma_id = ?
             ORDER BY a.nome`,
            [turmaId]
        );

        res.json(alunos);
    } catch (erro) {
        console.error('Erro ao listar alunos da turma:', erro.message);
        res.status(500).json({
            mensagem: 'Erro ao listar alunos da turma.'
        });
    }
});

// POST - Vincular aluno à turma
router.post('/:id/alunos', async (req, res) => {
    try {
        const turmaId = Number(req.params.id);
        const alunoId = Number(req.body?.aluno_id);

        if (
            !Number.isInteger(turmaId) ||
            turmaId <= 0 ||
            !Number.isInteger(alunoId) ||
            alunoId <= 0
        ) {
            return res.status(400).json({
                mensagem: 'Informe IDs válidos para turma e aluno.'
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

        const [alunos] = await bancoDados.query(
            'SELECT id FROM alunos WHERE id = ? AND ativo = 1',
            [alunoId]
        );

        if (alunos.length === 0) {
            return res.status(404).json({
                mensagem: 'Aluno ativo não encontrado.'
            });
        }

        const [vinculos] = await bancoDados.query(
            `SELECT id FROM alunos_turmas
             WHERE aluno_id = ? AND turma_id = ?`,
            [alunoId, turmaId]
        );

        if (vinculos.length > 0) {
            return res.status(409).json({
                mensagem: 'Aluno já está vinculado a essa turma.'
            });
        }

        const [resultado] = await bancoDados.query(
            `INSERT INTO alunos_turmas (aluno_id, turma_id)
             VALUES (?, ?)`,
            [alunoId, turmaId]
        );

        res.status(201).json({
            mensagem: 'Aluno vinculado à turma com sucesso!',
            vinculo: {
                id: resultado.insertId,
                aluno_id: alunoId,
                turma_id: turmaId
            }
        });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Aluno já está vinculado a essa turma.'
            });
        }

        console.error('Erro ao vincular aluno:', erro.message);
        res.status(500).json({
            mensagem: 'Erro interno ao vincular aluno à turma.'
        });
    }
});

export default router;
