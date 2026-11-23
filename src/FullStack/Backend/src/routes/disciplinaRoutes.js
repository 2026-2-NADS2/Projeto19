import { Router } from 'express';
import { z } from 'zod';
import bancoDados from '../bancoDados.js';
import autenticarComCiencia from '../middlewares/autenticarComCiencia.js';
import { falha } from '../middlewares/erros.js';
import { idPositivo, textoObrigatorio, validar } from '../validacao.js';

const nome = textoObrigatorio(100);
const dadosArea = z.object({ nome });
const dadosDisciplina = z.object({ nome, area_id: idPositivo.nullish() });
const consultaDisciplinas = `SELECT d.id, d.nome, d.ativo, d.area_id, a.nome AS area
    FROM disciplinas d LEFT JOIN areas_conhecimento a ON a.id = d.area_id`;

export default function criarRotasDisciplinas(pool = bancoDados) {
    const router = Router();
    const idDaRota = req => validar(idPositivo, req.params.id, 'Informe um ID válido.');
    router.use(autenticarComCiencia, (req, res, next) => {
        if (req.usuario.perfil !== 'administrador') {
            throw falha(403, 'Acesso permitido apenas para administradores.');
        }
        next();
    });

    router.get('/areas', async (req, res) => {
        const [areas] = await pool.query('SELECT id, nome FROM areas_conhecimento ORDER BY nome');
        res.json(areas);
    });

    router.post('/areas', async (req, res) => {
        const { nome } = validar(dadosArea, req.body, 'Informe um nome de área de até 100 caracteres.');
        const [resultado] = await pool.query('INSERT INTO areas_conhecimento (nome) VALUES (?)', [nome]);
        res.status(201).json({ mensagem: 'Área cadastrada.', id: resultado.insertId });
    });

    router.put('/areas/:id', async (req, res) => {
        const id = idDaRota(req);
        const { nome } = validar(dadosArea, req.body, 'Informe um nome de área de até 100 caracteres.');
        const [resultado] = await pool.query('UPDATE areas_conhecimento SET nome = ? WHERE id = ?', [nome, id]);
        if (!resultado.affectedRows) throw falha(404, 'Área não encontrada.');
        res.json({ mensagem: 'Área atualizada.' });
    });

    router.delete('/areas/:id', async (req, res) => {
        try {
            const [resultado] = await pool.query('DELETE FROM areas_conhecimento WHERE id = ?', [idDaRota(req)]);
            if (!resultado.affectedRows) throw falha(404, 'Área não encontrada.');
            res.json({ mensagem: 'Área excluída.' });
        } catch (erro) {
            if ([1217, 1451].includes(erro.errno)) throw falha(409, 'Reatribua as disciplinas da área antes de excluí-la.');
            throw erro;
        }
    });

    router.get('/', async (req, res) => {
        const [disciplinas] = await pool.query(consultaDisciplinas + ' ORDER BY d.nome');
        res.json(disciplinas);
    });

    router.get('/:id', async (req, res) => {
        const [disciplinas] = await pool.query(consultaDisciplinas + ' WHERE d.id = ?', [idDaRota(req)]);
        if (!disciplinas.length) throw falha(404, 'Disciplina não encontrada.');
        res.json(disciplinas[0]);
    });

    router.post('/', salvarDisciplina);
    router.put('/:id', salvarDisciplina);

    async function salvarDisciplina(req, res) {
        const { nome, area_id } = validar(dadosDisciplina, req.body, 'Informe um nome de disciplina e uma área válidos.');
        try {
            if (req.method === 'POST') {
                const [resultado] = await pool.query('INSERT INTO disciplinas (nome, area_id) VALUES (?, ?)', [nome, area_id ?? null]);
                const [disciplinas] = await pool.query(consultaDisciplinas + ' WHERE d.id = ?', [resultado.insertId]);
                return res.status(201).json({ mensagem: 'Disciplina cadastrada com sucesso!', disciplina: disciplinas[0] });
            }
            const id = idDaRota(req);
            const [resultado] = area_id === undefined
                ? await pool.query('UPDATE disciplinas SET nome = ? WHERE id = ?', [nome, id])
                : await pool.query('UPDATE disciplinas SET nome = ?, area_id = ? WHERE id = ?', [nome, area_id, id]);
            if (!resultado.affectedRows) throw falha(404, 'Disciplina não encontrada.');
            res.json({ mensagem: 'Disciplina atualizada.' });
        } catch (erro) {
            if (erro.code === 'ER_DUP_ENTRY') throw falha(409, 'Essa disciplina já está cadastrada.');
            if ([1216, 1452].includes(erro.errno)) throw falha(400, 'Selecione uma área cadastrada.');
            throw erro;
        }
    }

    router.delete('/:id', async (req, res) => {
        try {
            const [resultado] = await pool.query('DELETE FROM disciplinas WHERE id = ?', [idDaRota(req)]);
            if (!resultado.affectedRows) throw falha(404, 'Disciplina não encontrada.');
            res.json({ mensagem: 'Disciplina excluída.' });
        } catch (erro) {
            if ([1217, 1451].includes(erro.errno)) {
                throw falha(409, 'A disciplina tem vínculos ou acompanhamentos e não pode ser excluída.');
            }
            throw erro;
        }
    });
    return router;
}
