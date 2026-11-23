
import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

import { z } from 'zod';
import { email as emailSchema, validar } from '../validacao.js';

const credenciais = z.object({ email: emailSchema, senha: z.string().min(1) });

// Executa o mesmo trabalho de bcrypt para contas ausentes.
const hashReserva = bcrypt.hashSync(randomBytes(32).toString('hex'), 10);

export default function criarAuthRoutes(pool = bancoDados) {
    const router = Router();

    // Login
    router.post('/login', async (req, res) => {
        const { email, senha } = validar(credenciais, req.body, 'Informe e-mail e senha válidos.');

        const [usuarios] = await pool.query(
            `SELECT id, nome, email, senha_hash, perfil
             FROM usuarios
             WHERE email = ? AND ativo = 1`,
            [email]
        );

        const usuario = usuarios[0];

        const senhaCorreta = await bcrypt.compare(senha, usuario?.senha_hash ?? hashReserva);

        if (!senhaCorreta || !usuario) {
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
                algorithm: 'HS256',
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
    });

    // Perfil do usuário autenticado
    router.get('/perfil', autenticar, async (req, res) => {
        const [usuarios] = await pool.query(
            `SELECT id, nome, email, perfil, ativo
             FROM usuarios
             WHERE id = ? AND perfil = ? AND ativo = 1`,
            [req.usuario.id, req.usuario.perfil]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: 'Usuário não encontrado ou inativo.'
            });
        }

        res.json(usuarios[0]);
    });

    return router;
}
