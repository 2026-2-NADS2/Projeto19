import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import mysql from 'mysql2/promise';

const ano = 2026;
const disciplinas = ['Língua Portuguesa', 'Matemática', 'História', 'Geografia',
    'Biologia', 'Física', 'Química', 'Língua Inglesa'];
const tags = ['Participação', 'Evolução', 'Dificuldade', 'Comportamento'];
const turmas = [
    ['1º ano A', ['Marina Alves', 'Pedro Nogueira', 'Lara Monteiro', 'Caio Ribeiro']],
    ['2º ano A', ['Gustavo Cocoloti', 'Gabriel Vaz', 'Helena Duarte', 'Rafael Lima']],
    ['3º ano A', ['Sofia Mendes', 'Lucas Barreto', 'Isabela Campos', 'Daniel Rocha']]
];
const periodo = {
    nome: '1º Bimestre', ano_letivo: ano, data_inicio: '2026-02-02', data_fim: '2026-04-17'
};
const acompanhamentos = [
    {
        aluno: 'Gabriel Vaz', disciplina: 'Matemática', media: 8.5, status: 'publicado',
        descricao: 'Resolveu sistemas lineares por substituição e justificou as etapas da solução. O próximo passo é comparar a estratégia algébrica com a interpretação gráfica.',
        tags: ['Participação', 'Evolução']
    },
    {
        aluno: 'Marina Alves', disciplina: 'Língua Portuguesa', media: 7.8, status: 'publicado',
        descricao: 'Identificou a tese do artigo e selecionou exemplos adequados. Precisa explicitar como cada exemplo sustenta o argumento na próxima revisão.',
        tags: ['Participação']
    },
    {
        aluno: 'Pedro Nogueira', disciplina: 'Matemática', media: 6.4, status: 'pendente',
        descricao: 'Organizou os dados dos problemas de proporcionalidade, mas alternou bases de cálculo em exercícios de porcentagem. Retomar o uso de tabelas de referência.',
        tags: ['Dificuldade']
    },
    {
        aluno: 'Lara Monteiro', disciplina: 'Biologia', media: 8.3, status: 'rascunho',
        descricao: 'Diferenciou células animais e vegetais a partir de imagens. A próxima atividade pedirá que relacione as estruturas observadas às respectivas funções.',
        tags: ['Evolução']
    },
    {
        aluno: 'Helena Duarte', disciplina: 'História', media: 8.8, status: 'publicado',
        descricao: 'Comparou duas fontes sobre industrialização e distinguiu contexto e ponto de vista. Contribuiu para a discussão ao justificar as diferenças entre as fontes.',
        tags: ['Participação']
    },
    {
        aluno: 'Sofia Mendes', disciplina: 'Física', media: 7.1, status: 'pendente',
        descricao: 'Interpretou o trecho de velocidade constante em um gráfico de posição. Ainda precisa conferir unidades ao calcular a inclinação de cada segmento.',
        tags: ['Dificuldade', 'Evolução']
    },
    {
        aluno: 'Lucas Barreto', disciplina: 'Química', media: 8.0, status: 'rascunho',
        descricao: 'Registrou as etapas da atividade em grupo e respeitou a divisão de tarefas. Na próxima aula, deve explicar como verificou o balanceamento das equações.',
        tags: ['Comportamento']
    }
];

const tabelas = [
    'usuarios', 'turmas', 'disciplinas', 'alunos', 'alunos_turmas',
    'professores_turmas_disciplinas', 'responsaveis_alunos', 'periodos_avaliativos',
    'tags', 'acompanhamentos', 'acompanhamentos_tags'
];

function chave(campos) {
    return Object.keys(campos).map(campo => `${campo} = ?`).join(' AND ');
}

function unico(linhas, contexto) {
    if (linhas.length > 1) throw new Error(`Mais de um registro para ${contexto}. Resolva a ambiguidade e tente novamente.`);
    return linhas[0];
}

async function encontrar(conexao, tabela, filtros, colunas, contexto) {
    const [linhas] = await conexao.execute(
        `SELECT ${colunas} FROM ${tabela} WHERE ${chave(filtros)} LIMIT 2`,
        Object.values(filtros)
    );
    return unico(linhas, contexto);
}

