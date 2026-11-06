
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

// Todas as rotas exigem autenticação
router.use(autenticar);

// Somente administradores podem gerenciar usuários
router.use((req, res, next) => {
    if (req.usuario.perfil !== 'administrador') {
        return res.status(403).json({
            mensagem: 'Acesso permitido apenas para administradores.'
        });
    }

    next();
});

// GET - Listar usuários
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await bancoDados.query(
            `SELECT id, nome, email, perfil, ativo, criado_em
             FROM usuarios
             ORDER BY id`
        );

        res.json(usuarios);
    } catch (erro) {
        console.error('Erro ao listar usuários:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao listar usuários.'
        });
    }
});

// POST - Cadastrar professor ou responsável
router.post('/', async (req, res) => {
    try {
        const { nome, email, senha, perfil } = req.body ?? {};

        // Validar os campos recebidos
        if (
            typeof nome !== 'string' ||
            typeof email !== 'string' ||
            typeof senha !== 'string' ||
            typeof perfil !== 'string' ||
            !nome.trim() ||
            !email.trim() ||
            senha.length < 8
        ) {
            return res.status(400).json({
                mensagem: 'Informe nome, e-mail, perfil e senha com pelo menos 8 caracteres.'
            });
        }

        // O administrador só pode cadastrar estes perfis
        if (!['professor', 'responsavel'].includes(perfil)) {
            return res.status(400).json({
                mensagem: 'O perfil deve ser professor ou responsavel.'
            });
        }

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        // Validar formato básico do e-mail
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
            return res.status(400).json({
                mensagem: 'Informe um e-mail válido.'
            });
        }

        // Verificar se o e-mail já existe
        const [existentes] = await bancoDados.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [emailLimpo]
        );

        if (existentes.length > 0) {
            return res.status(409).json({
                mensagem: 'Já existe um usuário com esse e-mail.'
            });
        }

        // Proteger a senha antes de salvar
        const senhaHash = await bcrypt.hash(senha, 10);

        // Inserir o usuário no MySQL
        const [resultado] = await bancoDados.query(
            `INSERT INTO usuarios (nome, email, senha_hash, perfil)
             VALUES (?, ?, ?, ?)`,
            [nomeLimpo, emailLimpo, senhaHash, perfil]
        );

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            usuario: {
                id: resultado.insertId,
                nome: nomeLimpo,
                email: emailLimpo,
                perfil,
                ativo: 1
            }
        });
    } catch (erro) {
        // Também trata e-mail duplicado em cadastros simultâneos
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Já existe um usuário com esse e-mail.'
            });
        }

        console.error('Erro ao cadastrar usuário:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao cadastrar usuário.'
        });
    }
});

export default router;
