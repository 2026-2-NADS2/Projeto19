class ErroHttp extends Error {
    constructor(status, mensagem) {
        super(mensagem);
        this.status = status;
    }
}

export const falha = (status, mensagem) => new ErroHttp(status, mensagem);

export function tratarErro(erro, req, res, next) {
    if (res.headersSent) return next(erro);
    if (erro.type === 'entity.parse.failed') {
        return res.status(400).json({ mensagem: 'O corpo da solicitação deve conter JSON válido.' });
    }
    if (erro.type === 'entity.too.large') {
        return res.status(413).json({ mensagem: 'O corpo da solicitação é grande demais.' });
    }
    if (erro.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ mensagem: 'Registro já existente.' });
    }
    if (erro instanceof ErroHttp) {
        return res.status(erro.status).json({ mensagem: erro.message });
    }
    console.error('Erro interno na API:', erro.code || erro.name);
    return res.status(500).json({ mensagem: 'Erro interno ao realizar operação.' });
}
