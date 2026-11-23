import { z } from 'zod';
import { anoLetivo, dataISO, textoObrigatorio } from '../validacao.js';

import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticarComCiencia from '../middlewares/autenticarComCiencia.js';

const router = Router();
const dadosPeriodo = z.object({
    nome: textoObrigatorio(100), ano_letivo: anoLetivo, data_inicio: dataISO, data_fim: dataISO
});

router.use(autenticarComCiencia);

// GET - Consultar períodos avaliativos
router.get('/', async (req, res) => {
    const [periodos] = await bancoDados.query(
        `SELECT id, nome, ano_letivo, data_inicio,
                data_fim, ativo
         FROM periodos_avaliativos
         ORDER BY ano_letivo DESC, data_inicio`
    );

    res.json(periodos);
});

// POST - Administrador cadastra período
router.post('/', async (req, res) => {
    if (req.usuario.perfil !== 'administrador') {
        return res.status(403).json({
            mensagem: 'Acesso permitido apenas para administradores.'
        });
    }

    const { nome, ano_letivo, data_inicio, data_fim } = req.body ?? {};

    if (
        !dadosPeriodo.safeParse({ nome, ano_letivo, data_inicio, data_fim }).success ||
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
});

export default router;
