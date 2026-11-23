import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import criarRotasRecuperacao from './src/routes/recuperacaoRoutes.js';
import { falha, tratarErro } from './src/middlewares/erros.js';
import express from 'express';
import cors from 'cors';
import bancoDados from './src/bancoDados.js';

import authRoutes from './src/routes/authRoutes.js';
import cienciaDocumentosRoutes from './src/routes/cienciaDocumentosRoutes.js';
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

export const app = express();
const PORT = process.env.PORT || 3333;

// Remove o prefixo /api utilizado na hospedagem
app.use((req, res, next) => {
    if (req.url === '/api') {
        req.url = '/';
    } else if (req.url.startsWith('/api/')) {
        req.url = req.url.slice(4);
    }

    next();
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ mensagem: 'API KFKA funcionando!' });
});

app.get('/teste-banco', async (req, res) => {
    await bancoDados.query('SELECT 1');
    res.json({ mensagem: 'Conexão com MySQL funcionando!' });
});

app.use(authRoutes());
app.use(criarRotasRecuperacao());
app.use(cienciaDocumentosRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/alunos', alunoRoutes);
app.use('/turmas', turmaRoutes);
app.use('/disciplinas', disciplinaRoutes());
app.use('/professores-turmas', professorTurmaRoutes);
app.use('/periodos', periodoRoutes);
app.use('/acompanhamentos', acompanhamentoRoutes);

app.use(tagRoutes);
app.use(comentarioRoutes);
app.use(revisaoRoutes);
app.use(responsavelRoutes);

app.use((req, res, next) => next(falha(404, 'Rota não encontrada.')));
app.use(tratarErro);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    if (!process.env.JWT_SECRET?.trim()) throw new Error('Configure JWT_SECRET no ambiente.');
    const HOST = process.env.HOST || process.env.IP || '::';
    app.listen(PORT, HOST, () => {
        console.log(`Servidor KFKA rodando na porta ${PORT}`);
    });
}
