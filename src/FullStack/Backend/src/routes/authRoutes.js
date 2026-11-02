
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body ?? {};

        if (
            typeof email !== 'string' ||
            typeof senha !== 'string' ||
            !email.trim() ||
            !senha
        ) {
            return res.status(400).json({
                mensagem: 'Informe e-mail e senha válidos.'
            });
        }

        const [usuarios] = await bancoDados.query(
            `SELECT id, nome, email, senha_hash, perfil
             FROM usuarios
             WHERE email = ? AND ativo = 1`,
            [email.trim()]
        );

        const usuario = usuarios[0];

        if (
            !usuario ||
            !(await bcrypt.compare(senha, usuario.senha_hash))
        ) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha inválidos.'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                perfil: usuario.perfil
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '2h'
            }
        );

        res.json({
            mensagem: 'Login realizado com sucesso!',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });
    } catch (erro) {
        console.error('Erro no login:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao realizar login.'
        });
    }
});

// Perfil do usuário autenticado
router.get('/perfil', autenticar, async (req, res) => {
    try {
        const [usuarios] = await bancoDados.query(
            `SELECT id, nome, email, perfil, ativo
             FROM usuarios
             WHERE id = ? AND ativo = 1`,
            [req.usuario.id]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: 'Usuário não encontrado ou inativo.'
            });
        }

        res.json(usuarios[0]);
    } catch (erro) {
        console.error('Erro ao buscar perfil:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao buscar perfil.'
        });
    }
});

export default router;
