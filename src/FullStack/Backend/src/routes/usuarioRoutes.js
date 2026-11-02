
import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

// Todas as rotas deste arquivo exigem autenticação
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

// Listar usuários cadastrados
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await bancoDados.query(
            `SELECT id, nome, email, perfil, ativo, criado_em
             FROM usuarios
             ORDER BY id`
        );

        res.json(usuarios);
    } catch (erro) {
        console.error('Erro ao buscar usuários:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao buscar usuários.'
        });
    }
});

export default router;
