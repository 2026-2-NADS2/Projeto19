import { idPositivo, textoObrigatorio } from '../validacao.js';

import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticarComCiencia from '../middlewares/autenticarComCiencia.js';

const router = Router();

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

// Listar disciplinas
router.get('/', async (req, res) => {
    const [disciplinas] = await bancoDados.query(
        'SELECT id, nome, ativo FROM disciplinas ORDER BY nome'
    );

    res.json(disciplinas);
});

// Buscar disciplina por ID
router.get('/:id', async (req, res) => {
    const disciplinaId = Number(req.params.id);

    if (!idPositivo.safeParse(req.params.id).success) {
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
});

// Cadastrar disciplina
router.post('/', async (req, res) => {
    try {
        const { nome } = req.body ?? {};

        if (!textoObrigatorio(100).safeParse(nome).success) {
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

        throw erro;
    }
});

export default router;
