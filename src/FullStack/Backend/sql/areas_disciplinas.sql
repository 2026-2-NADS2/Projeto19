CREATE TABLE areas_conhecimento (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO areas_conhecimento (nome) VALUES
    ('Linguagens'), ('Matemática'), ('Ciências da Natureza'), ('Ciências Humanas');

ALTER TABLE disciplinas
    ADD COLUMN area_id INT NULL,
    ADD CONSTRAINT fk_disciplinas_area
        FOREIGN KEY (area_id) REFERENCES areas_conhecimento (id);

UPDATE disciplinas d
JOIN areas_conhecimento a ON a.nome = CASE
    WHEN d.nome IN ('Língua Portuguesa', 'Português', 'Língua Inglesa', 'Inglês', 'Arte', 'Artes', 'Educação Física') THEN 'Linguagens'
    WHEN d.nome = 'Matemática' THEN 'Matemática'
    WHEN d.nome IN ('Ciências', 'Biologia', 'Física', 'Química') THEN 'Ciências da Natureza'
    WHEN d.nome IN ('História', 'Geografia', 'Filosofia', 'Sociologia') THEN 'Ciências Humanas'
END
SET d.area_id = a.id
WHERE d.area_id IS NULL;
