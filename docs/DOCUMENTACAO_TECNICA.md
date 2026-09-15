# Farmácia Bem-Estar — Documentação Técnica Completa

> Este documento descreve todo o sistema para quem vai redigir o relatório do TDE de **Programação em Banco de Dados** (UniFacema, 3º período ADS, prof. Nayron Morais Almeida).

---

## 1. Resumo do Projeto

Sistema de gestão de uma farmácia fictícia chamada **"Farmácia Bem-Estar"**, composto por:

- **Banco de dados relacional** MySQL 9.x com 10 tabelas
- **API REST** em Node.js + Express 5
- **Front-end** em HTML + CSS + JavaScript vanilla (sem framework)
- **10 entidades** modeladas com DER e MER

O sistema permite cadastro de clientes, funcionários, produtos, fornecedores, fabricantes, categorias e lotes de estoque; registro de vendas com baixa automática de estoque; controle de medicamentos controlados com receita médica vinculada; e relatórios gerenciais.

---

## 2. Entidades do Sistema (10 tabelas)

| # | Entidade | Descrição |
|---|---|---|
| 1 | **Categoria** | Classifica os produtos (Analgésico, Antibiótico, etc.) |
| 2 | **Fabricante** | Empresa que produz o produto (EMS, Eurofarma, etc.) |
| 3 | **Fornecedor** | Distribuidora que fornece o produto à farmácia |
| 4 | **Cliente** | Pessoa que compra na farmácia |
| 5 | **Funcionário** | Quem atende/vende (farmacêutico, caixa, atendente, gerente) |
| 6 | **Produto** | Item vendido (medicamento, cosmético, etc.) |
| 7 | **EstoqueLote** | Controle de quantidade por lote com validade |
| 8 | **Venda** | Registro da transação de compra |
| 9 | **ItemVenda** | Cada produto dentro de uma venda (tabela associativa) |
| 10 | **Receita** | Receita médica para medicamentos controlados |

---

## 3. Relacionamentos e Cardinalidades

```
Categoria  1:N  Produto        (um produto pertence a uma categoria)
Fabricante 1:N  Produto        (um produto tem um fabricante)
Fornecedor 1:N  Produto        (um produto tem um fornecedor)
Produto    1:N  EstoqueLote    (um produto pode ter vários lotes)
Cliente    1:N  Venda          (um cliente pode ter várias vendas)
Funcionário 1:N Venda          (um funcionário pode realizar várias vendas)
Venda      1:N  ItemVenda      (uma venda tem vários itens)
Produto    1:N  ItemVenda      (um produto pode aparecer em vários itens)
Venda      1:1  Receita        (uma venda tem, no máximo, uma receita)
Produto    1:N  Receita        (um produto pode ter várias receitas)
```

A tabela **ItemVenda** resolve o relacionamento N:N entre Produto e Venda — cada linha é um item vendido, com quantidade, preço unitário e subtotal.

---

## 4. Schema do Banco de Dados (DDL)

### 4.1 Criação do banco

