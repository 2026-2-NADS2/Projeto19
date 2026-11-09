
import { Router } from 'express';
import bancoDados from '../bancoDados.js';
import autenticar from '../middlewares/autenticar.js';

const router = Router();

// Todas as rotas precisam de login
router.use(autenticar);

// Verifica se o ID é válido
function idValido(valor) {
    const id = Number(valor);
    return Number.isSafeInteger(id) && id > 0;
}

// Verifica se o usuário é responsável
function apenasResponsavel(req, res) {
    if (req.usuario.perfil !== 'responsavel') {
        res.status(403).json({
            mensagem: 'Acesso permitido apenas para responsáveis.'
        });
        return false;
    }
    return true;
}

// Busca os alunos vinculados ao responsável
router.get('/responsavel/alunos', async (req, res) => {
    if (!apenasResponsavel(req, res)) return;

    try {
        const [alunos] = await bancoDados.query(
            `SELECT a.id, a.nome, a.matricula,
                (
                    SELECT t.nome
                    FROM alunos_turmas at
                    JOIN turmas t ON t.id = at.turma_id
                    WHERE at.aluno_id = a.id AND t.ativo = 1
                    ORDER BY t.ano_letivo DESC, t.id DESC
                    LIMIT 1
                ) AS turma,
                (
                    SELECT t.ano_letivo
                    FROM alunos_turmas at
                    JOIN turmas t ON t.id = at.turma_id
                    WHERE at.aluno_id = a.id AND t.ativo = 1
                    ORDER BY t.ano_letivo DESC, t.id DESC
                    LIMIT 1
                ) AS ano_letivo
             FROM responsaveis_alunos ra
             JOIN alunos a ON a.id = ra.aluno_id
             WHERE ra.responsavel_id = ? AND a.ativo = 1
             ORDER BY a.nome, a.id`,
            [req.usuario.id]
        );

        return res.json(alunos);
    } catch (erro) {
        console.error('Erro ao buscar alunos:', erro);
        return res.status(500).json({
            mensagem: 'Erro ao carregar alunos vinculados.'
        });
    }
});

// Busca os relatórios publicados dos filhos
router.get('/responsavel/publicados', async (req, res) => {
    if (!apenasResponsavel(req, res)) return;

    try {
        const [dados] = await bancoDados.query(
            `SELECT
                ac.id, ac.aluno_id, a.nome AS aluno,
                ac.professor_id, u.nome AS professor,
                ac.disciplina_id, d.nome AS disciplina,
                ac.periodo_id, p.nome AS periodo,
                p.ano_letivo, ac.descricao, ac.media,
                ac.status, ac.criado_em,
                ac.atualizado_em, ac.publicado_em,
                (
                    SELECT t.nome
                    FROM alunos_turmas at
                    JOIN turmas t ON t.id = at.turma_id
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
             WHERE ac.status = 'publicado'
               AND EXISTS (
                   SELECT 1 FROM responsaveis_alunos ra
                   WHERE ra.responsavel_id = ?
                     AND ra.aluno_id = ac.aluno_id
               )
             ORDER BY p.ano_letivo DESC,
                      ac.publicado_em DESC, ac.id DESC`,
            [req.usuario.id]
        );

        return res.json(dados);
    } catch (erro) {
        console.error('Erro ao buscar relatórios:', erro);
        return res.status(500).json({
            mensagem: 'Erro ao carregar acompanhamentos publicados.'
        });
    }
});

// Lista os registros familiares para o administrador
router.get('/admin/logs-familia', async (req, res) => {
    if (req.usuario.perfil !== 'administrador') {
        return res.status(403).json({
            mensagem: 'Acesso permitido apenas para administradores.'
        });
    }

    try {
        const [logs] = await bancoDados.query(
            `SELECT
                l.id, l.acompanhamento_id, l.usuario_id,
                u.nome AS responsavel,
                a.id AS aluno_id, a.nome AS aluno,
                d.nome AS disciplina,
                p.nome AS periodo, p.ano_letivo,
                l.acao, l.descricao, l.criado_em
             FROM logs_acompanhamentos l
             JOIN usuarios u ON u.id = l.usuario_id
             JOIN acompanhamentos ac
                ON ac.id = l.acompanhamento_id
             JOIN alunos a ON a.id = ac.aluno_id
             JOIN disciplinas d ON d.id = ac.disciplina_id
             JOIN periodos_avaliativos p ON p.id = ac.periodo_id
             ORDER BY l.criado_em DESC, l.id DESC`
        );

        return res.json(logs);
    } catch (erro) {
        console.error('Erro ao listar registros familiares:', erro);
        return res.status(500).json({
            mensagem: 'Erro ao consultar registros familiares.'
        });
    }
});

