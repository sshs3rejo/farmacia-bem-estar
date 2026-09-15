const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const ENTITIES = {
  categorias: {
    table: 'Categoria',
    pk: 'id_categoria',
    cols: ['nome', 'descricao'],
  },
  fabricantes: {
    table: 'Fabricante',
    pk: 'id_fabricante',
    cols: ['nome', 'cnpj', 'telefone', 'email'],
  },
  fornecedores: {
    table: 'Fornecedor',
    pk: 'id_fornecedor',
    cols: ['razao_social', 'nome_fantasia', 'cnpj', 'telefone', 'email', 'endereco'],
  },
  clientes: {
    table: 'Cliente',
    pk: 'id_cliente',
    cols: ['nome', 'cpf', 'data_nascimento', 'telefone', 'email', 'endereco'],
  },
  funcionarios: {
    table: 'Funcionario',
    pk: 'id_funcionario',
    cols: ['nome', 'cpf', 'cargo', 'salario', 'telefone', 'email', 'data_admissao'],
  },
  estoque: {
    table: 'EstoqueLote',
    pk: 'id_lote',
    cols: ['id_produto', 'numero_lote', 'quantidade', 'preco_custo', 'data_fabricacao', 'data_validade'],
  },
  receitas: {
    table: 'Receita',
    pk: 'id_receita',
    cols: ['id_venda', 'id_produto', 'nome_medico', 'crm_medico', 'uf_crm', 'data_emissao', 'observacao'],
  },
};

function errMessage(e) {
  if (e.code === 'ER_ROW_IS_REFERENCED_2') {
    return { status: 409, msg: 'Registro em uso por outra tabela - exclusão bloqueada' };
  }
  if (e.code === 'ER_DUP_ENTRY') {
    return { status: 409, msg: 'Valor duplicado em campo com restrição UNIQUE' };
  }
  if (e.code && e.code.startsWith('ER_CHECK')) {
    return { status: 400, msg: 'Dados violam uma restrição CHECK do banco' };
  }
  return { status: 400, msg: e.message };
}

