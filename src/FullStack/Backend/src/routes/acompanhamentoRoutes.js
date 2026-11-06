import { criarContexto, falha, id, texto } from './apoioRotas.js';

export function criarAcompanhamentoRoutes(pool) {
    const { router, rota, equipe, todos, acompanhamento } = criarContexto(pool);
    rota('get', '/:id', todos, async (req, db) => ({ dados: await acompanhamento(req, db) }));
    rota('patch', '/:id', ['professor'], async (req, db) => {
        const ac = await acompanhamento(req, db, true);
        const corpo = req.body ?? {};
        if (!Object.keys(corpo).length || Object.keys(corpo).some(k => !['descricao', 'media'].includes(k))) throw falha(400, 'Informe somente descrição e/ou média.');
        const descricao = corpo.descricao === undefined ? ac.descricao : texto(corpo.descricao, 16000);
        const media = corpo.media === undefined ? ac.media : corpo.media;
        if (corpo.media !== undefined && media !== null && (typeof media !== 'number' || !Number.isFinite(media) || media < 0 || media > 10)) throw falha(400, 'A média deve estar entre 0 e 10 ou ser nula.');
        await db.query('UPDATE acompanhamentos SET descricao = ?, media = ? WHERE id = ?', [descricao, media, ac.id]);
    });
    // O professor envia à revisão; apenas o administrador publica.
    rota('patch', '/:id/enviar', ['professor'], async (req, db) => {
        const ac = await acompanhamento(req, db, true);
        await db.query("UPDATE acompanhamentos SET status = 'pendente', publicado_em = NULL WHERE id = ?", [ac.id]);
    });
    return router;
}


import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

router.use(autenticar);

// GET - Listar acompanhamentos
router.get('/', async (req, res) => {
    try {
        if (!['administrador', 'professor'].includes(req.usuario.perfil)) {
            return res.status(403).json({
                mensagem: 'Acesso não autorizado.'
            });
        }

        let sql = `
            SELECT
                ac.id,
                ac.aluno_id,
                a.nome AS aluno,
                ac.professor_id,
                u.nome AS professor,
                ac.disciplina_id,
                d.nome AS disciplina,
                ac.periodo_id,
                p.nome AS periodo,
                ac.descricao,
                ac.media,
                ac.status,
                ac.criado_em,
                ac.atualizado_em,
                ac.publicado_em
            FROM acompanhamentos ac
            INNER JOIN alunos a ON a.id = ac.aluno_id
            INNER JOIN usuarios u ON u.id = ac.professor_id
            INNER JOIN disciplinas d ON d.id = ac.disciplina_id
            INNER JOIN periodos_avaliativos p ON p.id = ac.periodo_id
        `;

        const parametros = [];

        if (req.usuario.perfil === 'professor') {
            sql += ' WHERE ac.professor_id = ?';
            parametros.push(req.usuario.id);
        }

        sql += ' ORDER BY ac.criado_em DESC, ac.id DESC';

        const [acompanhamentos] = await bancoDados.query(sql, parametros);

        res.json(acompanhamentos);
    } catch (erro) {
        console.error('Erro ao listar acompanhamentos:', erro.message);
        res.status(500).json({
            mensagem: 'Erro ao listar acompanhamentos.'
        });
    }
});

// POST - Professor cria acompanhamento
router.post('/', async (req, res) => {
    try {
        if (req.usuario.perfil !== 'professor') {
            return res.status(403).json({
                mensagem: 'Somente professores podem criar acompanhamentos.'
            });
        }

        const {
            aluno_id,
            disciplina_id,
            periodo_id,
            descricao,
            media
        } = req.body ?? {};

        const alunoId = Number(aluno_id);
        const disciplinaId = Number(disciplina_id);
        const periodoId = Number(periodo_id);

        if (
            !Number.isInteger(alunoId) || alunoId <= 0 ||
            !Number.isInteger(disciplinaId) || disciplinaId <= 0 ||
            !Number.isInteger(periodoId) || periodoId <= 0 ||
            typeof descricao !== 'string' ||
            !descricao.trim()
        ) {
            return res.status(400).json({
                mensagem: 'Informe aluno, disciplina, período e descrição válidos.'
            });
        }

        let mediaFinal = null;

        if (media !== undefined && media !== null && media !== '') {
            if (
                typeof media !== 'number' ||
                !Number.isFinite(media) ||
                media < 0 ||
                media > 10
            ) {
                return res.status(400).json({
                    mensagem: 'A média deve estar entre 0 e 10.'
                });
            }

            mediaFinal = media;
        }

        // Verificar se o aluno pertence a uma turma
        // em que o professor leciona a disciplina,
        // no mesmo ano letivo do período.
        const [vinculos] = await bancoDados.query(
            `SELECT ptd.id
             FROM professores_turmas_disciplinas ptd
             INNER JOIN turmas t
                 ON t.id = ptd.turma_id
             INNER JOIN alunos_turmas at
                 ON at.turma_id = t.id
             INNER JOIN alunos a
                 ON a.id = at.aluno_id
             INNER JOIN disciplinas d
                 ON d.id = ptd.disciplina_id
             INNER JOIN periodos_avaliativos p
                 ON p.ano_letivo = t.ano_letivo
             WHERE ptd.professor_id = ?
               AND at.aluno_id = ?
               AND ptd.disciplina_id = ?
               AND p.id = ?
               AND a.ativo = 1
               AND t.ativo = 1
               AND d.ativo = 1
               AND p.ativo = 1
             LIMIT 1`,
            [
                req.usuario.id,
                alunoId,
                disciplinaId,
                periodoId
            ]
        );

        if (vinculos.length === 0) {
            return res.status(403).json({
                mensagem: 'Professor sem vínculo válido com esse aluno, disciplina ou período.'
            });
        }

        const [resultado] = await bancoDados.query(
            `INSERT INTO acompanhamentos
             (aluno_id, professor_id, disciplina_id,
              periodo_id, descricao, media, status)
             VALUES (?, ?, ?, ?, ?, ?, 'rascunho')`,
            [
                alunoId,
                req.usuario.id,
                disciplinaId,
                periodoId,
                descricao.trim(),
                mediaFinal
            ]
        );

        res.status(201).json({
            mensagem: 'Acompanhamento criado com sucesso!',
            acompanhamento: {
                id: resultado.insertId,
                aluno_id: alunoId,
                professor_id: req.usuario.id,
                disciplina_id: disciplinaId,
                periodo_id: periodoId,
                descricao: descricao.trim(),
                media: mediaFinal,
                status: 'rascunho'
            }
        });
    } catch (erro) {
        console.error('Erro ao criar acompanhamento:', erro.message);
        res.status(500).json({
            mensagem: 'Erro interno ao criar acompanhamento.'
        });
    }
});

router.use(criarAcompanhamentoRoutes());

export default router;
