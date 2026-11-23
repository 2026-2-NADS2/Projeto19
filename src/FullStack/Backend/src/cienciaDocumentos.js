import bancoDados from './bancoDados.js';

// Atualize a versão correspondente quando o conteúdo da minuta mudar.
export const versoes = Object.freeze({
    versaoTermos: 'termos-minuta-v1',
    versaoPrivacidade: 'privacidade-minuta-v1'
});

export function cienciaAtiva() {
    return process.env.KFKA_CIENCIA_LEGAL_TESTE === 'true';
}

export async function consultarCiencia(usuario, pool = bancoDados) {
    const [linhas] = await pool.execute(
        `SELECT ciencia.usuario_id IS NOT NULL AS confirmado
         FROM usuarios AS usuario
         LEFT JOIN ciencias_documentos_legais AS ciencia
            ON ciencia.usuario_id = usuario.id
            AND ciencia.versao_termos = ? AND ciencia.versao_privacidade = ?
         WHERE usuario.id = ? AND usuario.perfil = ? AND usuario.ativo = 1`,
        [versoes.versaoTermos, versoes.versaoPrivacidade, usuario.id, usuario.perfil]
    );

    return linhas.length ? Boolean(linhas[0].confirmado) : null;
}

export async function registrarCiencia(usuario, pool = bancoDados) {
    try {
        const [resultado] = await pool.execute(
            `INSERT INTO ciencias_documentos_legais
                (usuario_id, versao_termos, versao_privacidade, confirmado_em)
             SELECT id, ?, ?, UTC_TIMESTAMP(6)
             FROM usuarios WHERE id = ? AND perfil = ? AND ativo = 1`,
            [versoes.versaoTermos, versoes.versaoPrivacidade, usuario.id, usuario.perfil]
        );
        return resultado.affectedRows === 1;
    } catch (erro) {
        if (erro.code !== 'ER_DUP_ENTRY') throw erro;

        // Uma confirmação anterior ou simultânea já gravou o horário original.
        return (await consultarCiencia(usuario, pool)) === true;
    }
}
