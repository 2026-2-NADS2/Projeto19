
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

// Exigir autenticação
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
function validarId(valor) {
    const id = Number(valor);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return null;
    }

    return id;
}

// Validar e-mail
function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Listar usuários
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

// Buscar usuário por ID
router.get('/:id', async (req, res) => {
    try {
        const usuarioId = validarId(req.params.id);

        if (!usuarioId) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const [usuarios] = await bancoDados.query(
            `SELECT id, nome, email, perfil, ativo, criado_em
             FROM usuarios
             WHERE id = ?`,
            [usuarioId]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        res.json(usuarios[0]);
    } catch (erro) {
        console.error('Erro ao buscar usuário:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao buscar usuário.'
        });
    }
});

// Cadastrar professor ou responsável
router.post('/', async (req, res) => {
    try {
        const { nome, email, senha, perfil } = req.body ?? {};

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

        if (!['professor', 'responsavel'].includes(perfil)) {
            return res.status(400).json({
                mensagem: 'O perfil deve ser professor ou responsavel.'
            });
        }

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        if (!emailValido(emailLimpo)) {
            return res.status(400).json({
                mensagem: 'Informe um e-mail válido.'
            });
        }

        const [existentes] = await bancoDados.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [emailLimpo]
        );

        if (existentes.length > 0) {
            return res.status(409).json({
                mensagem: 'Já existe um usuário com esse e-mail.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

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

// Editar professor ou responsável
router.put('/:id', async (req, res) => {
    try {
        const usuarioId = validarId(req.params.id);

        if (!usuarioId) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const { nome, email, senha } = req.body ?? {};

        if (
            typeof nome !== 'string' ||
            typeof email !== 'string' ||
            !nome.trim() ||
            !email.trim()
        ) {
            return res.status(400).json({
                mensagem: 'Nome e e-mail são obrigatórios.'
            });
        }

        const nomeLimpo = nome.trim();
        const emailLimpo = email.trim().toLowerCase();

        if (!emailValido(emailLimpo)) {
            return res.status(400).json({
                mensagem: 'Informe um e-mail válido.'
            });
        }

        const [usuarios] = await bancoDados.query(
            `SELECT id, perfil, ativo
             FROM usuarios
             WHERE id = ?`,
            [usuarioId]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        if (!['professor', 'responsavel'].includes(usuarios[0].perfil)) {
            return res.status(403).json({
                mensagem: 'Não é permitido editar administradores por esta rota.'
            });
        }

        if (usuarios[0].ativo === 0) {
            return res.status(400).json({
                mensagem: 'Reative o usuário antes de editá-lo.'
            });
        }

        const [existentes] = await bancoDados.query(
            'SELECT id FROM usuarios WHERE email = ? AND id <> ?',
            [emailLimpo, usuarioId]
        );

        if (existentes.length > 0) {
            return res.status(409).json({
                mensagem: 'Esse e-mail já pertence a outro usuário.'
            });
        }

        if (senha !== undefined && senha !== null && senha !== '') {
            if (typeof senha !== 'string' || senha.length < 8) {
                return res.status(400).json({
                    mensagem: 'A nova senha deve ter pelo menos 8 caracteres.'
                });
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            await bancoDados.query(
                `UPDATE usuarios
                 SET nome = ?, email = ?, senha_hash = ?
                 WHERE id = ?
                 AND perfil IN ('professor', 'responsavel')
                 AND ativo = 1`,
                [nomeLimpo, emailLimpo, senhaHash, usuarioId]
            );
        } else {
            await bancoDados.query(
                `UPDATE usuarios
                 SET nome = ?, email = ?
                 WHERE id = ?
                 AND perfil IN ('professor', 'responsavel')
                 AND ativo = 1`,
                [nomeLimpo, emailLimpo, usuarioId]
            );
        }

        res.json({
            mensagem: 'Usuário atualizado com sucesso!'
        });
    } catch (erro) {
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'Esse e-mail já está cadastrado.'
            });
        }

        console.error('Erro ao editar usuário:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao editar usuário.'
        });
    }
});

// Desativar professor ou responsável
router.delete('/:id', async (req, res) => {
    try {
        const usuarioId = validarId(req.params.id);

        if (!usuarioId) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const [resultado] = await bancoDados.query(
            `UPDATE usuarios
             SET ativo = 0
             WHERE id = ?
             AND perfil IN ('professor', 'responsavel')
             AND ativo = 1`,
            [usuarioId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Professor ou responsável ativo não encontrado.'
            });
        }

        res.json({
            mensagem: 'Usuário desativado com sucesso!'
        });
    } catch (erro) {
        console.error('Erro ao desativar usuário:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao desativar usuário.'
        });
    }
});

// Reativar professor ou responsável
router.patch('/:id/reativar', async (req, res) => {
    try {
        const usuarioId = validarId(req.params.id);

        if (!usuarioId) {
            return res.status(400).json({
                mensagem: 'ID inválido.'
            });
        }

        const [resultado] = await bancoDados.query(
            `UPDATE usuarios
             SET ativo = 1
             WHERE id = ?
             AND perfil IN ('professor', 'responsavel')
             AND ativo = 0`,
            [usuarioId]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Professor ou responsável inativo não encontrado.'
            });
        }

        res.json({
            mensagem: 'Usuário reativado com sucesso!'
        });
    } catch (erro) {
        console.error('Erro ao reativar usuário:', erro.message);

        res.status(500).json({
            mensagem: 'Erro interno ao reativar usuário.'
        });
    }
});

export default router;