function registerCrud(entity, config) {
  const listSql =
    config.listSql ||
    `SELECT * FROM ${config.table} ORDER BY ${config.pk} DESC`;

  app.get(`/api/${entity}`, async (req, res) => {
    try {
      const [rows] = await pool.query(listSql);
      res.json(rows);
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
  });

  app.get(`/api/${entity}/:id`, async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM ${config.table} WHERE ${config.pk} = ?`,
        [req.params.id]
      );
      if (!rows.length) return res.status(404).json({ erro: 'Não encontrado' });
      res.json(rows[0]);
    } catch (e) {
      res.status(500).json({ erro: e.message });
    }
  });

  app.post(`/api/${entity}`, async (req, res) => {
    const body = {};
    config.cols.forEach((c) => {
      if (req.body[c] !== undefined) body[c] = req.body[c];
    });
    const cols = Object.keys(body);
    if (!cols.length) return res.status(400).json({ erro: 'Nenhum dado informado' });
    try {
      const qmarks = cols.map(() => '?').join(', ');
      const [result] = await pool.query(
        `INSERT INTO ${config.table} (${cols.join(', ')}) VALUES (${qmarks})`,
        cols.map((c) => body[c])
      );
      res.status(201).json({ id: result.insertId });
    } catch (e) {
      const r = errMessage(e);
      res.status(r.status).json({ erro: r.msg });
    }
  });

  app.put(`/api/${entity}/:id`, async (req, res) => {
    const body = {};
    config.cols.forEach((c) => {
      if (req.body[c] !== undefined) body[c] = req.body[c];
    });
    const cols = Object.keys(body);
    if (!cols.length) return res.status(400).json({ erro: 'Nenhum dado informado' });
    try {
      const sets = cols.map((c) => `${c} = ?`).join(', ');
      const [result] = await pool.query(
        `UPDATE ${config.table} SET ${sets} WHERE ${config.pk} = ?`,
        [...cols.map((c) => body[c]), req.params.id]
      );
      res.json({ atualizados: result.affectedRows });
    } catch (e) {
      const r = errMessage(e);
      res.status(r.status).json({ erro: r.msg });
    }
  });

  app.delete(`/api/${entity}/:id`, async (req, res) => {
    try {
      const [result] = await pool.query(
        `DELETE FROM ${config.table} WHERE ${config.pk} = ?`,
        [req.params.id]
      );
      res.json({ excluidos: result.affectedRows });
    } catch (e) {
      const r = errMessage(e);
      res.status(r.status).json({ erro: r.msg });
    }
  });
}

Object.entries(ENTITIES).forEach(([entity, config]) => registerCrud(entity, config));

// Produto com JOINs para exibir nomes das tabelas relacionadas
registerCrud('produtos', {
  table: 'Produto',
  pk: 'id_produto',
  cols: ['nome', 'apresentacao', 'id_categoria', 'id_fabricante', 'id_fornecedor', 'preco_venda', 'receita_controlada', 'status'],
  listSql: `SELECT p.id_produto, p.nome, p.apresentacao, p.id_categoria, p.id_fabricante,
                   p.id_fornecedor, p.preco_venda, p.receita_controlada, p.status,
                   c.nome AS categoria, f.nome AS fabricante, fo.nome_fantasia AS fornecedor
              FROM Produto p
              JOIN Categoria c  ON c.id_categoria  = p.id_categoria
              JOIN Fabricante f ON f.id_fabricante = p.id_fabricante
              JOIN Fornecedor fo ON fo.id_fornecedor = p.id_fornecedor
             ORDER BY p.id_produto DESC`,
});

// Venda: listagem com nome do cliente e funcionario
registerCrud('vendas', {
  table: 'Venda',
  pk: 'id_venda',
  cols: ['id_cliente', 'id_funcionario', 'forma_pagamento', 'desconto', 'total'],
  listSql: `SELECT v.id_venda, v.data_hora, v.forma_pagamento, v.desconto, v.total,
                   c.id_cliente, c.nome AS cliente, f.id_funcionario, f.nome AS funcionario
              FROM Venda v
              JOIN Cliente c    ON c.id_cliente    = v.id_cliente
              JOIN Funcionario f ON f.id_funcionario = v.id_funcionario
             ORDER BY v.id_venda DESC`,
});

// Detalhe da venda: itens + receita vinculada
app.get('/api/vendas/:id/detalhe', async (req, res) => {
  try {
    const id = req.params.id;
    const [venda] = await pool.query(
      `SELECT v.*, c.nome AS cliente, f.nome AS funcionario
         FROM Venda v
         JOIN Cliente c ON c.id_cliente = v.id_cliente
         JOIN Funcionario f ON f.id_funcionario = v.id_funcionario
        WHERE v.id_venda = ?`,
      [id]
    );
    if (!venda.length) return res.status(404).json({ erro: 'Venda não encontrada' });
    const [itens] = await pool.query(
      `SELECT i.*, p.nome AS produto
         FROM ItemVenda i JOIN Produto p ON p.id_produto = i.id_produto
        WHERE i.id_venda = ?`,
      [id]
    );
    const [receita] = await pool.query(
      `SELECT * FROM Receita WHERE id_venda = ?`,
      [id]
    );
    res.json({ ...venda[0], itens, receita: receita[0] || null });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// Registro transacional de venda (Venda + ItemVenda + baixa em EstoqueLote [+ Receita])
app.post('/api/vendas/registrar', async (req, res) => {
  const { id_cliente, id_funcionario, forma_pagamento, desconto = 0, itens = [] } = req.body;
  if (!id_cliente || !id_funcionario || !forma_pagamento || !itens.length) {
    return res.status(400).json({ erro: 'Cliente, funcionário, forma de pagamento e itens são obrigatórios' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const itensProcessados = [];
    let total = 0;
    let produtoControlado = null;

    for (const item of itens) {
      const qtd = Number(item.quantidade);
      if (!item.id_produto || !qtd || qtd <= 0) {
        throw { custom: 'Quantidade inválida para um dos itens' };
      }

      const [prod] = await conn.query(
        `SELECT id_produto, nome, preco_venda, receita_controlada, status FROM Produto WHERE id_produto = ?`,
        [item.id_produto]
      );
      if (!prod.length) throw { custom: 'Produto não encontrado' };
      if (prod[0].status !== 'ativo') throw { custom: `Produto inativo: ${prod[0].nome}` };

      if (prod[0].receita_controlada) produtoControlado = prod[0];

      const [lote] = await conn.query(
        `SELECT id_lote, quantidade FROM EstoqueLote
          WHERE id_produto = ? AND quantidade >= ? AND data_validade >= CURDATE()
          ORDER BY data_validade LIMIT 1`,
        [item.id_produto, qtd]
      );
      if (!lote.length) throw { custom: `Estoque insuficiente para: ${prod[0].nome}` };

      const subtotal = prod[0].preco_venda * qtd;
      total += subtotal;

      await conn.query(
        `UPDATE EstoqueLote SET quantidade = quantidade - ? WHERE id_lote = ?`,
        [qtd, lote[0].id_lote]
      );
      itensProcessados.push({
        id_produto: item.id_produto,
        quantidade: qtd,
        preco_unitario: prod[0].preco_venda,
        subtotal: Number(subtotal.toFixed(2)),
      });
    }

    total = Number((total - Number(desconto)).toFixed(2));
    if (total < 0) throw { custom: 'Desconto maior que o total da venda' };

    const [vendaResult] = await conn.query(
      `INSERT INTO Venda (id_cliente, id_funcionario, forma_pagamento, desconto, total) VALUES (?, ?, ?, ?, ?)`,
      [id_cliente, id_funcionario, forma_pagamento, Number(desconto), total]
    );
    const idVenda = vendaResult.insertId;

    for (const item of itensProcessados) {
      await conn.query(
        `INSERT INTO ItemVenda (id_venda, id_produto, quantidade, preco_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [idVenda, item.id_produto, item.quantidade, item.preco_unitario, item.subtotal]
      );
    }

    if (produtoControlado) {
      const r = req.body.receita;
      if (!r || !r.nome_medico || !r.crm_medico || !r.uf_crm || !r.data_emissao) {
        throw { custom: `Produto controlado exige receita: ${produtoControlado.nome}` };
      }
      await conn.query(
        `INSERT INTO Receita (id_venda, id_produto, nome_medico, crm_medico, uf_crm, data_emissao, observacao)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [idVenda, produtoControlado.id_produto, r.nome_medico, r.crm_medico, r.uf_crm, r.data_emissao, r.observacao || null]
      );
    }

    await conn.commit();
    res.status(201).json({ id_venda: idVenda, total });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ erro: e.custom || e.message });
  } finally {
    conn.release();
  }
});

// Relatórios
app.get('/api/relatorios/estoque-baixo', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id_produto, p.nome, COALESCE(SUM(e.quantidade), 0) AS estoque_total
         FROM Produto p
         LEFT JOIN EstoqueLote e ON e.id_produto = p.id_produto AND e.data_validade >= CURDATE()
        GROUP BY p.id_produto, p.nome
        HAVING estoque_total < 20
        ORDER BY estoque_total ASC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/api/relatorios/validade-proxima', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.id_lote, e.numero_lote, e.quantidade, e.data_validade, p.nome AS produto
         FROM EstoqueLote e JOIN Produto p ON p.id_produto = e.id_produto
        WHERE e.data_validade BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
        ORDER BY e.data_validade ASC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

app.get('/api/relatorios/vendas-periodo', async (req, res) => {
  const { de, ate } = req.query;
  if (!de || !ate) return res.status(400).json({ erro: 'Informe ?de=YYYY-MM-DD&ate=YYYY-MM-DD' });
  try {
    const [rows] = await pool.query(
      `SELECT DATE(v.data_hora) AS dia, COUNT(*) AS vendas, SUM(v.total) AS faturamento
         FROM Venda v
        WHERE DATE(v.data_hora) BETWEEN ? AND ?
        GROUP BY DATE(v.data_hora)
        ORDER BY dia ASC`,
      [de, ate]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API da farmácia rodando em http://localhost:${PORT}`);
});