```sql
CREATE DATABASE IF NOT EXISTS farmacia_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 4.2 Tabelas (uma a uma)

#### 4.2.1 Categoria

```sql
CREATE TABLE Categoria (
  id_categoria INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome         VARCHAR(60)  NOT NULL,
  descricao    VARCHAR(255) NULL,
  PRIMARY KEY (id_categoria),
  UNIQUE KEY uk_categoria_nome (nome)
);
```

- **PK:** `id_categoria` (AUTO_INCREMENT)
- **UNIQUE:** `nome` (não pode ter duas categorias com o mesmo nome)
- 11 registros de exemplo (Analgésico, Antitérmico, Antibiótico, etc.)

#### 4.2.2 Fabricante

```sql
CREATE TABLE Fabricante (
  id_fabricante INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome          VARCHAR(100) NOT NULL,
  cnpj          VARCHAR(14)  NOT NULL,
  telefone      VARCHAR(15)  NULL,
  email         VARCHAR(100) NULL,
  PRIMARY KEY (id_fabricante),
  UNIQUE KEY uk_fabricante_cnpj (cnpj)
);
```

- **PK:** `id_fabricante`
- **UNIQUE:** `cnpj`
- 10 registros (EMS, Eurofarma, Aché, Medley, etc.)

#### 4.2.3 Fornecedor

```sql
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
);
```

- **PK:** `id_fornecedor`
- **UNIQUE:** `cnpj`
- 4 registros (Profarma, Santa Cruz, Hipofarma, Farmadelivery)

#### 4.2.4 Cliente

```sql
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
);
```

- **PK:** `id_cliente`
- **UNIQUE:** `cpf` (documento único por cliente)
- 8 registros de exemplo

#### 4.2.5 Funcionário

```sql
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
);
```

- **PK:** `id_funcionario`
- **UNIQUE:** `cpf`
- **CHECK:** `salario > 0` (não pode ter salário zero ou negativo)
- **ENUM:** `cargo` limita a 4 valores (farmacêutico, caixa, atendente, gerente)
- 5 registros

#### 4.2.6 Produto

```sql
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
);
```

- **PK:** `id_produto`
- **FKs:** `id_categoria`, `id_fabricante`, `id_fornecedor` → tabelas respectivas
- **ON DELETE RESTRICT:** não deleta uma categoria/fabricante/fornecedor que tenha produtos
- **ON UPDATE CASCADE:** se o id da categoria mudar, propaga para Produto
- **CHECK:** `preco_venda >= 0`
- **ENUM:** `status` = 'ativo' ou 'inativo' (produto inativo não pode ser vendido)
- **TINYINT:** `receita_controlada` = 0 (não) ou 1 (sim)
- 13 registros (incluindo Clonazepam 2mg e Metilfenidato 10mg, que são controlados)

#### 4.2.7 EstoqueLote

```sql
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
);
```

- **PK:** `id_lote`
- **UNIQUE composta:** `(id_produto, numero_lote)` — não pode ter dois lotes iguais para o mesmo produto
- **CHECK:** `data_validade >= data_fabricacao` (validade não pode ser anterior à fabricação)
- **FK:** `id_produto` → Produto
- **Índice em `data_validade`** para consultas de validade próxima
- 13 registros (1 por produto)

#### 4.2.8 Venda

```sql
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
);
```

- **PK:** `id_venda`
- **FKs:** `id_cliente`, `id_funcionario`
- **ENUM:** `forma_pagamento` (dinheiro, pix, cartao_debito, cartao_credito)
- **DEFAULT:** `data_hora` = CURRENT_TIMESTAMP
- **CHECKs:** total e desconto ≥ 0
- 6 registros

#### 4.2.9 ItemVenda

```sql
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
  CONSTRAINT fk_item_venda   FOREIGN KEY (id_venda)   REFERENCES Venda   (id_venda)   ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_item_produto FOREIGN KEY (id_produto) REFERENCES Produto (id_produto) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT ck_item_qtd CHECK (quantidade > 0),
  CONSTRAINT ck_item_subtotal CHECK (subtotal >= 0)
);
```

- **PK:** `id_item`
- **FKs:** `id_venda`, `id_produto`
- **Tabela associativa** entre Venda e Produto
- `subtotal` = `preco_unitario × quantidade` (calculado pelo sistema)
- 12 registros (6 vendas com 1-3 itens cada)

#### 4.2.10 Receita

```sql
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
);
```

- **PK:** `id_receita`
- **UNIQUE:** `id_venda` — cada venda pode ter, no máximo, **uma** receita
- **FKs:** `id_venda`, `id_produto`
- 2 registros (Clonazepam na venda 3, Metilfenidato na venda 6)

---

## 5. Diagramas

### 5.1 MER — Modelo Conceitual (entidades + relacionamentos)

O MER (fluxograma em `docs/mer.mmd`) mostra as 10 entidades como retângulos e os 10 relacionamentos como losangos, com cardinalidades `1` e `N` nas arestas. Não tem tipos de dados nem chaves — só a estrutura lógica do negócio.

**Relacionamentos do MER:**

| Relacionamento | Entidade A | Cardinalidade A | Cardinalidade B | Entidade B |
|---|---|---|---|---|
| Classifica | Categoria | 1 | N | Produto |
| Fabrica | Fabricante | 1 | N | Produto |
| Fornece | Fornecedor | 1 | N | Produto |
| Possui | Produto | 1 | N | EstoqueLote |
| Realiza | Cliente | 1 | N | Venda |
| Atende | Funcionário | 1 | N | Venda |
| Compoem | Venda | 1 | N | ItemVenda |
| Inclui | Produto | 1 | N | ItemVenda |
| Exige | Venda | 1 | 1 | Receita |
| Relaciona | Produto | 1 | N | Receita |

### 5.2 DER — Modelo Lógico (tabelas com PK/FK)

O DER (bloco `erDiagram` em `docs/der.mmd`) é o diagrama relacional completo: mostra as tabelas com colunas, tipos de dados, PKs, FKs e cardinalidades. É ele que o programador usa para criar o `CREATE TABLE`.

---

## 6. API REST (server.js)

### 6.1 Endpoints CRUD automáticos

O `server.js` gera rotas CRUD automaticamente para 7 entidades:

| Entidade | Rota base | Método |
|---|---|---|
| Categorias | `/api/categorias` | GET, POST, PUT, DELETE |
| Fabricantes | `/api/fabricantes` | GET, POST, PUT, DELETE |
| Fornecedores | `/api/fornecedores` | GET, POST, PUT, DELETE |
| Clientes | `/api/clientes` | GET, POST, PUT, DELETE |
| Funcionários | `/api/funcionarios` | GET, POST, PUT, DELETE |
| Estoque (lotes) | `/api/estoque` | GET, POST, PUT, DELETE |
| Receitas | `/api/receitas` | GET, POST, PUT, DELETE |
| Produtos | `/api/produtos` | GET (com JOIN), POST, PUT, DELETE |
| Vendas | `/api/vendas` | GET (com JOIN), POST, PUT, DELETE |

Cada rota segue o padrão:
- `GET /api/<entidade>` — lista todos os registros
- `GET /api/<entidade>/:id` — busca por ID
- `POST /api/<entidade>` — cria registro
- `PUT /api/<entidade>/:id` — atualiza registro
- `DELETE /api/<entidade>/:id` — exclui registro

### 6.2 Rotas específicas

| Rota | Método | Descrição |
|---|---|---|
| `/api/vendas/registrar` | POST | Registra venda completa em transação |
| `/api/vendas/:id/detalhe` | GET | Detalhe da venda (itens + receita) |
| `/api/relatorios/estoque-baixo` | GET | Produtos com estoque < 20 |
| `/api/relatorios/validade-proxima` | GET | Lotes a vencer em 90 dias |
| `/api/relatorios/vendas-periodo?de=&ate=` | GET | Faturamento por dia no período |

---

## 7. Regras de Negócio

| # | Regra | Como é validada |
|---|---|---|
| 1 | Venda exige cliente, funcionário, forma de pagamento e pelo menos 1 item | Validação de payload antes da transação |
| 2 | Produto `inativo` não pode ser vendido | `SELECT status` antes do INSERT |
| 3 | Quantidade inválida (≤ 0) é rejeitada | Validação de payload |
| 4 | Estoque insuficiente ou lote vencido bloqueia a venda | `SELECT` de lote com `quantidade >= ? AND data_validade >= CURDATE()` |
| 5 | Desconto não pode superar o total | Cálculo com `throw` + ROLLBACK |
| 6 | Medicamento controlado exige receita completa | `INSERT` em `Receita` dentro da transação |
| 7 | Não pode deletar uma entidade que está em uso por outra tabela | `ON DELETE RESTRICT` em todas as FKs |
| 8 | Não pode ter dois lotes iguais para o mesmo produto | `UNIQUE (id_produto, numero_lote)` |
| 9 | Não pode ter dois clientes/fornecedores com o mesmo CPF/CNPJ | `UNIQUE` em cada tabela |
| 10 | Não pode deletar uma categoria que tenha produtos associados | `ON DELETE RESTRICT` |

---

## 8. Fluxo de Venda (Transação)

O endpoint `POST /api/vendas/registrar` é a operação mais complexa do sistema. Ele executa **tudo dentro de uma única transação** MySQL (BEGIN/COMMIT/ROLLBACK):

```
1. VALIDAÇÃO DO PAYLOAD
   ├── id_cliente obrigatório
   ├── id_funcionario obrigatório
   ├── forma_pagamento obrigatória
   └── pelo menos 1 item

