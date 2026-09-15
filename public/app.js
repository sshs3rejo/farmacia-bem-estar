/* Farmácia Bem-Estar — frontend (vanilla JS + fetch) */
/* exported editarCliente, excluirCliente, editarProduto, excluirProduto, verVenda */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const brl = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

async function api(url, options = {}) {
  const opts = { headers: { 'Content-Type': 'application/json' }, ...options };
  if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
  const res = await fetch(url, opts);
  let data = null;
  try { data = await res.json(); } catch (_) { /* sem corpo JSON */ }
  if (!res.ok) throw new Error(data?.erro || `Erro HTTP ${res.status}`);
  return data;
}

/* ---------------- Navegação ---------------- */
$$('#nav button').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('#nav button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    $$('.tab').forEach((t) => t.classList.remove('active'));
    const target = btn.dataset.tab;
    $(`#tab-${target}`).classList.add('active');
    carregar(target);
  });
});

function carregar(tab) {
  if (tab === 'vendas') carregarVendas();
  if (tab === 'clientes') carregarClientes();
  if (tab === 'produtos') carregarProdutos();
  if (tab === 'catalogo') carregarCatalogo();
  if (tab === 'funcionarios') carregarFuncionarios();
  if (tab === 'estoque') carregarEstoque();
  if (tab === 'receitas') carregarReceitas();
  if (tab === 'relatorios') carregarRelatorios();
}

/* ---------------- Message helpers ---------------- */
function msg(el, texto, tipo = 'ok') {
  el.textContent = texto;
  el.className = `msg ${tipo}`;
  setTimeout(() => { el.textContent = ''; el.className = 'msg'; }, 4000);
}

