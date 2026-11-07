
import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

router.use(autenticar);

// Opções disponíveis para o professor.
router.get('/opcoes', async (req, res) => {
    if (req.usuario.perfil !== 'professor') {
        return res.status(403).json({
            mensagem: 'Acesso permitido apenas para professores.'
        });
    }

    try {
        const [vinculos] = await bancoDados.query(
            `SELECT DISTINCT
                a.id AS aluno_id,
                a.nome AS aluno,
                t.id AS turma_id,
                t.nome AS turma,
                t.ano_letivo,
                d.id AS disciplina_id,
                d.nome AS disciplina
             FROM professores_turmas_disciplinas ptd
             JOIN turmas t
                ON t.id = ptd.turma_id AND t.ativo = 1
             JOIN alunos_turmas at
                ON at.turma_id = t.id
             JOIN alunos a
                ON a.id = at.aluno_id AND a.ativo = 1
             JOIN disciplinas d
                ON d.id = ptd.disciplina_id AND d.ativo = 1
             WHERE ptd.professor_id = ?
             ORDER BY a.nome, d.nome`,
            [req.usuario.id]
        );

        const [periodos] = await bancoDados.query(
            `SELECT id, nome, ano_letivo
             FROM periodos_avaliativos
             WHERE ativo = 1
             ORDER BY ano_letivo DESC, data_inicio`
        );

        res.json({ vinculos, periodos });
    } catch (erro) {
        console.error('Erro ao carregar opções:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao carregar dados do professor.'
        });
    }
});

// Listar acompanhamentos.
router.get('/', async (req, res) => {
    if (!['administrador', 'professor'].includes(req.usuario.perfil)) {
        return res.status(403).json({
            mensagem: 'Acesso não autorizado.'
        });
    }

    try {
        const parametros = [];

        const filtro = req.usuario.perfil === 'professor'
            ? 'WHERE ac.professor_id = ?'
            : '';

        if (filtro) {
            parametros.push(req.usuario.id);
        }

        const [dados] = await bancoDados.query(
            `SELECT
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
                ac.publicado_em,
                (
                    SELECT t.nome
                    FROM alunos_turmas at
                    JOIN turmas t
                        ON t.id = at.turma_id
                    JOIN professores_turmas_disciplinas ptd
                        ON ptd.turma_id = t.id
                    WHERE at.aluno_id = ac.aluno_id
                      AND ptd.professor_id = ac.professor_id
                      AND ptd.disciplina_id = ac.disciplina_id
                      AND t.ano_letivo = p.ano_letivo
                    LIMIT 1
                ) AS turma
             FROM acompanhamentos ac
             JOIN alunos a ON a.id = ac.aluno_id
             JOIN usuarios u ON u.id = ac.professor_id
             JOIN disciplinas d ON d.id = ac.disciplina_id
             JOIN periodos_avaliativos p ON p.id = ac.periodo_id
             ${filtro}
             ORDER BY ac.criado_em DESC, ac.id DESC`,
            parametros
        );

        res.json(dados);
    } catch (erro) {
        console.error(
            'Erro ao listar acompanhamentos:',
            erro.message
        );

        res.status(500).json({
            mensagem: 'Erro ao listar acompanhamentos.'
        });
    }
});

// Criar acompanhamento.
router.post('/', async (req, res) => {
    if (req.usuario.perfil !== 'professor') {
        return res.status(403).json({
            mensagem: 'Somente professores podem criar acompanhamentos.'
        });
    }

    try {
        const {
            aluno_id,
            disciplina_id,
            periodo_id,
            descricao,
            media
        } = req.body ?? {};

        const ids = [
            aluno_id,
            disciplina_id,
            periodo_id
        ].map(Number);

        if (
            ids.some(valor =>
                !Number.isSafeInteger(valor) || valor <= 0
            ) ||
            typeof descricao !== 'string' ||
            !descricao.trim() ||
            descricao.trim().length > 16000
        ) {
            return res.status(400).json({
                mensagem: 'Informe aluno, disciplina, período e descrição válidos.'
            });
        }

        if (
            media !== null &&
            media !== undefined &&
            (
                typeof media !== 'number' ||
                !Number.isFinite(media) ||
                media < 0 ||
                media > 10
            )
        ) {
            return res.status(400).json({
                mensagem: 'A média deve estar entre 0 e 10.'
            });
        }

        // Verifica se o professor pode acompanhar esse aluno.
        const [vinculos] = await bancoDados.query(
            `SELECT ptd.id
             FROM professores_turmas_disciplinas ptd
             JOIN turmas t
                ON t.id = ptd.turma_id AND t.ativo = 1
             JOIN alunos_turmas at
                ON at.turma_id = t.id
             JOIN alunos a
                ON a.id = at.aluno_id AND a.ativo = 1
             JOIN disciplinas d
                ON d.id = ptd.disciplina_id AND d.ativo = 1
             JOIN periodos_avaliativos p
                ON p.ano_letivo = t.ano_letivo AND p.ativo = 1
             WHERE ptd.professor_id = ?
               AND at.aluno_id = ?
               AND ptd.disciplina_id = ?
               AND p.id = ?
             LIMIT 1`,
            [req.usuario.id, ...ids]
        );

        if (!vinculos.length) {
            return res.status(403).json({
                mensagem: 'Professor sem vínculo válido com aluno, disciplina e período.'
            });
        }

        const [resultado] = await bancoDados.query(
            `INSERT INTO acompanhamentos
                (
                    aluno_id,
                    professor_id,
                    disciplina_id,
                    periodo_id,
                    descricao,
                    media,
                    status
                )
             VALUES (?, ?, ?, ?, ?, ?, 'rascunho')`,
            [
                ids[0],
                req.usuario.id,
                ids[1],
                ids[2],
                descricao.trim(),
                media ?? null
            ]
        );

        res.status(201).json({
            mensagem: 'Acompanhamento criado.',
            acompanhamento: {
                id: resultado.insertId
            }
        });
    } catch (erro) {
        console.error(
            'Erro ao criar acompanhamento:',
            erro.message
        );

        res.status(500).json({
            mensagem: 'Erro ao criar acompanhamento.'
        });
    }
});

