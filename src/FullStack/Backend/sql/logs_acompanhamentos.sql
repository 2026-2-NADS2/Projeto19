
-- Guarda as ações realizadas pelos responsáveis
CREATE TABLE IF NOT EXISTS logs_acompanhamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acompanhamento_id INT NOT NULL,
    usuario_id INT NOT NULL,
    acao ENUM('ciencia', 'observacao') NOT NULL,
    descricao TEXT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (acompanhamento_id)
        REFERENCES acompanhamentos(id),

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
);

-- Impede duas confirmações de ciência
-- do mesmo responsável no mesmo relatório
CREATE TABLE IF NOT EXISTS ciencias_acompanhamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acompanhamento_id INT NOT NULL,
    responsavel_id INT NOT NULL,
    confirmado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY unica_ciencia (
        acompanhamento_id,
        responsavel_id
    ),

    FOREIGN KEY (acompanhamento_id)
        REFERENCES acompanhamentos(id),

    FOREIGN KEY (responsavel_id)
        REFERENCES usuarios(id)
);