2. PARA CADA ITEM DA VENDA:
   ├── Verificar se o produto existe
   ├── Verificar se o produto está ATIVO
   ├── Se o produto for controlado, marcar
   ├── Buscar lote com estoque suficiente e validade válida (FIFO: mais perto de vencer)
   ├── Baixar a quantidade no lote
   └── Calcular subtotal (preço × quantidade)

3. CALCULAR TOTAL
   ├── total = soma dos subtotals - desconto
   └── Se total < 0 → ERRO (desconto maior que o total)

4. INSERIR VENDA
   └── INSERT INTO Venda

5. INSERIR ITENS
   └── INSERT INTO ItemVenda (para cada item)

6. SE HOUVER MEDICAMENTO CONTROLADO:
   ├── Validação: receita com nome_medico, crm_medico, uf_crm, data_emissao
   └── INSERT INTO Receita

7. COMMIT (ou ROLLBACK em qualquer erro)
```

**Pontos-chave:**
- A baixa de estoque é feita **antes** do INSERT da venda, dentro da mesma transação
- Se qualquer etapa falhar, **tudo é desfeito** (ROLLBACK)
- O lote escolhido é o que vence primeiro (FIFO por `data_validade ASC`)
- A receita médica é **obrigatória** para qualquer produto com `receita_controlada = 1`

---

## 9. Relatórios

### 9.1 Estoque Baixo

Lista produtos com estoque total (soma de todos os lotes válidos) menor que 20 unidades.

```sql
SELECT p.id_produto, p.nome, COALESCE(SUM(e.quantidade), 0) AS estoque_total
  FROM Produto p
  LEFT JOIN EstoqueLote e ON e.id_produto = p.id_produto AND e.data_validade >= CURDATE()
 GROUP BY p.id_produto, p.nome