// Busca um registro e verifica as permissões.
async function buscarRegistro(req, res) {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({
            mensagem: 'ID inválido.'
        });

        return null;
    }

    const [linhas] = await bancoDados.query(
        'SELECT * FROM acompanhamentos WHERE id = ?',
        [id]
    );

    const registro = linhas[0];

    if (!registro) {
        res.status(404).json({
            mensagem: 'Acompanhamento não encontrado.'
        });

        return null;
    }

    if (req.usuario.perfil === 'responsavel') {
        const [vinculos] = await bancoDados.query(
            `SELECT id
             FROM responsaveis_alunos
             WHERE responsavel_id = ?
               AND aluno_id = ?`,
            [req.usuario.id, registro.aluno_id]
        );

        if (
            registro.status !== 'publicado' ||
            !vinculos.length
        ) {
            res.status(403).json({
                mensagem: 'Acompanhamento não disponível.'
            });

            return null;
        }
    } else if (
        req.usuario.perfil !== 'administrador' &&
        (
            req.usuario.perfil !== 'professor' ||
            Number(registro.professor_id) !== Number(req.usuario.id)
        )
    ) {
        res.status(403).json({
            mensagem: 'Acesso não autorizado.'
        });

        return null;
    }

    return registro;
}

// Buscar acompanhamento por ID.
router.get('/:id', async (req, res) => {
    try {
        const registro = await buscarRegistro(req, res);

        if (registro) {
            res.json(registro);
        }
    } catch (erro) {
        console.error(erro.message);

        res.status(500).json({
            mensagem: 'Erro ao buscar acompanhamento.'
        });
    }
});

// Editar acompanhamento.
router.patch('/:id', async (req, res) => {
    if (req.usuario.perfil !== 'professor') {
        return res.status(403).json({
            mensagem: 'Somente professores podem editar.'
        });
    }

    try {
        const registro = await buscarRegistro(req, res);

        if (!registro) return;

        if (!['rascunho', 'devolvido'].includes(registro.status)) {
            return res.status(409).json({
                mensagem: 'Registro não pode mais ser editado.'
            });
        }

        const corpo = req.body ?? {};

        if (
            !Object.keys(corpo).length ||
            Object.keys(corpo).some(
                k => !['descricao', 'media'].includes(k)
            )
        ) {
            return res.status(400).json({
                mensagem: 'Informe somente descrição e/ou média.'
            });
        }

        const descricao = corpo.descricao === undefined
            ? registro.descricao
            : corpo.descricao;

        const media = corpo.media === undefined
            ? registro.media
            : corpo.media;

        if (
            typeof descricao !== 'string' ||
            !descricao.trim() ||
            descricao.trim().length > 16000 ||
            (
                media !== null &&
                (
                    typeof media !== 'number' ||
                    !Number.isFinite(media) ||
                    media < 0 ||
                    media > 10
                )
            )
        ) {
            return res.status(400).json({
                mensagem: 'Descrição ou média inválida.'
            });
        }

        await bancoDados.query(
            `UPDATE acompanhamentos
             SET descricao = ?, media = ?
             WHERE id = ?`,
            [
                descricao.trim(),
                media,
                registro.id
            ]
        );

        res.json({
            mensagem: 'Acompanhamento atualizado.'
        });
    } catch (erro) {
        console.error(erro.message);

        res.status(500).json({
            mensagem: 'Erro ao atualizar acompanhamento.'
        });
    }
});

// Enviar acompanhamento para revisão.
router.patch('/:id/enviar', async (req, res) => {
    if (req.usuario.perfil !== 'professor') {
        return res.status(403).json({
            mensagem: 'Somente professores podem enviar.'
        });
    }

    try {
        const registro = await buscarRegistro(req, res);

        if (!registro) return;

        if (!['rascunho', 'devolvido'].includes(registro.status)) {
            return res.status(409).json({
                mensagem: 'Registro não pode ser enviado.'
            });
        }

        await bancoDados.query(
            `UPDATE acompanhamentos
             SET status = 'pendente',
                 publicado_em = NULL
             WHERE id = ?`,
            [registro.id]
        );

        res.json({
            mensagem: 'Acompanhamento enviado para revisão.'
        });
    } catch (erro) {
        console.error(erro.message);

        res.status(500).json({
            mensagem: 'Erro ao enviar acompanhamento.'
        });
    }
});

export default router;
