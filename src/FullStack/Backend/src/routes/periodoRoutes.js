import { Router } from 'express';
import { z } from 'zod';
import bancoDados from '../bancoDados.js';
import autenticarComCiencia from '../middlewares/autenticarComCiencia.js';
import { falha } from '../middlewares/erros.js';
import { anoLetivo, dataISO, idPositivo, textoObrigatorio, validar } from '../validacao.js';

const router = Router();
const dadosPeriodo = z.object({
    nome: textoObrigatorio(100), ano_letivo: anoLetivo, data_inicio: dataISO, data_fim: dataISO
}).refine(({ ano_letivo, data_inicio, data_fim }) =>
    data_inicio <= data_fim &&
    data_inicio.startsWith(String(ano_letivo)) &&
    data_fim.startsWith(String(ano_letivo))
);

router.use(autenticarComCiencia);

router.get('/', async (req, res) => {
    const [periodos] = await bancoDados.query(
        `SELECT id, nome, ano_letivo,
                DATE_FORMAT(data_inicio, '%Y-%m-%d') AS data_inicio,
                DATE_FORMAT(data_fim, '%Y-%m-%d') AS data_fim, ativo
         FROM periodos_avaliativos
         ORDER BY ano_letivo DESC, data_inicio`
    );
    res.json(periodos);
});

router.use((req, res, next) => {
    if (req.usuario.perfil !== 'administrador') throw falha(403, 'Acesso permitido apenas para administradores.');
    next();
});

const idDaRota = req => validar(idPositivo, req.params.id, 'Informe um ID de período válido.');
const lerDados = req => validar(dadosPeriodo, req.body, 'Informe nome, ano letivo e datas válidas.');

async function verificarDuplicidade(nome, ano, id = 0) {
    const [existentes] = await bancoDados.query(
        'SELECT id FROM periodos_avaliativos WHERE nome = ? AND ano_letivo = ? AND id <> ? AND ativo = 1',
        [nome, ano, id]
    );
    if (existentes.length) throw falha(409, 'Já existe um período ativo com esse nome nesse ano.');
}

router.post('/', async (req, res) => {
    const periodo = lerDados(req);
    const { nome, ano_letivo, data_inicio, data_fim } = periodo;
    await verificarDuplicidade(nome, ano_letivo);
    const [resultado] = await bancoDados.query(
        'INSERT INTO periodos_avaliativos (nome, ano_letivo, data_inicio, data_fim) VALUES (?, ?, ?, ?)',
        [nome, ano_letivo, data_inicio, data_fim]
    );
    res.status(201).json({ mensagem: 'Período cadastrado com sucesso!', periodo: { id: resultado.insertId, ...periodo } });
});

router.put('/:id', async (req, res) => {
    const id = idDaRota(req);
    const { nome, ano_letivo, data_inicio, data_fim } = lerDados(req);
    await verificarDuplicidade(nome, ano_letivo, id);
    const [resultado] = await bancoDados.query(
        `UPDATE periodos_avaliativos p SET nome = ?, ano_letivo = ?, data_inicio = ?, data_fim = ?
         WHERE id = ? AND ativo = 1 AND (ano_letivo = ? OR NOT EXISTS (
            SELECT 1 FROM acompanhamentos a WHERE a.periodo_id = p.id))`,
        [nome, ano_letivo, data_inicio, data_fim, id, ano_letivo]
    );
    if (!resultado.affectedRows) {
        const [linhas] = await bancoDados.query('SELECT id FROM periodos_avaliativos WHERE id = ? AND ativo = 1', [id]);
        if (!linhas.length) throw falha(404, 'Período ativo não encontrado.');
        throw falha(409, 'O ano de um período com acompanhamentos não pode ser alterado.');
    }
    res.json({ mensagem: 'Período atualizado com sucesso!' });
});

router.delete('/:id', async (req, res) => {
    const [resultado] = await bancoDados.query(
        'UPDATE periodos_avaliativos SET ativo = 0 WHERE id = ? AND ativo = 1', [idDaRota(req)]
    );
    if (!resultado.affectedRows) throw falha(404, 'Período ativo não encontrado.');
    res.json({ mensagem: 'Período desativado. O histórico foi preservado.' });
});

export default router;