/* ==================== CLIENTES (CRUD) ==================== */
async function carregarClientes() {
  const dados = await api('/api/clientes');
  const tbody = $('#tbl-clientes tbody');
  tbody.innerHTML = dados.map((c) => `
    <tr>
      <td>${c.id_cliente}</td>
      <td>${esc(c.nome)}</td>
      <td>${esc(c.cpf)}</td>
      <td>${esc(c.data_nascimento || '')}</td>
      <td>${esc(c.telefone || '')}</td>
      <td>${esc(c.email || '')}</td>
      <td>${esc(c.endereco || '')}</td>
      <td>
        <button class="ghost" onclick="editarCliente(${c.id_cliente})">Editar</button>
        <button class="danger" onclick="excluirCliente(${c.id_cliente})">Excluir</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="8">Nenhum cliente cadastrado.</td></tr>';
}

async function editarCliente(id) {
  const c = await api(`/api/clientes/${id}`);
  $('#cliente-id').value = c.id_cliente;
  $('#cliente-nome').value = c.nome;
  $('#cliente-cpf').value = c.cpf;
  $('#cliente-nasc').value = c.data_nascimento || '';
  $('#cliente-tel').value = c.telefone || '';
  $('#cliente-email').value = c.email || '';
  $('#cliente-end').value = c.endereco || '';
  $('#form-cliente').scrollIntoView({ behavior: 'smooth' });
}

async function excluirCliente(id) {
  if (!confirm('Excluir este cliente?')) return;
  try {
    await api(`/api/clientes/${id}`, { method: 'DELETE' });
    carregarClientes();
  } catch (e) {
    alert(e.message);
  }
}

$('#btn-salvar-cliente').addEventListener('click', async () => {
  const body = {
    nome: $('#cliente-nome').value.trim(),
    cpf: $('#cliente-cpf').value.trim(),
    data_nascimento: $('#cliente-nasc').value || null,
    telefone: $('#cliente-tel').value.trim() || null,
    email: $('#cliente-email').value.trim() || null,
    endereco: $('#cliente-end').value.trim() || null,
  };
  const id = $('#cliente-id').value;
  try {
    if (id) {
      await api(`/api/clientes/${id}`, { method: 'PUT', body });
      msg($('#msg-cliente'), 'Cliente atualizado.', 'ok');
    } else {
      await api('/api/clientes', { method: 'POST', body });
      msg($('#msg-cliente'), 'Cliente cadastrado.', 'ok');
    }
    $('#btn-limpar-cliente').click();
    carregarClientes();
  } catch (e) {
    msg($('#msg-cliente'), e.message, 'erro');
  }
});

$('#btn-limpar-cliente').addEventListener('click', () => {
  $('#form-cliente').reset();
  $('#cliente-id').value = '';
});

/* ==================== PRODUTOS (CRUD) ==================== */
let cacheSeletores = null;

async function preencherSeletoresProduto() {
  const [categorias, fabricantes, fornecedores] = await Promise.all([
    api('/api/categorias'),
    api('/api/fabricantes'),
    api('/api/fornecedores'),
  ]);
  cacheSeletores = { categorias, fabricantes, fornecedores };
  $('#produto-cat').innerHTML = categorias.map((c) => `<option value="${c.id_categoria}">${esc(c.nome)}</option>`).join('');
  $('#produto-fab').innerHTML = fabricantes.map((f) => `<option value="${f.id_fabricante}">${esc(f.nome)}</option>`).join('');
  $('#produto-forn').innerHTML = fornecedores.map((f) => `<option value="${f.id_fornecedor}">${esc(f.nome_fantasia || f.razao_social)}</option>`).join('');
}

async function carregarProdutos() {
  if (!cacheSeletores) await preencherSeletoresProduto();
  const dados = await api('/api/produtos');
  $('#tbl-produtos tbody').innerHTML = dados.map((p) => `
    <tr>
      <td>${p.id_produto}</td>
      <td>${esc(p.nome)}</td>
      <td>${esc(p.apresentacao || '')}</td>
      <td>${esc(p.categoria)}</td>
      <td>${esc(p.fabricante)}</td>
      <td>${brl(p.preco_venda)}</td>
      <td>${p.receita_controlada ? 'Sim' : 'Não'}</td>
      <td>${esc(p.status)}</td>
      <td>
        <button class="ghost" onclick="editarProduto(${p.id_produto})">Editar</button>
        <button class="danger" onclick="excluirProduto(${p.id_produto})">Excluir</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="9">Nenhum produto cadastrado.</td></tr>';
}

async function editarProduto(id) {
  const p = await api(`/api/produtos/${id}`);
  $('#produto-id').value = p.id_produto;
  $('#produto-nome').value = p.nome;
  $('#produto-apes').value = p.apresentacao || '';
  $('#produto-cat').value = p.id_categoria;
  $('#produto-fab').value = p.id_fabricante;
  $('#produto-forn').value = p.id_fornecedor;
  $('#produto-preco').value = p.preco_venda;
  $('#produto-controlado').checked = !!p.receita_controlada;
  $('#produto-status').value = p.status;
  $('#form-produto').scrollIntoView({ behavior: 'smooth' });
}

async function excluirProduto(id) {
  if (!confirm('Excluir este produto?')) return;
  try {
    await api(`/api/produtos/${id}`, { method: 'DELETE' });
    carregarProdutos();
  } catch (e) {
    alert(e.message);
  }
}

$('#btn-salvar-produto').addEventListener('click', async () => {
  const body = {
    nome: $('#produto-nome').value.trim(),
    apresentacao: $('#produto-apes').value.trim() || null,
    id_categoria: Number($('#produto-cat').value),
    id_fabricante: Number($('#produto-fab').value),
    id_fornecedor: Number($('#produto-forn').value),
    preco_venda: Number($('#produto-preco').value),
    receita_controlada: $('#produto-controlado').checked ? 1 : 0,
    status: $('#produto-status').value,
  };
  const id = $('#produto-id').value;
  try {
    if (id) {
      await api(`/api/produtos/${id}`, { method: 'PUT', body });
      msg($('#msg-produto'), 'Produto atualizado.', 'ok');
    } else {
      await api('/api/produtos', { method: 'POST', body });
      msg($('#msg-produto'), 'Produto cadastrado.', 'ok');
    }
    $('#btn-limpar-produto').click();
    carregarProdutos();
  } catch (e) {
    msg($('#msg-produto'), e.message, 'erro');
  }
});

$('#btn-limpar-produto').addEventListener('click', () => {
  $('#form-produto').reset();
  $('#produto-id').value = '';
  $('#produto-controlado').checked = false;
});

/* ==================== LISTAS SIMPLES ==================== */
async function carregarCatalogo() {
  await Promise.all(['categorias', 'fabricantes', 'fornecedores'].map(renderSimples));
}

async function renderSimples(tipo) {
  const rows = await api(`/api/${tipo}`);
  const mapas = {
    categorias: ['id_categoria', 'nome', 'descricao'],
    fabricantes: ['id_fabricante', 'nome', 'cnpj', 'telefone', 'email'],
    fornecedores: ['id_fornecedor', 'razao_social', 'nome_fantasia', 'cnpj', 'telefone', 'email'],
  };
  const campos = mapas[tipo];
  $('#tbl-' + tipo + ' tbody').innerHTML = rows.map((r) =>
    '<tr>' + campos.map((c) => `<td>${esc(r[c])}</td>`).join('') + '</tr>'
  ).join('');
}

async function carregarFuncionarios() {
  const rows = await api('/api/funcionarios');
  $('#tbl-funcionarios tbody').innerHTML = rows.map((f) => `
    <tr>
      <td>${f.id_funcionario}</td><td>${esc(f.nome)}</td><td>${esc(f.cpf)}</td>
      <td>${esc(f.cargo)}</td><td>${brl(f.salario)}</td><td>${esc(f.telefone || '')}</td>
      <td>${esc(f.data_admissao || '')}</td>
    </tr>`).join('') || '<tr><td colspan="7">Sem registros.</td></tr>';
}

async function carregarEstoque() {
  const rows = await api('/api/estoque');
  const produtos = await api('/api/produtos');
  const nomes = Object.fromEntries(produtos.map((p) => [p.id_produto, p.nome]));
  $('#tbl-estoque tbody').innerHTML = rows.map((e) => `
    <tr>
      <td>${e.id_lote}</td><td>${esc(nomes[e.id_produto] || e.id_produto)}</td><td>${esc(e.numero_lote)}</td>
      <td>${e.quantidade}</td><td>${brl(e.preco_custo)}</td>
      <td>${esc(e.data_fabricacao)}</td><td>${esc(e.data_validade)}</td>
    </tr>`).join('') || '<tr><td colspan="7">Sem registros.</td></tr>';
}

async function carregarReceitas() {
  const rows = await api('/api/receitas');
  const [produtos, vendas] = await Promise.all([api('/api/produtos'), api('/api/vendas')]);
  const nomeProd = Object.fromEntries(produtos.map((p) => [p.id_produto, p.nome]));
  const clienteVenda = Object.fromEntries(vendas.map((v) => [v.id_venda, v.cliente]));
  $('#tbl-receitas tbody').innerHTML = rows.map((r) => `
    <tr>
      <td>${r.id_receita}</td><td>${esc(clienteVenda[r.id_venda] || r.id_venda)}</td>
      <td>${esc(nomeProd[r.id_produto] || r.id_produto)}</td>
      <td>${esc(r.nome_medico)}</td><td>${esc(r.crm_medico)} - ${esc(r.uf_crm)}</td>
      <td>${esc(r.data_emissao)}</td><td>${esc(r.observacao || '')}</td>
    </tr>`).join('') || '<tr><td colspan="7">Sem registros.</td></tr>';
}

async function carregarRelatorios() {
  const baixo = await api('/api/relatorios/estoque-baixo');
  $('#tbl-rel-estoque tbody').innerHTML = baixo.map((r) =>
    `<tr><td>${esc(r.nome)}</td><td>${r.estoque_total}</td></tr>`).join('')
    || '<tr><td colspan="2">Nenhum produto abaixo do limite.</td></tr>';

  const validade = await api('/api/relatorios/validade-proxima');
  $('#tbl-rel-validade tbody').innerHTML = validade.map((r) =>
    `<tr><td>${esc(r.numero_lote)}</td><td>${esc(r.produto)}</td><td>${r.quantidade}</td><td>${esc(r.data_validade)}</td></tr>`).join('')
    || '<tr><td colspan="4">Nenhum lote próximo de validade.</td></tr>';

  if (!$('#btn-rel-periodo').dataset.vinculado) {
    $('#btn-rel-periodo').addEventListener('click', consultarVendasPeriodo);
    $('#btn-rel-periodo').dataset.vinculado = '1';
  }
  $('#rel-de').value = '2026-09-10';
  $('#rel-ate').value = '2026-09-13';
  await consultarVendasPeriodo();
}

async function consultarVendasPeriodo() {
  const de = $('#rel-de').value;
  const ate = $('#rel-ate').value;
  if (!de || !ate) return;
  const rows = await api(`/api/relatorios/vendas-periodo?de=${de}&ate=${ate}`);
  $('#tbl-rel-vendas tbody').innerHTML = rows.map((r) =>
    `<tr><td>${esc(r.dia)}</td><td>${r.vendas}</td><td>${brl(r.faturamento)}</td></tr>`).join('')
    || '<tr><td colspan="3">Nenhuma venda no período.</td></tr>';
}

/* ==================== VENDAS ==================== */
let produtosGlobais = [];
let vfSeletoresCarregados = false;

async function carregarVendas() {
  const [vendas, produtos] = await Promise.all([api('/api/vendas'), api('/api/produtos')]);
  produtosGlobais = produtos;
  $('#tbl-vendas tbody').innerHTML = vendas.map((v) => `
    <tr>
      <td>${v.id_venda}</td><td>${esc(v.data_hora)}</td><td>${esc(v.cliente)}</td>
      <td>${esc(v.funcionario)}</td><td>${esc(v.forma_pagamento)}</td>
      <td>${brl(v.desconto)}</td><td><strong>${brl(v.total)}</strong></td>
      <td><button class="ghost" onclick="verVenda(${v.id_venda})">Detalhe</button></td>
    </tr>`).join('') || '<tr><td colspan="8">Nenhuma venda registrada.</td></tr>';
}

function painelVendas(modo) {
  $('#venda-form').classList.toggle('hidden', modo !== 'form');
  $('#venda-detalhe').classList.toggle('hidden', modo !== 'detalhe');
  $('#vendas-painel').classList.toggle('hidden', modo !== 'lista');
  $('#btn-nova-venda').classList.toggle('hidden', modo === 'form');
  $('#btn-voltar-vendas').classList.toggle('hidden', modo === 'lista');
}

$('#btn-nova-venda').addEventListener('click', iniciarNovaVenda);
$('#btn-voltar-vendas').addEventListener('click', () => painelVendas('lista'));
$('#btn-cancelar-venda').addEventListener('click', () => painelVendas('lista'));

async function iniciarNovaVenda() {
  painelVendas('form');
  if (!vfSeletoresCarregados) {
    const [clientes, funcionarios] = await Promise.all([api('/api/clientes'), api('/api/funcionarios')]);
    $('#vf-cliente').innerHTML = clientes.map((c) => `<option value="${c.id_cliente}">${esc(c.nome)}</option>`).join('');
    $('#vf-funcionario').innerHTML = funcionarios.map((f) => `<option value="${f.id_funcionario}">${esc(f.nome)} — ${esc(f.cargo)}</option>`).join('');
    vfSeletoresCarregados = true;
  }
  $('#vf-itens').innerHTML = '';
  addLinhaItem();
  $('#vf-mensagem').textContent = '';
}

function addLinhaItem() {
  const div = document.createElement('div');
  div.className = 'item-linha';
  div.innerHTML = `
    <label>Produto
      <select class="item-produto">${produtosGlobais.map((p) =>
        `<option value="${p.id_produto}" data-preco="${p.preco_venda}" ${p.receita_controlada ? 'data-controlado="1"' : ''}>${esc(p.nome)} — ${brl(p.preco_venda)}</option>`).join('')}
      </select>
    </label>
    <label>Qtd
      <input type="number" class="item-qtd" min="1" value="1">
    </label>
    <button type="button" class="ghost item-remove">Remover</button>`;
  $('#vf-itens').appendChild(div);
  div.querySelector('.item-remove').addEventListener('click', () => {
    div.remove();
    recalcularTotal();
  });
  div.querySelector('.item-produto').addEventListener('change', recalcularTotal);
  div.querySelector('.item-qtd').addEventListener('input', recalcularTotal);
  recalcularTotal();
}

$('#btn-add-item').addEventListener('click', addLinhaItem);

function recalcularTotal() {
  let total = 0;
  let temControlado = false;
  $$('#vf-itens .item-linha').forEach((linha) => {
    const sel = linha.querySelector('.item-produto');
    const opcao = sel.options[sel.selectedIndex];
    const preco = Number(opcao?.dataset.preco || 0);
    const qtd = Number(linha.querySelector('.item-qtd').value || 0);
    total += preco * qtd;
    if (opcao?.dataset.controlado === '1') temControlado = true;
  });
  total -= Number($('#vf-desconto').value || 0);
  $('#vf-total').textContent = brl(Math.max(total, 0));
  $('#vf-receita').classList.toggle('hidden', !temControlado);
}

$('#vf-desconto').addEventListener('input', recalcularTotal);

function lerLinhas() {
  const itens = [];
  $$('#vf-itens .item-linha').forEach((linha) => {
    const idProduto = Number(linha.querySelector('.item-produto').value);
    const quantidade = Number(linha.querySelector('.item-qtd').value);
    if (idProduto && quantidade > 0) itens.push({ id_produto: idProduto, quantidade });
  });
  return itens;
}

$('#btn-confirmar-venda').addEventListener('click', async () => {
  const itens = lerLinhas();
  if (!itens.length) return msg($('#vf-mensagem'), 'Adicione ao menos um item.', 'erro');

  const body = {
    id_cliente: Number($('#vf-cliente').value),
    id_funcionario: Number($('#vf-funcionario').value),
    forma_pagamento: $('#vf-pagamento').value,
    desconto: Number($('#vf-desconto').value || 0),
    itens,
  };

  if (!$('#vf-receita').classList.contains('hidden')) {
    body.receita = {
      nome_medico: $('#vf-nome-medico').value.trim(),
      crm_medico: $('#vf-crm-medico').value.trim(),
      uf_crm: $('#vf-uf-crm').value.trim().toUpperCase(),
      data_emissao: $('#vf-data-emissao').value,
      observacao: $('#vf-obs-receita').value.trim() || null,
    };
    if (!body.receita.nome_medico || !body.receita.crm_medico || !body.receita.uf_crm || !body.receita.data_emissao) {
      return msg($('#vf-mensagem'), 'Preencha todos os dados da receita.', 'erro');
    }
  }

  try {
    const r = await api('/api/vendas/registrar', { method: 'POST', body });
    msg($('#vf-mensagem'), `Venda #${r.id_venda} registrada — Total ${brl(r.total)}.`, 'ok');
    setTimeout(() => { painelVendas('lista'); carregarVendas(); }, 900);
  } catch (e) {
    msg($('#vf-mensagem'), e.message, 'erro');
  }
});

async function verVenda(id) {
  painelVendas('detalhe');
  const v = await api(`/api/vendas/${id}/detalhe`);
  $('#vd-titulo').textContent = `Venda #${v.id_venda}`;
  $('#vd-corpo').innerHTML = `
    <p><strong>Cliente:</strong> ${esc(v.cliente)} · <strong>Atendente:</strong> ${esc(v.funcionario)}</p>
    <p><strong>Data/Hora:</strong> ${esc(v.data_hora)} · <strong>Pagamento:</strong> ${esc(v.forma_pagamento)}</p>
    <table>
      <thead><tr><th>Produto</th><th>Qtd</th><th>Preço unit.</th><th>Subtotal</th></tr></thead>
      <tbody>${v.itens.map((i) => `
        <tr><td>${esc(i.produto)}</td><td>${i.quantidade}</td><td>${brl(i.preco_unitario)}</td><td>${brl(i.subtotal)}</td></tr>`).join('')}
      </tbody>
    </table>
    <p><strong>Desconto:</strong> ${brl(v.desconto)}</p>
    <p><strong>Total:</strong> ${brl(v.total)}</p>
    ${v.receita ? `<p><strong>Receita:</strong> ${esc(v.receita.nome_medico)} — ${esc(v.receita.crm_medico)}/${esc(v.receita.uf_crm)} (${esc(v.receita.data_emissao)})</p>` : ''}
    <button class="ghost" onclick="painelVendas('lista')">Voltar</button>`;
}