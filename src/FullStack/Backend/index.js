
import express from 'express';
import cors from 'cors';
import bancoDados from './src/bancoDados.js';

const app = express();

app.use(cors());
app.use(express.json());

// Rota inicial
app.get('/', (req, res) => {
    res.json({ mensagem: 'API KFKA funcionando!' });
});

// Rota para testar a conexão com o MySQL
app.get('/teste-banco', async (req, res) => {
    try {
        const [resultado] = await bancoDados.query('SELECT 1 AS teste');

        res.json({
            mensagem: 'Conexão com MySQL funcionando!',
            resultado: resultado
        });
    } catch (erro) {
        console.error('Erro ao conectar ao banco:', erro.message);

        res.status(500).json({
            mensagem: 'Não foi possível conectar ao MySQL.'
        });
    }
});

app.listen(3333, () => {
    console.log('Servidor rodando em http://localhost:3333');
});