// Busca um acompanhamento e verifica quem pode acessá-lo
async function buscarRegistro(req, res) {
    const id = Number(req.params.id);

    if (!idValido(id)) {
        res.status(400).json({ mensagem: 'ID inválido.' });
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
            `SELECT id FROM responsaveis_alunos
             WHERE responsavel_id = ? AND aluno_id = ?`,
            [req.usuario.id, registro.aluno_id]
        );

        if (registro.status !== 'publicado' || !vinculos.length) {
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

// Confirma a ciência do responsável uma única vez
router.post('/:id/ciencia', async (req, res) => {
    if (!apenasResponsavel(req, res)) return;

    let conexao;

    try {
        const registro = await buscarRegistro(req, res);
        if (!registro) return;

        conexao = await bancoDados.getConnection();
        await conexao.beginTransaction();

        // Impede confirmações duplicadas
        const [resultado] = await conexao.query(
            `INSERT IGNORE INTO ciencias_acompanhamentos
                (acompanhamento_id, responsavel_id)
             VALUES (?, ?)`,
            [registro.id, req.usuario.id]
        );

        // Registra a confirmação no histórico
        if (resultado.affectedRows === 1) {
            await conexao.query(
                `INSERT INTO logs_acompanhamentos
                    (acompanhamento_id, usuario_id, acao, descricao)
                 VALUES (?, ?, 'ciencia', NULL)`,
                [registro.id, req.usuario.id]
            );
        }

        const [ciencias] = await conexao.query(
            `SELECT confirmado_em
             FROM ciencias_acompanhamentos
             WHERE acompanhamento_id = ?
               AND responsavel_id = ?`,
            [registro.id, req.usuario.id]
        );

        await conexao.commit();

        return res.json({
            mensagem: resultado.affectedRows === 1
                ? 'Ciência confirmada com sucesso.'
                : 'Ciência já confirmada anteriormente.',
            confirmado: true,
            confirmado_em: ciencias[0].confirmado_em
        });
    } catch (erro) {
        if (conexao) await conexao.rollback();
        console.error('Erro ao confirmar ciência:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao confirmar ciência.'
        });
    } finally {
        if (conexao) conexao.release();
    }
});

// Salva uma observação escrita pelo responsável
router.post('/:id/observacoes', async (req, res) => {
    if (!apenasResponsavel(req, res)) return;

    const { descricao } = req.body ?? {};

    if (
        typeof descricao !== 'string' ||
        !descricao.trim() ||
        descricao.trim().length > 5000
    ) {
        return res.status(400).json({
            mensagem: 'A observação deve ter entre 1 e 5000 caracteres.'
        });
    }

    try {
        const registro = await buscarRegistro(req, res);
        if (!registro) return;

        // Cada observação vira um registro no histórico
        const [resultado] = await bancoDados.query(
            `INSERT INTO logs_acompanhamentos
                (acompanhamento_id, usuario_id, acao, descricao)
             VALUES (?, ?, 'observacao', ?)`,
            [registro.id, req.usuario.id, descricao.trim()]
        );

        return res.status(201).json({
            mensagem: 'Observação registrada com sucesso.',
            id: resultado.insertId
        });
    } catch (erro) {
        console.error('Erro ao salvar observação:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao registrar observação.'
        });
    }
});

