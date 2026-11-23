import { dataISO, idPositivo, textoObrigatorio } from '../validacao.js';

import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticarComCiencia from '../middlewares/autenticarComCiencia.js';

const router = Router();
const nomeValido = textoObrigatorio(150);
const matriculaValida = textoObrigatorio(30);

// Exigir login
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

// Validar ID
function validarId(valor) {
    return idPositivo.safeParse(valor).success;
}

// Validar data
function validarData(data) {
    return dataISO.safeParse(data).success && data <= new Date().toISOString().slice(0, 10);
}

// Listar alunos
router.get('/', async (req, res) => {
    const [alunos] = await bancoDados.query(
        `SELECT id, nome, data_nascimento, matricula, ativo, criado_em
         FROM alunos
         ORDER BY id`
    );

    res.json(alunos);
});

// Detalhar aluno
router.get('/:id', async (req, res) => {
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
});

// Cadastrar aluno
router.post('/', async (req, res) => {
    try {
        const { nome, data_nascimento, matricula } = req.body ?? {};

        if (
            !nomeValido.safeParse(nome).success || !matriculaValida.safeParse(matricula).success
        ) {
            return res.status(400).json({
                mensagem: 'Informe nome de até 150 caracteres e matrícula de até 30 caracteres.'
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

        throw erro;
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
            !nomeValido.safeParse(nome).success || !matriculaValida.safeParse(matricula).success
        ) {
            return res.status(400).json({
                mensagem: 'Informe nome de até 150 caracteres e matrícula de até 30 caracteres.'
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

        throw erro;
    }
});

// Desativar aluno
router.delete('/:id', async (req, res) => {
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
});

// Reativar aluno
router.patch('/:id/reativar', async (req, res) => {
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
});

export default router;
