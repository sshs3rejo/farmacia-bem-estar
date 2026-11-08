# Farmácia Bem-Estar

Sistema de gestão de farmácia: API REST em **Node.js + Express 5** sobre **MySQL**, com interface web para cadastro e operação de produtos, estoque, vendas e receitas.

Trabalho de Programação em Banco de Dados — UniFacema.

## O que modela

Dez tabelas, com as relações que o domínio de farmácia realmente exige — e que separam este esquema de um CRUD genérico:

| Tabela | Papel |
|---|---|
| `Categoria` | Classificação do produto |
| `Fabricante` | Laboratório / fabricante |
| `Fornecedor` | Quem abastece a loja |
| `Cliente` | Consumidor |
| `Funcionario` | Operador do balcão |
| `Produto` | Item de venda, ligado a categoria, fabricante e fornecedor |
| `EstoqueLote` | **Entrada por lote**, com validade e quantidade — não um contador único no produto |
| `Venda` | Cabeçalho da venda |
| `ItemVenda` | Linha da venda: produto, quantidade, preço praticado |
| `Receita` | Prescrição associada a cliente e produto |

Duas decisões merecem destaque:

**Estoque em lotes, não em campo único.** Farmácia trabalha com validade. Guardar `estoque INT` no produto impede responder "quais lotes vencem este mês" — o que é obrigação sanitária. `EstoqueLote` resolve.

**Preço fica na linha da venda.** `ItemVenda` guarda o valor praticado, para que mudar o preço do produto hoje não reescreva o faturamento de ontem.

## Documentação de dados

Em `docs/`:

| Arquivo | Conteúdo |
|---|---|
| `schema.sql` / `seed.sql` | DDL completo e dados de exemplo (em `db/`) |
| `mer.mmd` + `mer.png` | Modelo Entidade-Relacionamento |
| `der.mmd` + `der.png` | Diagrama Entidade-Relacionamento |
| `DOCUMENTACAO_TECNICA.md` | Decisões de modelagem e dicionário de dados |

Os diagramas estão em Mermaid (`.mmd`), então versionam como texto e renderizam no GitHub.

## Rodando

Requisitos: Node 18+ e MySQL 8.

```bash
git clone https://github.com/sshs3rejo/farmacia-bem-estar.git
cd farmacia-bem-estar
npm install
```

Crie o banco e carregue os dados de exemplo:

```bash
npm run db:setup
# equivalente a:
# mysql -u root -p < db/schema.sql
# mysql -u root -p farmacia_db < db/seed.sql
```

Configure o `.env` a partir de `.env.example`:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=farmacia_db
PORT=3000
```

Inicie:

```bash
npm start        # http://localhost:3000
```

## Estrutura

```
farmacia-bem-estar/
├── server.js           servidor Express e rotas
├── db.js               pool de conexões MySQL
├── db/
│   ├── schema.sql      DDL das 10 tabelas
│   └── seed.sql        dados de exemplo
├── public/             interface web
└── docs/               MER, DER e documentação técnica
```

## Stack

`express` 5.2 · `mysql2` 3.24 · `dotenv` · ESLint 10

## Licença

MIT
