import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';
import express from 'express';
import jwt from 'jsonwebtoken';
import bancoDados from '../src/bancoDados.js';
import { versoes } from '../src/cienciaDocumentos.js';
import autenticarComCiencia from '../src/middlewares/autenticarComCiencia.js';
import cienciaDocumentosRoutes from '../src/routes/cienciaDocumentosRoutes.js';

test('ciência das minutas controla o acesso sem alterar o histórico', async t => {
    const flag = 'KFKA_CIENCIA_LEGAL_TESTE';
    const ajustes = [flag, 'JWT_SECRET'].map(nome => [nome, process.env[nome]]);
    delete process.env[flag];
    process.env.JWT_SECRET = 'chave-exclusiva-do-teste';

    const contas = new Map([[1, 'administrador'], [2, 'professor'], [3, 'responsavel']]);
    const registros = new Map();
    let consultas = 0;

    t.mock.method(bancoDados, 'execute', async (sql, parametros) => {
        consultas++;
        const [termos, privacidade, id, perfil] = parametros;
        const contaValida = contas.get(id) === perfil;
        const chave = JSON.stringify([id, termos, privacidade]);

        if (sql.trimStart().startsWith('SELECT')) {
            return [contaValida ? [{ confirmado: registros.has(chave) ? 1 : 0 }] : []];
        }

        assert.match(sql, /UTC_TIMESTAMP\(6\)/);
        assert.doesNotMatch(sql, /UPDATE/i);
        if (!contaValida) return [{ affectedRows: 0 }];
        if (registros.has(chave)) throw Object.assign(new Error('duplicado'), { code: 'ER_DUP_ENTRY' });
        registros.set(chave, new Date());
        return [{ affectedRows: 1 }];
    });

    const app = express();
    app.use(express.json());
    app.use(cienciaDocumentosRoutes);
    app.get('/operacao', autenticarComCiencia, (req, res) => res.json(req.usuario));
    app.get('/operacao-admin', autenticarComCiencia, (req, res) => {
        res.sendStatus(req.usuario.perfil === 'administrador' ? 200 : 403);
    });

    const servidor = app.listen(0, '127.0.0.1');
    t.after(async () => {
        for (const [nome, valor] of ajustes) {
            if (valor === undefined) delete process.env[nome];
            else process.env[nome] = valor;
        }
        await new Promise(resolve => servidor.close(resolve));
    });
    await once(servidor, 'listening');

    const url = `http://127.0.0.1:${servidor.address().port}`;
    const token = (id, perfil) => jwt.sign({ id, perfil }, process.env.JWT_SECRET);
    function chamar(caminho, credencial, dados) {
        const headers = { 'Content-Type': 'application/json' };
        if (credencial) headers.Authorization = `Bearer ${credencial}`;
        return fetch(url + caminho, {
            headers,
            method: dados ? 'POST' : 'GET',
            body: dados ? JSON.stringify(dados) : undefined
        });
    }

    const confirmacao = { ...versoes, ciente: true };
    const admin = token(1, 'administrador');
    const professor = token(2, 'professor');
    const caminho = '/ciencia-documentos';

    assert.equal((await chamar(caminho)).status, 401);
    assert.equal((await chamar('/operacao', admin)).status, 200);
    assert.equal((await (await chamar(caminho, admin)).json()).ativo, false);
    assert.equal((await chamar(caminho, admin, confirmacao)).status, 403);
    assert.equal(consultas, 0);

    process.env[flag] = 'true';
    assert.equal((await chamar('/operacao', 'token-invalido')).status, 401);
    const bloqueio = await chamar('/operacao', admin);
    assert.equal(bloqueio.status, 403);
    assert.equal((await bloqueio.json()).codigo, 'CIENCIA_DOCUMENTOS_PENDENTE');
    assert.equal((await chamar(caminho, token(1, 'professor'))).status, 401);
    assert.equal((await chamar(caminho, token(99, 'professor'), confirmacao)).status, 401);
    assert.equal((await chamar(caminho, admin, { ...confirmacao, usuario_id: 2 })).status, 400);
    assert.equal((await chamar(caminho, admin, { ...confirmacao, ciente: 'true' })).status, 400);
    assert.equal((await chamar(caminho, admin, { ...confirmacao, versaoPrivacidade: 'antiga' })).status, 409);
    assert.equal(registros.size, 0);

    const chaveAntiga = JSON.stringify([1, versoes.versaoTermos, 'privacidade-antiga']);
    const dataAntiga = new Date('2020-01-01T00:00:00Z');
    registros.set(chaveAntiga, dataAntiga);
    assert.equal((await (await chamar(caminho, admin)).json()).confirmado, false);
    assert.equal((await chamar(caminho, admin, confirmacao)).status, 200);
    const chaveAtual = JSON.stringify([1, versoes.versaoTermos, versoes.versaoPrivacidade]);
    const dataAtual = registros.get(chaveAtual);
    const repeticoes = await Promise.all([chamar(caminho, admin, confirmacao), chamar(caminho, admin, confirmacao)]);
    assert.deepEqual(repeticoes.map(resposta => resposta.status), [200, 200]);
    assert.equal(registros.get(chaveAtual), dataAtual);
    assert.equal(registros.get(chaveAntiga), dataAntiga);
    assert.equal(registros.size, 2);
    assert.equal((await chamar('/operacao-admin', admin)).status, 200);
    assert.equal((await chamar('/operacao', professor)).status, 403);

    for (const [id, perfil] of [[2, 'professor'], [3, 'responsavel']]) {
        const credencial = token(id, perfil);
        assert.equal((await chamar(caminho, credencial, confirmacao)).status, 200);
        const consulta = await chamar(caminho, credencial);
        assert.equal(consulta.headers.get('cache-control'), 'no-store');
        assert.equal((await consulta.json()).confirmado, true);
        assert.equal((await chamar('/operacao', credencial)).status, 200);
        assert.equal((await chamar('/operacao-admin', credencial)).status, 403);
    }

    contas.delete(1);
    assert.equal((await chamar('/operacao', admin)).status, 401);
});
