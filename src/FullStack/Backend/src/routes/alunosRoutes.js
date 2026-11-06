
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

// GET - Listar alunos
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

// POST - Cadastrar aluno
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

        if (
            data_nascimento != null &&
            (
                typeof data_nascimento !== 'string' ||
                !/^\d{4}-\d{2}-\d{2}$/.test(data_nascimento) ||
                Number.isNaN(Date.parse(data_nascimento)) ||
                new Date(data_nascimento).toISOString().slice(0, 10) !== data_nascimento
            )
        ) {
            return res.status(400).json({
                mensagem: 'Informe uma data de nascimento válida no formato AAAA-MM-DD.'
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
            [nomeLimpo, data_nascimento ?? null, matriculaLimpa]
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

export default router;
