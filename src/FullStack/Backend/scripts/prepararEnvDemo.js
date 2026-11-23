import { readFileSync, writeFileSync } from 'node:fs';
import dotenv from 'dotenv';

const campos = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const camposSeed = ['KFKA_SEED_PROFESSOR_ID', 'KFKA_SEED_RESPONSAVEL_ID'];

function preparar() {
    const sobrescritas = [...campos, ...camposSeed].filter(campo => process.env[campo] !== undefined);
    if (sobrescritas.length) {
        throw new Error(`Limpe estas variáveis do terminal antes de continuar: ${sobrescritas.join(', ')}.`);
    }

    const conteudo = readFileSync(new URL('../.env', import.meta.url), 'utf8');
    const configuracao = dotenv.parse(conteudo);
    if (!['localhost', '127.0.0.1'].includes(configuracao.DB_HOST) || configuracao.DB_NAME !== 'kfka') {
        throw new Error('O .env não aponta para o banco local kfka esperado.');
    }
    if (!configuracao.DB_USER?.trim() || configuracao.DB_PASSWORD === undefined) {
        throw new Error('A configuração local de usuário ou senha do banco está incompleta.');
    }

    // Preserva a sintaxe original do dotenv e valida o resultado sem exibir valores.
    const linhas = conteudo.split(/\r?\n/).filter(linha =>
        campos.includes(linha.match(/^\s*(?:export\s+)?([A-Z_]+)\s*=/)?.[1]));
    const demo = linhas.join('\n') + '\n';
    const conferido = dotenv.parse(demo);
    if (campos.some(campo => configuracao[campo] !== conferido[campo])) {
        throw new Error('A configuração não pode ser copiada com segurança. Prepare o .env.demo manualmente.');
    }

    writeFileSync(new URL('../.env.demo', import.meta.url), demo, { flag: 'wx', mode: 0o600 });
    console.log('.env.demo criado para o banco local kfka. O seed não foi executado.');
}

try {
    preparar();
} catch (erro) {
    console.error(erro.code === 'EEXIST'
        ? '.env.demo já existe. O arquivo existente foi preservado.'
        : 'Preparação interrompida: ' + (erro.code || erro.message));
    process.exitCode = 1;
}
