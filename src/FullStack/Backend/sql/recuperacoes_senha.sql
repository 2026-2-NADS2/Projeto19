CREATE TABLE IF NOT EXISTS recuperacoes_senha (
    usuario_id INT NOT NULL PRIMARY KEY,
    token_hash BINARY(32) NOT NULL,
    estado_conta BINARY(32) NOT NULL,
    expira_em DATETIME(6) NOT NULL,
    usado TINYINT(1) NOT NULL DEFAULT 0,
    UNIQUE KEY uq_recuperacoes_senha_token (token_hash),
    CONSTRAINT fk_recuperacoes_senha_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB;
