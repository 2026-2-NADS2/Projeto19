
-- Banco de dados KFKA

CREATE DATABASE IF NOT EXISTS kfka;
USE kfka;

-- Tabela de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('administrador', 'professor', 'responsavel') NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    data_nascimento DATE,
    matricula VARCHAR(30) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de turmas
CREATE TABLE IF NOT EXISTS turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ano_letivo YEAR NOT NULL,
    periodo ENUM('manha', 'tarde', 'noite', 'integral') NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relacao entre alunos e turmas
CREATE TABLE IF NOT EXISTS alunos_turmas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    turma_id INT NOT NULL,

    UNIQUE (aluno_id, turma_id),

    FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    FOREIGN KEY (turma_id) REFERENCES turmas(id)
);

-- Relacao entre responsaveis e alunos
CREATE TABLE IF NOT EXISTS responsaveis_alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    responsavel_id INT NOT NULL,
    aluno_id INT NOT NULL,
    parentesco VARCHAR(50),

    UNIQUE (responsavel_id, aluno_id),

    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id),
    FOREIGN KEY (aluno_id) REFERENCES alunos(id)
);

-- Tabela de disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Relacao entre professores, turmas e disciplinas
CREATE TABLE IF NOT EXISTS professores_turmas_disciplinas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professor_id INT NOT NULL,
    turma_id INT NOT NULL,
    disciplina_id INT NOT NULL,

    UNIQUE (professor_id, turma_id, disciplina_id),

    FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    FOREIGN KEY (turma_id) REFERENCES turmas(id),
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id)
);

-- Tabela de periodos avaliativos
CREATE TABLE IF NOT EXISTS periodos_avaliativos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    ano_letivo YEAR NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela de tags
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela de acompanhamentos
CREATE TABLE IF NOT EXISTS acompanhamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    professor_id INT NOT NULL,
    disciplina_id INT NOT NULL,
    periodo_id INT NOT NULL,
    descricao TEXT NOT NULL,
    media DECIMAL(5,2),

    status ENUM(
        'rascunho',
        'pendente',
        'publicado',
        'devolvido'
    ) NOT NULL DEFAULT 'rascunho',

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    publicado_em DATETIME,

    FOREIGN KEY (aluno_id) REFERENCES alunos(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_avaliativos(id)
);

-- Relacao entre acompanhamentos e tags
CREATE TABLE IF NOT EXISTS acompanhamentos_tags (
    acompanhamento_id INT NOT NULL,
    tag_id INT NOT NULL,

    PRIMARY KEY (acompanhamento_id, tag_id),

    FOREIGN KEY (acompanhamento_id) REFERENCES acompanhamentos(id),
    FOREIGN KEY (tag_id) REFERENCES tags(id)
);

-- Tabela de revisoes dos acompanhamentos
CREATE TABLE IF NOT EXISTS revisoes_acompanhamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acompanhamento_id INT NOT NULL,
    administrador_id INT NOT NULL,
    acao ENUM('aprovado', 'devolvido') NOT NULL,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (acompanhamento_id) REFERENCES acompanhamentos(id),
    FOREIGN KEY (administrador_id) REFERENCES usuarios(id)
);

-- Tabela de comentarios dos responsaveis
CREATE TABLE IF NOT EXISTS comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acompanhamento_id INT NOT NULL,
    responsavel_id INT NOT NULL,
    texto TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (acompanhamento_id) REFERENCES acompanhamentos(id),
    FOREIGN KEY (responsavel_id) REFERENCES usuarios(id)
);
