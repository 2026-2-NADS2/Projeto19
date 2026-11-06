
import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

router.use(autenticar);

// GET - Consultar períodos avaliativos
router.get('/', async (req, res) => {
    try {
        const [periodos] = await bancoDados.query(
            `SELECT id, nome, ano_letivo, data_inicio,
                    data_fim, ativo
             FROM periodos_avaliativos
             ORDER BY ano_letivo DESC, data_inicio`
        );

        res.json(periodos);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao listar períodos.'
        });
    }
});

// POST - Administrador cadastra período
router.post('/', async (req, res) => {
    try {
        if (req.usuario.perfil !== 'administrador') {
            return res.status(403).json({
                mensagem: 'Acesso permitido apenas para administradores.'
            });
        }

        const { nome, ano_letivo, data_inicio, data_fim } = req.body ?? {};

        function dataValida(data) {
            return typeof data === 'string' &&
                /^\d{4}-\d{2}-\d{2}$/.test(data) &&
                !Number.isNaN(Date.parse(data)) &&
                new Date(data).toISOString().slice(0, 10) === data;
        }

        if (
            typeof nome !== 'string' ||
            !nome.trim() ||
            !Number.isInteger(ano_letivo) ||
            ano_letivo < 1901 ||
            ano_letivo > 2155 ||
            !dataValida(data_inicio) ||
            !dataValida(data_fim) ||
            data_fim < data_inicio ||
            !data_inicio.startsWith(String(ano_letivo)) ||
            !data_fim.startsWith(String(ano_letivo))
        ) {
            return res.status(400).json({
                mensagem: 'Informe nome, ano letivo e datas válidas.'
            });
        }

        const [resultado] = await bancoDados.query(
            `INSERT INTO periodos_avaliativos
             (nome, ano_letivo, data_inicio, data_fim)
             VALUES (?, ?, ?, ?)`,
            [nome.trim(), ano_letivo, data_inicio, data_fim]
        );

        res.status(201).json({
            mensagem: 'Período cadastrado com sucesso!',
            periodo: {
                id: resultado.insertId,
                nome: nome.trim(),
                ano_letivo,
                data_inicio,
                data_fim
            }
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            mensagem: 'Erro ao cadastrar período.'
        });
    }
});

export default router;
