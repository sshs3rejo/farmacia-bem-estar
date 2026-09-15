-- =====================================================
-- Farmácia Bem-Estar — Programação em Banco de Dados
-- Farmácia fictícia - schema.sql (DDL)
-- MySQL 9.x
-- =====================================================

CREATE DATABASE IF NOT EXISTS farmacia_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE farmacia_db;

-- -----------------------------------------------------
-- 1. CATEGORIA
-- -----------------------------------------------------
CREATE TABLE Categoria (
  id_categoria INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome         VARCHAR(60)  NOT NULL,
  descricao    VARCHAR(255) NULL,
  PRIMARY KEY (id_categoria),
  UNIQUE KEY uk_categoria_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 2. FABRICANTE
-- -----------------------------------------------------
CREATE TABLE Fabricante (
  id_fabricante INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome          VARCHAR(100) NOT NULL,
  cnpj          VARCHAR(14)  NOT NULL,
  telefone      VARCHAR(15)  NULL,
  email         VARCHAR(100) NULL,
  PRIMARY KEY (id_fabricante),
  UNIQUE KEY uk_fabricante_cnpj (cnpj)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 3. FORNECEDOR
-- -----------------------------------------------------
CREATE TABLE Fornecedor (
  id_fornecedor   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  razao_social    VARCHAR(120) NOT NULL,
  nome_fantasia   VARCHAR(60)  NULL,
  cnpj            VARCHAR(14)  NOT NULL,
  telefone        VARCHAR(15)  NULL,
  email           VARCHAR(100) NULL,
  endereco        VARCHAR(200) NULL,
  PRIMARY KEY (id_fornecedor),
  UNIQUE KEY uk_fornecedor_cnpj (cnpj)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 4. CLIENTE
-- -----------------------------------------------------
CREATE TABLE Cliente (
  id_cliente      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome            VARCHAR(100) NOT NULL,
  cpf             VARCHAR(11)  NOT NULL,
  data_nascimento DATE         NULL,
  telefone        VARCHAR(15)  NULL,
  email           VARCHAR(100) NULL,
  endereco        VARCHAR(200) NULL,
  PRIMARY KEY (id_cliente),
  UNIQUE KEY uk_cliente_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 5. FUNCIONARIO
-- -----------------------------------------------------
CREATE TABLE Funcionario (
  id_funcionario INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome           VARCHAR(100) NOT NULL,
  cpf            VARCHAR(11)  NOT NULL,
  cargo          ENUM('farmaceutico','caixa','atendente','gerente') NOT NULL DEFAULT 'atendente',
  salario        DECIMAL(10,2) NOT NULL,
  telefone       VARCHAR(15)  NULL,
  email          VARCHAR(100) NULL,
  data_admissao  DATE         NOT NULL,
  PRIMARY KEY (id_funcionario),
  UNIQUE KEY uk_funcionario_cpf (cpf),
  CONSTRAINT ck_funcionario_salario CHECK (salario > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 6. PRODUTO
-- -----------------------------------------------------
CREATE TABLE Produto (
  id_produto          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome                VARCHAR(100) NOT NULL,
  apresentacao        VARCHAR(60)  NULL,
  id_categoria        INT UNSIGNED NOT NULL,
  id_fabricante       INT UNSIGNED NOT NULL,
  id_fornecedor       INT UNSIGNED NOT NULL,
  preco_venda         DECIMAL(10,2) NOT NULL,
  receita_controlada  TINYINT(1) NOT NULL DEFAULT 0,
  status              ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
  PRIMARY KEY (id_produto),
  KEY idx_produto_categoria  (id_categoria),
  KEY idx_produto_fabricante (id_fabricante),
  KEY idx_produto_fornecedor (id_fornecedor),
  CONSTRAINT fk_produto_categoria  FOREIGN KEY (id_categoria)  REFERENCES Categoria  (id_categoria)  ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_produto_fabricante FOREIGN KEY (id_fabricante) REFERENCES Fabricante (id_fabricante) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_produto_fornecedor FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor (id_fornecedor) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_produto_preco CHECK (preco_venda >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 7. ESTOQUE_LOTE
-- -----------------------------------------------------
CREATE TABLE EstoqueLote (
  id_lote          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_produto       INT UNSIGNED NOT NULL,
  numero_lote      VARCHAR(30)  NOT NULL,
  quantidade       INT UNSIGNED NOT NULL DEFAULT 0,
  preco_custo      DECIMAL(10,2) NOT NULL,
  data_fabricacao  DATE         NOT NULL,
  data_validade    DATE         NOT NULL,
  PRIMARY KEY (id_lote),
  UNIQUE KEY uk_lote_produto_lote (id_produto, numero_lote),
  KEY idx_lote_validade (data_validade),
  CONSTRAINT fk_lote_produto FOREIGN KEY (id_produto) REFERENCES Produto (id_produto) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_lote_validade CHECK (data_validade >= data_fabricacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 8. VENDA
-- -----------------------------------------------------
CREATE TABLE Venda (
  id_venda         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_cliente       INT UNSIGNED NOT NULL,
  id_funcionario   INT UNSIGNED NOT NULL,
  data_hora        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  forma_pagamento  ENUM('dinheiro','pix','cartao_debito','cartao_credito') NOT NULL,
  desconto         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total            DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_venda),
  KEY idx_venda_cliente     (id_cliente),
  KEY idx_venda_funcionario (id_funcionario),
  KEY idx_venda_data_hora   (data_hora),
  CONSTRAINT fk_venda_cliente     FOREIGN KEY (id_cliente)     REFERENCES Cliente     (id_cliente)     ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_venda_funcionario FOREIGN KEY (id_funcionario) REFERENCES Funcionario (id_funcionario) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_venda_total    CHECK (total >= 0),
  CONSTRAINT ck_venda_desconto CHECK (desconto >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 9. ITEM_VENDA
-- -----------------------------------------------------
CREATE TABLE ItemVenda (
  id_item        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_venda       INT UNSIGNED NOT NULL,
  id_produto     INT UNSIGNED NOT NULL,
  quantidade     INT UNSIGNED NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  subtotal       DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id_item),
  KEY idx_item_venda   (id_venda),
  KEY idx_item_produto (id_produto),
  CONSTRAINT fk_item_venda FOREIGN KEY (id_venda)   REFERENCES Venda   (id_venda)   ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_item_produto FOREIGN KEY (id_produto) REFERENCES Produto (id_produto) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_item_qtd CHECK (quantidade > 0),
  CONSTRAINT ck_item_subtotal CHECK (subtotal >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- 10. RECEITA (medicamento controlado)
-- -----------------------------------------------------
CREATE TABLE Receita (
  id_receita     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_venda       INT UNSIGNED NOT NULL,
  id_produto     INT UNSIGNED NOT NULL,
  nome_medico    VARCHAR(100) NOT NULL,
  crm_medico     VARCHAR(20)  NOT NULL,
  uf_crm         CHAR(2)      NOT NULL,
  data_emissao   DATE         NOT NULL,
  observacao     VARCHAR(255) NULL,
  PRIMARY KEY (id_receita),
  UNIQUE KEY uk_receita_venda (id_venda),
  KEY idx_receita_produto (id_produto),
  CONSTRAINT fk_receita_venda   FOREIGN KEY (id_venda)   REFERENCES Venda   (id_venda)   ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_receita_produto FOREIGN KEY (id_produto) REFERENCES Produto (id_produto) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;