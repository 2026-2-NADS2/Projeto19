
import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

// Exigir login
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

// Validar ID
function validarId(id) {
    const numero = Number(id);
    return Number.isSafeInteger(numero) && numero > 0;
}

// Validar dados da turma
function validarDadosTurma(nome, ano_letivo, periodo) {
    const periodosValidos = ['manha', 'tarde', 'noite', 'integral'];

    return (
        typeof nome === 'string' &&
        nome.trim().length > 0 &&
        ano_letivo !== null &&
        ano_letivo !== undefined &&
        String(ano_letivo).trim() !== '' &&
        Number.isInteger(Number(ano_letivo)) &&
        Number(ano_letivo) >= 1901 &&
        Number(ano_letivo) <= 2155 &&
        periodosValidos.includes(periodo)
    );
}

// Listar turmas
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

// Buscar turma por ID
router.get('/:id', async (req, res) => {
    try {
        if (!validarId(req.params.id)) {
            return res.status(400).json({
                mensagem: 'ID da turma inválido.'
            });
        }

        const turmaId = Number(req.params.id);

        const [turmas] = await bancoDados.query(
            `SELECT id, nome, ano_letivo, periodo, ativo, criado_em
             FROM turmas
             WHERE id = ?`,
            [turmaId]
        );

        if (turmas.length === 0) {
            return res.status(404).json({
                mensagem: 'Turma não encontrada.'
            });
        }

        res.json(turmas[0]);
    } catch (erro) {
        console.error('Erro ao buscar turma:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao buscar turma.'
        });
    }
});

// Cadastrar turma
router.post('/', async (req, res) => {
    try {
        const { nome, ano_letivo, periodo } = req.body ?? {};

        if (!validarDadosTurma(nome, ano_letivo, periodo)) {
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

// Editar turma
router.put('/:id', async (req, res) => {
    try {
        if (!validarId(req.params.id)) {
            return res.status(400).json({
                mensagem: 'ID da turma inválido.'
            });
        }

        const turmaId = Number(req.params.id);
        const { nome, ano_letivo, periodo } = req.body ?? {};

        if (!validarDadosTurma(nome, ano_letivo, periodo)) {
            return res.status(400).json({
                mensagem: 'Informe nome, ano letivo e período válido.'
            });
        }

        const [turmas] = await bancoDados.query(
            'SELECT id, ativo FROM turmas WHERE id = ?',
            [turmaId]
        );

        if (turmas.length === 0) {
            return res.status(404).json({
                mensagem: 'Turma não encontrada.'
            });
        }

        if (Number(turmas[0].ativo) !== 1) {
            return res.status(409).json({
                mensagem: 'Reative a turma antes de editá-la.'
            });
        }

        await bancoDados.query(
            `UPDATE turmas
             SET nome = ?, ano_letivo = ?, periodo = ?
             WHERE id = ? AND ativo = 1`,
            [
                nome.trim(),
                Number(ano_letivo),
                periodo,
                turmaId
            ]
        );

        res.json({
            mensagem: 'Turma atualizada com sucesso!',
            turma: {
                id: turmaId,
                nome: nome.trim(),
                ano_letivo: Number(ano_letivo),
                periodo,
                ativo: 1
            }
        });
    } catch (erro) {
        console.error('Erro ao editar turma:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao editar turma.'
        });
    }
});

// Desativar turma
router.delete('/:id', async (req, res) => {
    try {
        if (!validarId(req.params.id)) {
            return res.status(400).json({
                mensagem: 'ID da turma inválido.'
            });
        }

        const turmaId = Number(req.params.id);

        const [resultado] = await bancoDados.query(
            `UPDATE turmas
             SET ativo = 0
             WHERE id = ? AND ativo = 1`,
            [turmaId]
        );

        if (resultado.affectedRows === 0) {
            const [turmas] = await bancoDados.query(
                'SELECT id FROM turmas WHERE id = ?',
                [turmaId]
            );

            return res.status(turmas.length === 0 ? 404 : 409).json({
                mensagem: turmas.length === 0
                    ? 'Turma não encontrada.'
                    : 'Esta turma já está desativada.'
            });
        }

        res.json({
            mensagem: 'Turma desativada com sucesso!'
        });
    } catch (erro) {
        console.error('Erro ao desativar turma:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao desativar turma.'
        });
    }
});

// Reativar turma
router.patch('/:id/reativar', async (req, res) => {
    try {
        if (!validarId(req.params.id)) {
            return res.status(400).json({
                mensagem: 'ID da turma inválido.'
            });
        }

        const turmaId = Number(req.params.id);

        const [resultado] = await bancoDados.query(
            `UPDATE turmas
             SET ativo = 1
             WHERE id = ? AND ativo = 0`,
            [turmaId]
        );

        if (resultado.affectedRows === 0) {
            const [turmas] = await bancoDados.query(
                'SELECT id FROM turmas WHERE id = ?',
                [turmaId]
            );

            return res.status(turmas.length === 0 ? 404 : 409).json({
                mensagem: turmas.length === 0
                    ? 'Turma não encontrada.'
                    : 'Esta turma já está ativa.'
            });
        }

        res.json({
            mensagem: 'Turma reativada com sucesso!'
        });
    } catch (erro) {
        console.error('Erro ao reativar turma:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao reativar turma.'
        });
    }
});

// Listar alunos da turma
router.get('/:id/alunos', async (req, res) => {
    try {
        if (!validarId(req.params.id)) {
            return res.status(400).json({
                mensagem: 'ID da turma inválido.'
            });
        }

        const turmaId = Number(req.params.id);

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

// Vincular aluno à turma
router.post('/:id/alunos', async (req, res) => {
    try {
        const turmaId = Number(req.params.id);
        const alunoId = Number(req.body?.aluno_id);

        if (
            !validarId(req.params.id) ||
            !Number.isSafeInteger(alunoId) ||
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
