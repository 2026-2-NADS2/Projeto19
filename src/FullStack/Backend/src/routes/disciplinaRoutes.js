
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

// Listar disciplinas
router.get('/', async (req, res) => {
    try {
        const [disciplinas] = await bancoDados.query(
            'SELECT id, nome, ativo FROM disciplinas ORDER BY nome'
        );

        res.json(disciplinas);
    } catch (erro) {
        console.error('Erro ao listar disciplinas:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao listar disciplinas.'
        });
    }
});

// Buscar disciplina por ID
router.get('/:id', async (req, res) => {
    try {
        const disciplinaId = Number(req.params.id);

        if (!Number.isSafeInteger(disciplinaId) || disciplinaId <= 0) {
            return res.status(400).json({
                mensagem: 'ID da disciplina inválido.'
            });
        }

        const [disciplinas] = await bancoDados.query(
            `SELECT id, nome, ativo
             FROM disciplinas
             WHERE id = ?`,
            [disciplinaId]
        );

        if (disciplinas.length === 0) {
            return res.status(404).json({
                mensagem: 'Disciplina não encontrada.'
            });
        }

        res.json(disciplinas[0]);
    } catch (erro) {
        console.error('Erro ao buscar disciplina:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao buscar disciplina.'
        });
    }
});

// Cadastrar disciplina
router.post('/', async (req, res) => {
    try {
        const { nome } = req.body ?? {};

        if (typeof nome !== 'string' || !nome.trim()) {
            return res.status(400).json({
                mensagem: 'Informe o nome da disciplina.'
            });
        }

        const nomeLimpo = nome.trim();

        const [existentes] = await bancoDados.query(
            'SELECT id FROM disciplinas WHERE nome = ?',
            [nomeLimpo]
        );

        if (existentes.length > 0) {
            return res.status(409).json({
                mensagem: 'Essa disciplina já está cadastrada.'
            });
        }

        const [resultado] = await bancoDados.query(
            'INSERT INTO disciplinas (nome) VALUES (?)',
            [nomeLimpo]
        );

        res.status(201).json({
            mensagem: 'Disciplina cadastrada com sucesso!',
            disciplina: {
                id: resultado.insertId,
                nome: nomeLimpo,
                ativo: 1
            }
        });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Essa disciplina já está cadastrada.'
            });
        }

        console.error('Erro ao cadastrar disciplina:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao cadastrar disciplina.'
        });
    }
});

export default router;
