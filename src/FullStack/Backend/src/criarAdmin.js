
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import bancoDados from './bancoDados.js';

async function criarAdmin() {
    try {
        const nome = process.env.ADMIN_NOME;
        const email = process.env.ADMIN_EMAIL;
        const senha = process.env.ADMIN_SENHA;

        if (!nome || !email || !senha || senha.length < 12) {
            throw new Error('Configure ADMIN_NOME, ADMIN_EMAIL e ADMIN_SENHA (mínimo de 12 caracteres) no .env.');
        }

        const [existentes] = await bancoDados.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existentes.length > 0) {
            console.log('Já existe um usuário com esse e-mail.');
            return;
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        await bancoDados.query(
            `INSERT INTO usuarios (nome, email, senha_hash, perfil)
             VALUES (?, ?, ?, ?)`,
            [nome, email, senhaHash, 'administrador']
        );

        console.log('Administrador inicial criado com sucesso!');
    } catch (erro) {
        console.error('Erro:', erro.message);
        process.exitCode = 1;
    } finally {
        await bancoDados.end();
    }
}

criarAdmin();
