import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { once } from 'node:events';
import test from 'node:test';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = randomBytes(32).toString('hex');
process.env.JWT_EXPIRES_IN = '2h';
process.env.KFKA_CIENCIA_LEGAL_TESTE = 'false';
process.env.KFKA_RECUPERACAO_LOCAL = 'true';
process.env.NODE_ENV = 'development';
process.env.HOST = '127.0.0.1';
process.env.DB_HOST = '127.0.0.1';
delete process.env.ALWAYSDATA_ACCOUNT;

const { app } = await import('../index.js');
const { default: bancoDados } = await import('../src/bancoDados.js');
const { criarRecuperacao, entregaLocal } = await import('../src/recuperacaoSenha.js');

test('entrega local exige desenvolvimento, loopback e habilitação explícita', () => {
    const local = { NODE_ENV: 'development', HOST: '127.0.0.1', DB_HOST: '127.0.0.1', KFKA_RECUPERACAO_LOCAL: 'true' };
    assert.equal(typeof entregaLocal(local), 'function');
    for (const alteracao of [
        { NODE_ENV: 'production' }, { HOST: '::' }, { KFKA_RECUPERACAO_LOCAL: 'false' },
        { ALWAYSDATA_ACCOUNT: 'ambiente-teste' }, { DB_HOST: 'db.example.test' }
    ]) assert.equal(entregaLocal({ ...local, ...alteracao }), null);
});

test('recuperação desativada não consulta o banco', async () => {
    const recuperacao = criarRecuperacao({}, null);
    await recuperacao.solicitar('demo@example.test');
    assert.equal(await recuperacao.redefinir('a'.repeat(64), 'SenhaValida123'), false);
});