async function inserir(conexao, tabela, campos, registradoEm = null) {
    const colunas = Object.keys(campos);
    const valores = colunas.map(() => '?');
    if (registradoEm) {
        colunas.push(registradoEm);
        valores.push('UTC_TIMESTAMP()');
    }

    const [resultado] = await conexao.execute(
        `INSERT INTO ${tabela} (${colunas.join(', ')}) VALUES (${valores.join(', ')})`,
        Object.values(campos)
    );
    return resultado.insertId;
}

function nomeNormalizado(nome) {
    return nome.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim().split(/\s+/);
}

async function conta(conexao, nome, perfil, id) {
    const filtros = id ? { id, perfil, ativo: 1 } : { nome, perfil, ativo: 1 };
    const registro = await encontrar(conexao, 'usuarios', filtros, 'id, nome', nome);
    if (!registro || !nomeNormalizado(nome).every(parte => nomeNormalizado(registro.nome).includes(parte))) {
        throw new Error(`Conta ativa de ${nome} (${perfil}) não identificada. Confira o cadastro e, se necessário, informe o ID correspondente.`);
    }
    return registro.id;
}

export async function executarSeed(conexao, { professorId, responsavelId } = {}) {
    const [[bloqueio]] = await conexao.execute(
        "SELECT GET_LOCK(CONCAT('kfka.seed.em2026.', LEFT(SHA2(DATABASE(), 256), 40)), 10) AS obtido"
    );
    if (Number(bloqueio.obtido) !== 1) throw new Error('Outra execução do seed está em andamento ou o bloqueio está indisponível.');

    const inseridos = Object.fromEntries(tabelas.slice(1).map(tabela => [tabela, 0]));
    async function garantir(tabela, filtros, valores = filtros, { ativo = false, contexto = tabela } = {}) {
        const existente = await encontrar(conexao, tabela, filtros, ativo ? 'id, ativo' : '1 AS existe', contexto);
        if (existente) {
            if (ativo && Number(existente.ativo) !== 1) throw new Error(`${contexto} existe e está inativo. O seed preservou o registro.`);
            return existente.id;
        }
        const id = await inserir(conexao, tabela, valores);
        inseridos[tabela]++;
        return id;
    }

    try {
        const [estrutura] = await conexao.execute(
            `SELECT TABLE_NAME AS nome, ENGINE AS motor FROM information_schema.TABLES
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN (${tabelas.map(() => '?').join(', ')})`,
            tabelas
        );
        if (tabelas.some(tabela => !estrutura.some(item => item.nome === tabela && item.motor === 'InnoDB'))) {
            throw new Error('A base selecionada não contém todas as tabelas KFKA esperadas em InnoDB.');
        }

        await conexao.beginTransaction();
        try {
            const eric = await conta(conexao, 'Eric Carvalho', 'professor', professorId);
            const douglas = await conta(conexao, 'Douglas Macario', 'responsavel', responsavelId);

            const idsDisciplinas = new Map();
            for (const nome of disciplinas) {
                idsDisciplinas.set(nome, await garantir('disciplinas', { nome }, { nome }, { ativo: true, contexto: nome }));
            }

            const idsTags = new Map();
            for (const nome of tags) {
                idsTags.set(nome, await garantir('tags', { nome }, { nome }, { ativo: true, contexto: nome }));
            }
            const periodoId = await garantir('periodos_avaliativos', { nome: periodo.nome, ano_letivo: ano },
                periodo, { ativo: true, contexto: periodo.nome });

            const alunos = new Map();
            for (const [indiceTurma, [nomeTurma, nomes]] of turmas.entries()) {
                const dadosTurma = { nome: nomeTurma, ano_letivo: ano, periodo: 'manha' };
                const turmaId = await garantir('turmas', dadosTurma, dadosTurma, { ativo: true, contexto: nomeTurma });

                for (const [indiceAluno, nome] of nomes.entries()) {
                    const matricula = `DEMO-EM26-${indiceTurma + 1}0${indiceAluno + 1}`;
                    const aluno = await encontrar(conexao, 'alunos', { matricula }, 'id, nome, ativo', matricula);
                    if (aluno && (aluno.nome !== nome || Number(aluno.ativo) !== 1)) {
                        throw new Error(`A matrícula ${matricula} pertence a outro nome ou está inativa. Registro preservado.`);
                    }
                    if (!aluno && await encontrar(conexao, 'alunos', { nome }, 'id', nome)) {
                        throw new Error(`Já existe um aluno chamado ${nome} com outra matrícula. O seed não reutiliza esse cadastro.`);
                    }
                    const alunoId = aluno ? aluno.id : await inserir(conexao, 'alunos', {
                        nome, matricula, data_nascimento: `${2011 - indiceTurma}-0${indiceAluno + 2}-15`
                    });
                    if (!aluno) inseridos.alunos++;
                    const [outrosVinculos] = await conexao.execute(
                        `SELECT 1 FROM alunos_turmas at JOIN turmas t ON t.id = at.turma_id
                         WHERE at.aluno_id = ? AND t.ano_letivo = ? AND at.turma_id <> ? LIMIT 1`,
                        [alunoId, ano, turmaId]
                    );
                    if (outrosVinculos.length) throw new Error(`${nome} já tem outro vínculo em ${ano}. Vínculo existente preservado.`);

                    await garantir('alunos_turmas', { aluno_id: alunoId, turma_id: turmaId });
                    alunos.set(nome, { alunoId, turmaId });
                }
            }

            for (const nome of ['Gustavo Cocoloti', 'Gabriel Vaz']) {
                await garantir('responsaveis_alunos', { responsavel_id: douglas, aluno_id: alunos.get(nome).alunoId });
            }

            // O vínculo de Matemática do 2º ano A atende Gabriel e deixa Gustavo apto a um registro ao vivo.
            for (const registro of acompanhamentos) {
                const { alunoId, turmaId } = alunos.get(registro.aluno);
                const disciplinaId = idsDisciplinas.get(registro.disciplina);
                await garantir('professores_turmas_disciplinas', {
                    professor_id: eric, turma_id: turmaId, disciplina_id: disciplinaId
                });

                const criterios = {
                    aluno_id: alunoId, professor_id: eric, disciplina_id: disciplinaId, periodo_id: periodoId
                };
                const existente = await encontrar(conexao, 'acompanhamentos', criterios, 'id', registro.aluno);
                if (existente) continue;

                const acompanhamentoId = await inserir(conexao, 'acompanhamentos', {
                    ...criterios, descricao: registro.descricao, media: registro.media, status: registro.status
                }, registro.status === 'publicado' ? 'publicado_em' : null);
                inseridos.acompanhamentos++;
                for (const tag of registro.tags) {
                    await garantir('acompanhamentos_tags', {
                        acompanhamento_id: acompanhamentoId, tag_id: idsTags.get(tag)
                    });
                }
            }

            await conexao.commit();
            return inseridos;
        } catch (erro) {
            await conexao.rollback();
            throw erro;
        }
    } finally {
        await conexao.execute("SELECT RELEASE_LOCK(CONCAT('kfka.seed.em2026.', LEFT(SHA2(DATABASE(), 256), 40)))");
    }
}

