
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

// Validar data
function validarData(data) {
    if (data == null) {
        return true;
    }

    if (
        typeof data !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {
        return false;
    }

    const dataInformada = new Date(`${data}T00:00:00Z`);

    if (
        Number.isNaN(dataInformada.getTime()) ||
        dataInformada.toISOString().slice(0, 10) !== data
    ) {
        return false;
    }

    const hoje = new Date().toISOString().slice(0, 10);

    return data <= hoje;
}

// Listar alunos
router.get('/', async (req, res) => {
    try {
        const [alunos] = await bancoDados.query(
            `SELECT id, nome, data_nascimento, matricula, ativo, criado_em
             FROM alunos
             ORDER BY id`
        );

        res.json(alunos);
    } catch (erro) {
        console.error('Erro ao listar alunos:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao listar alunos.'
        });
    }
});

// Detalhar aluno
router.get('/:id', async (req, res) => {
    try {
        if (!validarId(req.params.id)) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const alunoId = Number(req.params.id);

        const [alunos] = await bancoDados.query(
            `SELECT id, nome, data_nascimento, matricula, ativo, criado_em
             FROM alunos
             WHERE id = ?`,
            [alunoId]
        );

        if (alunos.length === 0) {
            return res.status(404).json({
                mensagem: 'Aluno não encontrado.'
            });
        }

        res.json(alunos[0]);
    } catch (erro) {
        console.error('Erro ao buscar aluno:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao buscar aluno.'
        });
    }
});

// Cadastrar aluno
router.post('/', async (req, res) => {
    try {
        const { nome, data_nascimento, matricula } = req.body ?? {};

        if (
            typeof nome !== 'string' ||
            !nome.trim() ||
            typeof matricula !== 'string' ||
            !matricula.trim()
        ) {
            return res.status(400).json({
                mensagem: 'Informe o nome e a matrícula do aluno.'
            });
        }

        const nomeLimpo = nome.trim();
        const matriculaLimpa = matricula.trim();

        if (!validarData(data_nascimento)) {
            return res.status(400).json({
                mensagem: 'Informe uma data de nascimento válida, que não seja futura, no formato AAAA-MM-DD.'
            });
        }

        const [existentes] = await bancoDados.query(
            'SELECT id FROM alunos WHERE matricula = ?',
            [matriculaLimpa]
        );

        if (existentes.length > 0) {
            return res.status(409).json({
                mensagem: 'Já existe um aluno com essa matrícula.'
            });
        }

        const [resultado] = await bancoDados.query(
            `INSERT INTO alunos (nome, data_nascimento, matricula)
             VALUES (?, ?, ?)`,
            [
                nomeLimpo,
                data_nascimento ?? null,
                matriculaLimpa
            ]
        );

        res.status(201).json({
            mensagem: 'Aluno cadastrado com sucesso!',
            aluno: {
                id: resultado.insertId,
                nome: nomeLimpo,
                data_nascimento: data_nascimento ?? null,
                matricula: matriculaLimpa,
                ativo: 1
            }
        });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Já existe um aluno com essa matrícula.'
            });
        }

        console.error('Erro ao cadastrar aluno:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao cadastrar aluno.'
        });
    }
});

// Editar aluno
router.put('/:id', async (req, res) => {
    try {
        if (!validarId(req.params.id)) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const alunoId = Number(req.params.id);

        const { nome, matricula, data_nascimento } = req.body ?? {};

        if (
            typeof nome !== 'string' ||
            !nome.trim() ||
            typeof matricula !== 'string' ||
            !matricula.trim()
        ) {
            return res.status(400).json({
                mensagem: 'Nome e matrícula são obrigatórios.'
            });
        }

        if (!validarData(data_nascimento)) {
            return res.status(400).json({
                mensagem: 'Data de nascimento inválida ou futura.'
            });
        }

        const [resultado] = await bancoDados.query(
            `UPDATE alunos
             SET nome = ?, matricula = ?, data_nascimento = ?
             WHERE id = ? AND ativo = 1`,
            [
                nome.trim(),
                matricula.trim(),
                data_nascimento ?? null,
                alunoId
            ]
        );

        if (!resultado.affectedRows) {
            return res.status(404).json({
                mensagem: 'Aluno ativo não encontrado.'
            });
        }

        res.json({
            mensagem: 'Aluno atualizado com sucesso!'
        });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Matrícula já cadastrada.'
            });
        }

        console.error('Erro ao editar aluno:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao editar aluno.'
        });
    }
});

// Desativar aluno
router.delete('/:id', async (req, res) => {
    try {
        if (!validarId(req.params.id)) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const alunoId = Number(req.params.id);

        const [resultado] = await bancoDados.query(
            'UPDATE alunos SET ativo = 0 WHERE id = ? AND ativo = 1',
            [alunoId]
        );

        if (!resultado.affectedRows) {
            return res.status(404).json({
                mensagem: 'Aluno ativo não encontrado.'
            });
        }

        res.json({
            mensagem: 'Aluno desativado com sucesso!'
        });
    } catch (erro) {
        console.error('Erro ao desativar aluno:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao desativar aluno.'
        });
    }
});

// Reativar aluno
router.patch('/:id/reativar', async (req, res) => {
    try {
        if (!validarId(req.params.id)) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const alunoId = Number(req.params.id);

        const [resultado] = await bancoDados.query(
            'UPDATE alunos SET ativo = 1 WHERE id = ? AND ativo = 0',
            [alunoId]
        );

        if (!resultado.affectedRows) {
            return res.status(404).json({
                mensagem: 'Aluno inativo não encontrado.'
            });
        }

        res.json({
            mensagem: 'Aluno reativado com sucesso!'
        });
    } catch (erro) {
        console.error('Erro ao reativar aluno:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao reativar aluno.'
        });
    }
});

export default router;