// Consulta o histórico familiar de um acompanhamento
router.get('/:id/familia', async (req, res) => {
    try {
        const registro = await buscarRegistro(req, res);
        if (!registro) return;

        const [logs] = await bancoDados.query(
            `SELECT
                l.id, l.usuario_id,
                u.nome AS responsavel,
                l.acao, l.descricao, l.criado_em
             FROM logs_acompanhamentos l
             JOIN usuarios u ON u.id = l.usuario_id
             WHERE l.acompanhamento_id = ?
             ORDER BY l.criado_em DESC, l.id DESC`,
            [registro.id]
        );

        const [ciencias] = await bancoDados.query(
            `SELECT
                c.responsavel_id,
                u.nome AS responsavel,
                c.confirmado_em
             FROM ciencias_acompanhamentos c
             JOIN usuarios u ON u.id = c.responsavel_id
             WHERE c.acompanhamento_id = ?
             ORDER BY c.confirmado_em DESC`,
            [registro.id]
        );

        // O responsável vê somente os próprios registros
        if (req.usuario.perfil === 'responsavel') {
            return res.json({
                logs: logs.filter(
                    item => Number(item.usuario_id) === Number(req.usuario.id)
                ),
                ciencias: ciencias.filter(
                    item => Number(item.responsavel_id) === Number(req.usuario.id)
                )
            });
        }

        return res.json({ logs, ciencias });
    } catch (erro) {
        console.error('Erro ao consultar histórico familiar:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao consultar histórico familiar.'
        });
    }
});

// Busca os alunos, disciplinas e períodos do professor
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

        return res.json({ vinculos, periodos });
    } catch (erro) {
        console.error('Erro ao carregar opções:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao carregar dados do professor.'
        });
    }
});

// Lista os acompanhamentos do professor ou administrador
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

        if (filtro) parametros.push(req.usuario.id);

        const [dados] = await bancoDados.query(
            `SELECT
                ac.id, ac.aluno_id, a.nome AS aluno,
                ac.professor_id, u.nome AS professor,
                ac.disciplina_id, d.nome AS disciplina,
                ac.periodo_id, p.nome AS periodo,
                ac.descricao, ac.media, ac.status,
                ac.criado_em, ac.atualizado_em, ac.publicado_em,
                (
                    SELECT t.nome
                    FROM alunos_turmas at
                    JOIN turmas t ON t.id = at.turma_id
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

        return res.json(dados);
    } catch (erro) {
        console.error('Erro ao listar acompanhamentos:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao listar acompanhamentos.'
        });
    }
});

// Cria um acompanhamento como rascunho
router.post('/', async (req, res) => {
    if (req.usuario.perfil !== 'professor') {
        return res.status(403).json({
            mensagem: 'Somente professores podem criar acompanhamentos.'
        });
    }

    try {
        const {
            aluno_id, disciplina_id, periodo_id,
            descricao, media
        } = req.body ?? {};

        const ids = [aluno_id, disciplina_id, periodo_id].map(Number);

        if (
            ids.some(valor => !Number.isSafeInteger(valor) || valor <= 0) ||
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

        // Confere o vínculo do professor com o aluno
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
                    aluno_id, professor_id, disciplina_id,
                    periodo_id, descricao, media, status
                )
             VALUES (?, ?, ?, ?, ?, ?, 'rascunho')`,
            [
                ids[0], req.usuario.id, ids[1], ids[2],
                descricao.trim(), media ?? null
            ]
        );

        return res.status(201).json({
            mensagem: 'Acompanhamento criado.',
            acompanhamento: { id: resultado.insertId }
        });
    } catch (erro) {
        console.error('Erro ao criar acompanhamento:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao criar acompanhamento.'
        });
    }
});

// Busca um acompanhamento pelo ID
router.get('/:id', async (req, res) => {
    try {
        const registro = await buscarRegistro(req, res);
        if (registro) return res.json(registro);
    } catch (erro) {
        console.error('Erro ao buscar acompanhamento:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao buscar acompanhamento.'
        });
    }
});

// Edita acompanhamentos em rascunho ou devolvidos
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
                chave => !['descricao', 'media'].includes(chave)
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
            [descricao.trim(), media, registro.id]
        );

        return res.json({
            mensagem: 'Acompanhamento atualizado.'
        });
    } catch (erro) {
        console.error('Erro ao atualizar acompanhamento:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao atualizar acompanhamento.'
        });
    }
});

