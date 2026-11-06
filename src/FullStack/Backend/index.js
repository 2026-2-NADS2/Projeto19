import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bancoDados from './src/bancoDados.js';

import authRoutes from './src/routes/authRoutes.js';
import usuarioRoutes from './src/routes/usuarioRoutes.js';
import alunoRoutes from './src/routes/alunosRoutes.js';
import turmaRoutes from './src/routes/turmaRoutes.js';
import disciplinaRoutes from './src/routes/disciplinaRoutes.js';
import professorTurmaRoutes from './src/routes/professorTurmaRoutes.js';
import periodoRoutes from './src/routes/periodoRoutes.js';
import acompanhamentoRoutes from './src/routes/acompanhamentoRoutes.js';
import tagRoutes from './src/routes/tagRoutes.js';
import comentarioRoutes from './src/routes/comentarioRoutes.js';
import revisaoRoutes from './src/routes/revisaoRoutes.js';
import responsavelRoutes from './src/routes/responsavelRoutes.js';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensagem: 'API KFKA funcionando!' });
});

app.get('/teste-banco', async (req, res) => {
    try {
        await bancoDados.query('SELECT 1');

        res.json({
            mensagem: 'Conexão com MySQL funcionando!'
        });
    } catch (erro) {
        console.error('Erro de conexão:', erro.message);

        res.status(500).json({
            mensagem: 'Erro ao conectar com MySQL.'
        });
    }
});

app.use(authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/alunos', alunoRoutes);
app.use('/turmas', turmaRoutes);
app.use('/disciplinas', disciplinaRoutes);
app.use('/professores-turmas', professorTurmaRoutes);
app.use('/periodos', periodoRoutes);
app.use('/acompanhamentos', acompanhamentoRoutes);

app.use(tagRoutes);
app.use(comentarioRoutes);
app.use(revisaoRoutes);
app.use(responsavelRoutes);

app.use((req, res) => {
    res.status(404).json({
        mensagem: 'Rota não encontrada.'
    });
});

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado no .env');
}

app.listen(PORT, () => {
    console.log(`Servidor KFKA rodando em http://localhost:${PORT}`);
});