test('API de autenticação e recuperação em HTTP com banco simulado', async t => {
    const admin = { id: 1, nome: 'Admin', email: 'admin@example.test', perfil: 'administrador' };
    const professor = { id: 2, nome: 'Professor', email: 'professor@example.test', perfil: 'professor' };
    admin.senha_hash = (await bcrypt.hash('SenhaAntes123', 4)).replace(/^\$2b\$/, '$2a$');
    professor.senha_hash = await bcrypt.hash('SenhaProfessor123', 4);
    const usuarios = [admin, professor];
    let reset;
    let acessoBanco = 0;
    let link;

    t.mock.method(console, 'info', (_, url) => { link = new URL(url); });
    t.mock.method(bancoDados, 'execute', async (sql, [id, perfil]) => {
        assert.match(sql, /perfil = \? AND ativo = 1/);
        return [usuarios.filter(u => u.id === id && u.perfil === perfil)];
    });
    t.mock.method(bancoDados, 'query', async (sql, params) => {
        acessoBanco++;
        if (sql === 'SELECT 1') throw new Error('detalhe interno simulado');
        if (sql === 'SELECT id FROM usuarios WHERE email = ?') {
            return [usuarios.filter(u => u.email === params[0])];
        }
        if (sql.includes('INSERT INTO recuperacoes_senha')) {
            assert.match(sql, /INTERVAL 15 MINUTE/);
            const [hash, email, hashAtualizado] = params;
            assert.deepEqual(hash, hashAtualizado);
            const usuario = usuarios.find(u => u.email === email);
            if (!usuario) return [{ affectedRows: 0 }];
            reset = { hash, usuario, expira: Date.now() + 15 * 60 * 1000, usado: false };
            return [{ affectedRows: 1 }];
        }

        if (sql.includes('FROM recuperacoes_senha') || sql.includes('UPDATE recuperacoes_senha')) {
            const atualiza = sql.startsWith('UPDATE');
            const hash = params[atualiza ? 1 : 0];
            const valido = reset && reset.hash.equals(hash) && !reset.usado && reset.expira > Date.now();
            if (!atualiza) return [valido ? [{ usuario_id: reset.usuario.id }] : []];
            if (!valido) return [{ affectedRows: 0 }];
            reset.usuario.senha_hash = params[0];
            reset.usado = true;
            return [{ affectedRows: 2 }];
        }

        if (sql.includes('WHERE email = ? AND ativo')) return [usuarios.filter(u => u.email === params[0])];
        if (sql.includes('WHERE id = ? AND perfil = ?')) {
            return [usuarios.filter(u => u.id === params[0] && u.perfil === params[1])
                .map(({ id, nome, email, perfil }) => ({ id, nome, email, perfil, ativo: 1 }))];
        }
        if (sql.includes('FROM usuarios') && sql.includes('ORDER BY')) return [[
            { id: admin.id, nome: admin.nome, email: admin.email, perfil: admin.perfil }
        ]];

        throw new Error('Consulta inesperada no teste.');
    });

    const servidor = app.listen(0, '127.0.0.1');
    t.after(() => new Promise(resolve => servidor.close(resolve)));
    await once(servidor, 'listening');
    const url = `http://127.0.0.1:${servidor.address().port}/api`;
    const chamar = (rota, { dados, token, corpo } = {}) => fetch(url + rota, {
        method: dados || corpo ? 'POST' : 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: corpo ?? (dados ? JSON.stringify(dados) : undefined)
    });
    const login = (email, senha) => chamar('/login', { dados: { email, senha } });
    const solicitar = email => chamar('/recuperar-senha', { dados: { email } });
    const credencialAdmin = () => jwt.sign({ id: admin.id, perfil: admin.perfil },
        process.env.JWT_SECRET, { expiresIn: 60 });
    const redefinir = (token, senha = 'SenhaNova123') => chamar('/redefinir-senha', { dados: { token, senha } });

    await t.test('login válido com hash legado e perfis existentes', async () => {
        const resposta = await login(admin.email, 'SenhaAntes123');
        assert.equal(resposta.status, 200);
        const { token, usuario } = await resposta.json();
        assert.equal(usuario.perfil, 'administrador');
        assert.equal(usuario.senha_hash, undefined);
        assert.equal((await chamar('/perfil', { token })).status, 200);
        assert.equal((await chamar('/usuarios', { token })).status, 200);
    });

    await t.test('senha incorreta e e-mail inexistente recebem a mesma resposta', async () => {
        const respostas = await Promise.all([login(admin.email, 'errada'), login('fora@example.test', 'errada')]);
        assert.deepEqual(respostas.map(r => r.status), [401, 401]);
        assert.deepEqual(await respostas[0].json(), await respostas[1].json());
    });

    await t.test('JWT ausente, inválido, expirado e perfil sem permissão', async () => {
        const assinar = (perfil, expiresIn) => jwt.sign({ id: 2, perfil }, process.env.JWT_SECRET, { expiresIn });
        assert.equal((await chamar('/usuarios')).status, 401);
        assert.equal((await chamar('/usuarios', { token: 'invalido' })).status, 401);
        assert.equal((await chamar('/usuarios', { token: assinar('professor', -1) })).status, 401);
        assert.equal((await chamar('/usuarios', { token: assinar('professor', 60) })).status, 403);
        assert.equal((await chamar('/usuarios', { token: assinar('administrador', 60) })).status, 401);
    });

    await t.test('validação de JSON, e-mail, senha, ID e resposta 404', async () => {
        const inicial = acessoBanco;
        assert.equal((await login('invalido', 'senha')).status, 400);
        assert.equal((await chamar('/login', { corpo: '{"senha":' })).status, 400);
        assert.equal((await solicitar('invalido')).status, 400);
        assert.equal((await redefinir('a'.repeat(64), 'curta')).status, 400);
        const token = credencialAdmin();
        assert.equal((await chamar('/usuarios/1.0', { token })).status, 400);
        assert.equal((await chamar('/inexistente')).status, 404);
        assert.equal(acessoBanco, inicial);
    });

    await t.test('conflito de cadastro e erro interno preservam mensagens públicas', async () => {
        const conflito = await chamar('/usuarios', {
            token: credencialAdmin(),
            dados: { nome: 'Outro usuário', email: professor.email, senha: 'SenhaValida123', perfil: 'professor' }
        });
        assert.equal(conflito.status, 409);
        assert.match((await conflito.json()).mensagem, /já existe/i);

        const logErro = t.mock.method(console, 'error', () => {});
        try {
            const resposta = await chamar('/teste-banco');
            assert.equal(resposta.status, 500);
            assert.deepEqual(await resposta.json(), { mensagem: 'Erro interno ao realizar operação.' });
        } finally {
            logErro.mock.restore();
        }
    });

    await t.test('solicitação genérica, token inválido, expirado e substituído', async () => {
        const ausente = await solicitar('fora@example.test');
        assert.equal(link, undefined);
        const presente = await solicitar(admin.email);
        assert.equal(ausente.status, 202);
        assert.equal(presente.status, 202);
        assert.deepEqual(await ausente.json(), await presente.json());
        assert.equal(link.origin, 'http://localhost:5173');
        assert.equal(link.search, '');
        const token = new URLSearchParams(link.hash.slice(1)).get('token');
        assert.deepEqual(reset.hash, createHash('sha256').update(token).digest());
        assert.equal((await redefinir('a'.repeat(64))).status, 400);
        reset.expira = Date.now() - 1;
        assert.equal((await redefinir(token)).status, 400);
        assert.equal((await solicitar(admin.email)).status, 202);
        assert.equal((await redefinir(token)).status, 400);
    });

    await t.test('token válido só pode alterar uma vez, inclusive em paralelo', async () => {
        const token = new URLSearchParams(link.hash.slice(1)).get('token');
        const resultados = await Promise.all([redefinir(token), redefinir(token)]);
        assert.deepEqual(resultados.map(r => r.status).sort(), [200, 400]);
        assert.equal((await redefinir(token)).status, 400);
        assert.equal((await login(admin.email, 'SenhaAntes123')).status, 401);
        assert.equal((await login(admin.email, 'SenhaNova123')).status, 200);
    });

    await t.test('limite de solicitação retorna 429', async () => {
        assert.equal((await solicitar('um@example.test')).status, 202);
        assert.equal((await solicitar('dois@example.test')).status, 429);
        for (let tentativa = 0; tentativa < 3; tentativa++) {
            assert.equal((await redefinir('f'.repeat(64))).status, 400);
        }
        assert.equal((await redefinir('f'.repeat(64))).status, 429);
    });
});