// Envia um acompanhamento para revisão
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
             SET status = 'pendente', publicado_em = NULL
             WHERE id = ?`,
            [registro.id]
        );

        return res.json({
            mensagem: 'Acompanhamento enviado para revisão.'
        });
    } catch (erro) {
        console.error('Erro ao enviar acompanhamento:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao enviar acompanhamento.'
        });
    }
});

// Administrador aprova ou devolve um acompanhamento
router.post('/:id/revisoes', async (req, res) => {
    if (req.usuario.perfil !== 'administrador') {
        return res.status(403).json({
            mensagem: 'Somente administradores podem revisar acompanhamentos.'
        });
    }

    const id = Number(req.params.id);
    const { acao, observacao } = req.body ?? {};

    if (!idValido(id)) {
        return res.status(400).json({
            mensagem: 'ID do acompanhamento inválido.'
        });
    }

    if (!['aprovado', 'devolvido'].includes(acao)) {
        return res.status(400).json({
            mensagem: 'A ação deve ser aprovado ou devolvido.'
        });
    }

    if (
        observacao !== undefined &&
        observacao !== null &&
        typeof observacao !== 'string'
    ) {
        return res.status(400).json({
            mensagem: 'A observação deve ser um texto.'
        });
    }

    const motivo = (observacao || '').trim();

    if (acao === 'devolvido' && !motivo) {
        return res.status(400).json({
            mensagem: 'Informe o motivo da devolução.'
        });
    }

    if (motivo.length > 5000) {
        return res.status(400).json({
            mensagem: 'A observação deve ter no máximo 5000 caracteres.'
        });
    }

    let conexao;

    try {
        conexao = await bancoDados.getConnection();
        await conexao.beginTransaction();

        // Bloqueia o registro durante a revisão
        const [registros] = await conexao.query(
            `SELECT id, status
             FROM acompanhamentos
             WHERE id = ?
             FOR UPDATE`,
            [id]
        );

        if (!registros.length) {
            await conexao.rollback();
            return res.status(404).json({
                mensagem: 'Acompanhamento não encontrado.'
            });
        }

        if (registros[0].status !== 'pendente') {
            await conexao.rollback();
            return res.status(409).json({
                mensagem: 'Somente acompanhamentos pendentes podem ser revisados.'
            });
        }

        // Salva a decisão do administrador
        await conexao.query(
            `INSERT INTO revisoes_acompanhamentos
                (
                    acompanhamento_id, administrador_id,
                    acao, observacao
                )
             VALUES (?, ?, ?, ?)`,
            [id, req.usuario.id, acao, motivo || null]
        );

        const novoStatus = acao === 'aprovado'
            ? 'publicado'
            : 'devolvido';

        // Atualiza o status do acompanhamento
        await conexao.query(
            `UPDATE acompanhamentos
             SET status = ?,
                 publicado_em = CASE
                     WHEN ? = 'publicado' THEN NOW()
                     ELSE NULL
                 END
             WHERE id = ?`,
            [novoStatus, novoStatus, id]
        );

        await conexao.commit();

        return res.json({
            mensagem: acao === 'aprovado'
                ? 'Acompanhamento publicado com sucesso.'
                : 'Acompanhamento devolvido ao professor.',
            acompanhamento_id: id,
            status: novoStatus,
            observacao: motivo || null
        });
    } catch (erro) {
        if (conexao) await conexao.rollback();
        console.error('Erro ao revisar acompanhamento:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao revisar acompanhamento.'
        });
    } finally {
        if (conexao) conexao.release();
    }
});

// Mostra o histórico de revisões
router.get('/:id/revisoes', async (req, res) => {
    try {
        const registro = await buscarRegistro(req, res);
        if (!registro) return;

        if (req.usuario.perfil === 'responsavel') {
            return res.status(403).json({
                mensagem: 'Acesso não autorizado às revisões.'
            });
        }

        const [revisoes] = await bancoDados.query(
            `SELECT
                r.id, r.acompanhamento_id,
                r.acao, r.observacao, r.criado_em,
                u.nome AS administrador
             FROM revisoes_acompanhamentos r
             JOIN usuarios u ON u.id = r.administrador_id
             WHERE r.acompanhamento_id = ?
             ORDER BY r.criado_em DESC, r.id DESC`,
            [registro.id]
        );

        return res.json(revisoes);
    } catch (erro) {
        console.error('Erro ao consultar revisões:', erro);

        return res.status(500).json({
            mensagem: 'Erro ao consultar revisões.'
        });
    }
});

export default router;
