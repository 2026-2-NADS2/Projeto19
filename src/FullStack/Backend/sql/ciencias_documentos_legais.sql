-- Execute na base de testes selecionada. Horários armazenados em UTC.
CREATE TABLE IF NOT EXISTS ciencias_documentos_legais (
    usuario_id INT NOT NULL,
    versao_termos VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    versao_privacidade VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    confirmado_em DATETIME(6) NOT NULL,
    PRIMARY KEY (usuario_id, versao_termos, versao_privacidade),
    CONSTRAINT fk_ciencia_documentos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;
