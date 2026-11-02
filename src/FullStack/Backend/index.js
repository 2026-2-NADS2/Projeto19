
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bancoDados from './src/bancoDados.js';

import authRoutes from './src/routes/authRoutes.js';
import usuarioRoutes from './src/routes/usuarioRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Rota inicial
app.get('/', (req, res) => {
    res.json({
        mensagem: 'API KFKA funcionando!'
    });
});

// Testar conexão com o MySQL
app.get('/teste-banco', async (req, res) => {
    try {
        const [resultado] = await bancoDados.query(
            'SELECT 1 AS teste'
        );

        res.json({
            mensagem: 'Conexão com MySQL funcionando!',
            resultado
        });
    } catch (erro) {
        console.error('Erro ao conectar ao banco:', erro.message);

        res.status(500).json({
            mensagem: 'Não foi possível conectar ao MySQL.'
        });
    }
});

// Rotas de autenticação
app.use(authRoutes);

// Rotas de usuários
app.use('/usuarios', usuarioRoutes);

// Rota não encontrada
app.use((req, res) => {
    res.status(404).json({
        mensagem: 'Rota não encontrada.'
    });
});

// Verificar configuração JWT
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado no .env.');
}

// Iniciar servidor
app.listen(3333, () => {
    console.log('Servidor rodando em http://localhost:3333');
});