async function main() {
    if (process.argv.length !== 3 || process.argv[2] !== '--executar') {
        console.log('Seed Ensino Médio 2026. Nenhuma conexão aberta. Use --executar somente após verificar a base de demonstração.');
        return;
    }
    for (const campo of ['DB_HOST', 'DB_USER', 'DB_NAME']) {
        if (!process.env[campo]?.trim()) throw new Error(`Defina ${campo} para a base de demonstração.`);
    }

    const port = Number(process.env.DB_PORT || 3306);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('DB_PORT inválida.');

    function idOpcional(campo) {
        const valor = process.env[campo];
        if (valor === undefined) return undefined;
        if (!/^[1-9]\d*$/.test(valor) || !Number.isSafeInteger(Number(valor))) throw new Error(`${campo} inválido.`);
        return Number(valor);
    }

    const professorId = idOpcional('KFKA_SEED_PROFESSOR_ID');
    const responsavelId = idOpcional('KFKA_SEED_RESPONSAVEL_ID');
    const conexao = await mysql.createConnection({
        host: process.env.DB_HOST,
        port,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8mb4',
        connectTimeout: 5000
    });
    try {
        const inseridos = await executarSeed(conexao, { professorId, responsavelId });
        console.table(inseridos);
    } finally {
        await conexao.end();
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    main().catch(erro => {
        console.error('Seed interrompido:', erro.code || erro.message);
        process.exitCode = 1;
    });
}
