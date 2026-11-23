import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { criarRecuperacao } from '../recuperacaoSenha.js';
import { falha } from '../middlewares/erros.js';
import { email, senhaNova, validar } from '../validacao.js';

const pedido = z.object({ email });
const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
const redefinicao = z.object({ token: tokenSchema, senha: senhaNova });
const tokenInvalido = 'Link de recuperação inválido, expirado ou já utilizado.';
const mensagemLimite = { mensagem: 'Muitas tentativas. Tente novamente em alguns minutos.' };

export default function criarRotasRecuperacao(recuperacao = criarRecuperacao()) {
    const router = Router();
    const limitar = limit => rateLimit({
        windowMs: 15 * 60 * 1000,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: mensagemLimite,
        // A aplicação não confia em cabeçalhos de proxy informados pelo cliente.
        validate: { xForwardedForHeader: false }
    });

    router.post('/recuperar-senha', limitar(5), (req, res) => {
        const dados = validar(pedido, req.body, 'Informe um e-mail válido.');
        res.set('Cache-Control', 'no-store').status(202).json({
            mensagem: 'Se houver uma conta ativa para esse e-mail, siga as instruções do ambiente de recuperação.'
        });
        // Responda antes da consulta e da entrega para evitar diferenças por conta.
        recuperacao.solicitar(dados.email).catch(erro => {
            console.error('Falha ao processar recuperação:', erro.code || erro.name);
        });
    });

    router.post('/redefinir-senha', limitar(10), async (req, res) => {
        res.set('Cache-Control', 'no-store');
        validar(tokenSchema, req.body?.token, tokenInvalido);
        const { token, senha } = validar(redefinicao, req.body,
            'Informe uma senha com pelo menos 8 caracteres e no máximo 72 bytes.');
        if (!await recuperacao.redefinir(token, senha)) throw falha(400, tokenInvalido);
        res.json({ mensagem: 'Senha redefinida. Entre com a nova senha.' });
    });

    return router;
}