HAVING estoque_total < 20
 ORDER BY estoque_total ASC
```

**Conceitos demonstrados:** LEFT JOIN, GROUP BY, HAVING, COALESCE, aggregate SUM.

### 9.2 Validade Próxima

Lista lotes que vencem nos próximos 90 dias.

```sql
SELECT e.id_lote, e.numero_lote, e.quantidade, e.data_validade, p.nome AS produto
  FROM EstoqueLote e JOIN Produto p ON p.id_produto = e.id_produto
 WHERE e.data_validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
 ORDER BY e.data_validade ASC
```

**Conceitos demonstrados:** JOIN, BETWEEN, DATE_ADD, ORDER BY.

### 9.3 Faturamento por Período

Mostra total de vendas e faturamento por dia em um período informado.

```sql
SELECT DATE(v.data_hora) AS dia, COUNT(*) AS vendas, SUM(v.total) AS faturamento
  FROM Venda v
 WHERE DATE(v.data_hora) BETWEEN ? AND ?
 GROUP BY DATE(v.data_hora)
 ORDER BY dia ASC
```

**Conceitos demonstrados:** GROUP BY, COUNT, SUM, BETWEEN.

---

## 10. Dados de Exemplo (Seed)

O arquivo `db/seed.sql` popula o banco com dados fictícios realistas:

| Tabela | Registros | Exemplos |
|---|---|---|
| Categoria | 11 | Analgésico, Antibiótico, Cardiovascular, Ansiolítico e Sedativo |
| Fabricante | 10 | EMS, Eurofarma, Aché, Medley, Novartis |
| Fornecedor | 4 | Profarma, Santa Cruz, Hipofarma, Farmadelivery |
| Cliente | 8 | João Carlos, Maria Aparecida, Roberto Ferreira... |
| Funcionário | 5 | 1 gerente, 2 farmacêuticos, 1 atendente, 1 caixa |
| Produto | 13 | Paracetamol, Dipirona, Clonazepam (controlado), etc. |
| EstoqueLote | 13 | 1 lote por produto, com quantidades de 18 a 200 |
| Venda | 6 | 6 vendas realizadas entre 10/09/2026 e 13/09/2026 |
| ItemVenda | 12 | 1-3 itens por venda |
| Receita | 2 | Clonazepam (venda 3) e Metilfenidato (venda 6) |

**Observações sobre os dados:**
- Todos os CPFs e CNPJs são fictícios mas seguem o formato válido (11 e 14 dígitos)
- Os preços de venda variam de R$ 4,50 (Dipirona) a R$ 48,30 (Metilfenidato)
- O Clonazepam (controlado) aparece na venda 3 com receita do Dr. Antônio
- O Metilfenidato (controlado) aparece na venda 6 com receita da Dra. Juliana
- O desconto varia de R$ 0,00 a R$ 5,00

---

## 11. Conceitos de Banco de Dados Demonstrados

| Conceito | Onde aparece |
|---|---|
| Chave primária (PK) | Todas as 10 tabelas (`AUTO_INCREMENT`) |
| Chave estrangeira (FK) | Produto (3 FKs), EstoqueLote, Venda (2 FKs), ItemVenda (2 FKs), Receita (2 FKs) |
| Restrição UNIQUE | CPF, CNPJs, nome de categoria, `(id_produto, numero_lote)` |
| Restrição CHECK | `salario > 0`, `preco_venda >= 0`, `total >= 0`, `quantidade > 0`, `data_validade >= data_fabricacao` |
| ENUM | `cargo`, `status`, `forma_pagamento` |
| Relacionamento 1:N | 9 dos 10 relacionamentos |
| Relacionamento 1:1 | Venda ↔ Receita (cada venda tem, no máximo, 1 receita) |
| Tabela associativa | ItemVenda resolve N:N entre Produto e Venda |
| Transação (ACID) | `POST /api/vendas/registrar` com BEGIN/COMMIT/ROLLBACK |
| Índices | FKs, `data_validade`, `data_hora` |
| Consulta com JOIN | Listagem de Produtos e Vendas com nomes das tabelas relacionadas |
| Consulta agregada | SUM, COUNT com GROUP BY e HAVING (relatórios) |
| Baixa FIFO | Seleção do lote mais próximo do vencimento para baixa |
| ON DELETE RESTRICT | Impede exclusão de registros usados por outras tabelas |
| ON UPDATE CASCADE | Propaga mudanças de ID nas chaves estrangeiras |

---

## 12. Tecnologias

| Tecnologia | Versão | Uso |
|---|---|---|
| MySQL | 9.x | Banco de dados relacional (InnoDB, utf8mb4) |
| Node.js | 18+ | Runtime do servidor |
| Express | 5 | Framework da API REST |
| mysql2 | — | Driver de conexão com pool de conexões |
| HTML + CSS + JS | Vanilla | Front-end sem framework |
| Mermaid | — | Diagramas MER/DER |

---

## 13. Estrutura dos Arquivos

```
farmacia-bem-estar/
├── db/
│   ├── schema.sql              ← DDL: criação do banco e 10 tabelas
│   └── seed.sql                ← DML: dados fictícios de demonstração
├── docs/
│   ├── der.mmd                 ← DER (erDiagram, Mermaid)
│   ├── der.png                 ← DER (imagem exportada)
│   ├── mer.mmd                 ← MER (flowchart, Mermaid)
│   └── mer.png                 ← MER (imagem exportada)
├── public/
│   ├── index.html              ← Página principal (abas do sistema)
│   ├── style.css               ← Estilos
│   └── app.js                  ← Lógica do front-end (fetch à API)
├── db.js                       ← Pool de conexões MySQL (lê o .env)
├── server.js                   ← API Express + CRUD + venda transacional + relatórios
├── package.json                ← Scripts e dependências
├── .env.example                ← Modelo de variáveis de ambiente
└── README.md                   ← Documentação do projeto
```

---

## 14. Como o TDE se Enquadra nos Critérios de Avaliação

| Critério | Pontos | Como o projeto atende |
|---|---|---|
| Organização | 2 | Estrutura de arquivos clara, nomenclatura consistente, README completo |
| Análise Crítica | 2 | Regras de negócio documentadas, transação ACID, FIFO, ON DELETE RESTRICT |
| Adequação | 2 | 10 entidades (mínimo exigido), fluxo linear de farmácia, sem complexidade desnecessária |
| Relevância | 3 | Domínio realista (farmácia), dados fictícios coerentes, relatórios gerenciais |
| Normatização ABNT | 1 | Relatório formatado em ABNT (Arial 12pt, espaçamento 1,5, margens corretas) |

**Contribuições do grupo:**

| Integrante | Responsabilidade |
|---|---|
| Integrante A | Requisitos funcionais e não-funcionais |
| Integrantes B e C | Diagramas MER e DER |
| Integrante D | Redação do relatório (ABNT) |
| Felipe (eu) | Código SQL (DDL + DML), revisão geral, normatização ABNT, referências |

---

## 15. Resumo para o Relatório

Quando for escrever o relatório, os pontos principais para cobrir:

1. **Introdução:** contextualizar o problema (gestão de farmácia, controle de estoque por lote, medicamentos controlados)
2. **Modelagem:** apresentar o MER (entidades + relacionamentos) e o DER (tabelas com tipos e chaves)
3. **Implementação:** descrever o schema SQL, as constraints e a transação de venda
4. **Resultados:** mostrar o sistema funcionando (prints da API e do front-end)
5. **Discussão:** explicar as decisões de projeto (ON DELETE RESTRICT, FIFO, ENUM, CHECK)
6. **Conclusão:** resumir o que foi aprendido sobre programação em banco de dados

Os diagramas já estão prontos em `docs/der.mmd` (DER) e `docs/mer.mmd` (MER), exportáveis como PNG.
