import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import bancoDados from './bancoDados.js';

const hashToken = token => createHash('sha256').update(token).digest();

export function entregaLocal(env = process.env) {
    const bancoLocal = ['localhost', '127.0.0.1', '::1'].includes(env.DB_HOST);
    if (env.NODE_ENV !== 'development' || env.HOST !== '127.0.0.1' || !bancoLocal ||
        env.KFKA_RECUPERACAO_LOCAL !== 'true' || env.ALWAYSDATA_ACCOUNT) return null;

    return ({ token }) => {
        const url = new URL('http://localhost:5173/redefinir-senha');
        url.hash = new URLSearchParams({ token }).toString();
        console.info('Link de recuperação para demonstração local:', url.href);
    };
}

// A entrega recebe o destinatário e o token para permitir um adaptador SMTP futuro.
export function criarRecuperacao(pool = bancoDados, entregar = entregaLocal()) {
    return {
        async solicitar(email) {
            if (!entregar) return;
            const token = randomBytes(32).toString('hex');
            const hash = hashToken(token);
            const [resultado] = await pool.query(
                `INSERT INTO recuperacoes_senha (usuario_id, token_hash, expira_em, estado_conta)
                 SELECT id, ?, UTC_TIMESTAMP(6) + INTERVAL 15 MINUTE,
                     UNHEX(SHA2(CONCAT(email, ':', senha_hash), 256))
                 FROM usuarios WHERE email = ? AND ativo = 1
                 ON DUPLICATE KEY UPDATE token_hash = ?,
                     estado_conta = UNHEX(SHA2(CONCAT(email, ':', senha_hash), 256)),
                     expira_em = UTC_TIMESTAMP(6) + INTERVAL 15 MINUTE, usado = 0`,
                [hash, email, hash]
            );
            if (resultado.affectedRows) await entregar({ email, token });
        },

        async redefinir(token, senha) {
            if (!entregar) return false;
            const hash = hashToken(token);
            const [linhas] = await pool.query(
                `SELECT usuario_id FROM recuperacoes_senha
                 WHERE token_hash = ? AND usado = 0 AND expira_em > UTC_TIMESTAMP(6)`,
                [hash]
            );
            if (!linhas.length) return false;

            const senhaHash = await bcrypt.hash(senha, 10);
            // As duas alterações ocorrem juntas. O WHERE é reavaliado em concorrência.
            const [resultado] = await pool.query(
                `UPDATE recuperacoes_senha r JOIN usuarios u ON u.id = r.usuario_id
                 SET r.usado = 1, u.senha_hash = ?
                 WHERE r.token_hash = ? AND r.usado = 0
                   AND r.expira_em > UTC_TIMESTAMP(6) AND u.ativo = 1
                   AND r.estado_conta = UNHEX(SHA2(CONCAT(u.email, ':', u.senha_hash), 256))`,
                [senhaHash, hash]
            );
            return resultado.affectedRows > 0;
        }
    };
}
