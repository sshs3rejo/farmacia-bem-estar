-- =====================================================
-- Farmácia Bem-Estar — Programação em Banco de Dados
-- Farmácia fictícia - seed.sql (DML)
-- Dados ficticios para demonstracao
-- =====================================================

USE farmacia_db;

-- ---------- CATEGORIA ----------
INSERT INTO Categoria (nome, descricao) VALUES
  ('Analgésico',              'Alívio de dores'),
  ('Antitérmico',             'Redução de febre'),
  ('Antibiótico',             'Medicamentos antibacterianos'),
  ('Antialérgico',            'Medicamentos para alergias'),
  ('Cardiovascular',          'Medicamentos para o coração e pressão'),
  ('Dermatológico',           'Cuidados com a pele'),
  ('Higiene Pessoal',         'Produtos de higiene'),
  ('Vitaminas e Suplementos', 'Suplementos vitamínicos'),
  ('Gastrointestinal',        'Medicamentos para o sistema digestivo'),
  ('Anti-inflamatório',       'Redução de inflamações'),
  ('Ansiolítico e Sedativo',  'Medicamentos controlados do SNC');

-- ---------- FABRICANTE ----------
INSERT INTO Fabricante (nome, cnpj, telefone, email) VALUES
  ('EMS S/A',                  '57050738000162', '1138857000',   'contato@ems.com.br'),
  ('Eurofarma',                '61430085000146', '1134359700',   'contato@eurofarma.com.br'),
  ('Aché Laboratórios',        '60972022000195', '1125656000',   'falecom@ache.com.br'),
  ('Medley Farmacêutica',      '47976208000175', '1125579000',  'atendimento@medley.com.br'),
  ('Biolab Sanus',             '61739993000164', '1170850000',   'contato@biolab.com.br'),
  ('Mantecorp Indústria',      '60889333000193', '1137154000',   'atendimento@mantecorp.com.br'),
  ('Teuto Brasileiro',         '17093887000140', '6232737000',   'contato@teuto.com.br'),
  ('Hypera Pharma',            '02325702000126', '1142211800',   'contato@hypera.com.br'),
  ('Libbs Farmacêutica',       '61394976000109', '1113727500',   'contato@libbs.com.br'),
  ('Novartis Biociências',     '56822819000127', '1244700000',   'contato@novartis.com.br');

-- ---------- FORNECEDOR ----------
INSERT INTO Fornecedor (razao_social, nome_fantasia, cnpj, telefone, email, endereco) VALUES
  ('Profarma Distribuidora de Produtos Farmacêuticos Ltda', 'Profarma',   '02984053000105', '6113448000', 'compras@profarma.com.br',      'Setor de Distribuição, Brasília - DF'),
  ('Santa Cruz Distribuidora S.A.',                         'Santa Cruz', '33918505000104', '1135888000', 'vendas@santacruz.com.br',      'Estrada Velha, Campinas - SP'),
  ('Hipofarma Distribuidora Ltda',                          'Hipofarma',  '03866673000100', '7151841000', 'contato@hipofarma.com.br',     'Av. das Nações, Goiânia - GO'),
  ('Farmadelivery Comércio de Medicamentos S.A.',           'Farmadelivery', '11217015000158', '1140028922', 'pedidos@farmadelivery.com.br', 'Rua dos Anjos, São Paulo - SP');

-- ---------- CLIENTE ----------
INSERT INTO Cliente (nome, cpf, data_nascimento, telefone, email, endereco) VALUES
  ('João Carlos Pereira',   '41234856790', '1985-03-14', '99988123456', 'joao.pereira@email.com',     'Rua das Flores, 120, São Luís - MA'),
  ('Maria Aparecida Santos','47890123456', '1992-07-22', '99977451288', 'maria.santos@email.com',     'Av. Litorânea, 45, São Luís - MA'),
  ('Roberto Ferreira Lima', '53129876109', '1978-11-03', '99985663210', 'roberto.lima@email.com',     'Rua Grande, 800, São Luís - MA'),
  ('Camila Oliveira Souza', '29876543120', '2000-01-30', '99982291147', 'camila.souza@email.com',     'Rua do Sol, 33, São Luís - MA'),
  ('Paulo Henrique Rocha',  '14567320981', '1995-09-17', '99990884412', 'paulo.rocha@email.com',      'Rua das Palmeiras, 210, São Luís - MA'),
  ('Fernanda Costa Brito',  '48912673509', '1988-05-08', '99986551190', 'fernanda.brito@email.com',   'Av. dos Holandeses, 504, São Luís - MA'),
  ('Lucas Almeida Nunes',   '32675901847', '2003-12-25', '99984175560', 'lucas.nunes@email.com',      'Rua Olavo Bilac, 98, São Luís - MA'),
  ('Beatriz Ramos Tavares', '56789012345', '1990-02-14', '99985562133', 'beatriz.tavares@email.com',  'Rua do Alecrim, 15, São Luís - MA');

-- ---------- FUNCIONARIO ----------
INSERT INTO Funcionario (nome, cpf, cargo, salario, telefone, email, data_admissao) VALUES
  ('Ana Paula Souza Júnior', '12987654321', 'gerente',      4200.00, '98981110001', 'ana.souza@farmacia.com.br', '2020-02-10'),
  ('Bruno Martins Lima',     '23456789012', 'atendente',    1518.00, '98982220002', 'bruno.lima@farmacia.com.br', '2023-05-15'),
  ('Carla Regina Mendes',    '34567890123', 'farmaceutico', 3200.00, '98983330003', 'carla.mendes@farmacia.com.br', '2021-08-01'),
  ('Diego Albuquerque Rocha','45678901234', 'farmaceutico', 3450.00, '98984440004', 'diego.rocha@farmacia.com.br', '2019-11-20'),
  ('Elisa de Farias Ramos',  '56789012345', 'caixa',        1620.00, '98985550005', 'elisa.farias@farmacia.com.br', '2024-01-09');

-- ---------- PRODUTO ----------
INSERT INTO Produto (nome, apresentacao, id_categoria, id_fabricante, id_fornecedor, preco_venda, receita_controlada, status) VALUES
  ('Paracetamol 750mg',       '20 comprimidos',        1,  4,  1,  8.90, 0, 'ativo'),
  ('Dipirona Sódica 500mg',   '10 comprimidos',        1,  1,  2,  4.50, 0, 'ativo'),
  ('Dipirona Sódica 500mg/mL','Gotas - 20mL',          2,  1,  2,  6.75, 0, 'ativo'),
  ('Ibuprofeno 600mg',        '20 comprimidos',       10,  2,  3, 12.75, 0, 'ativo'),
  ('Amoxicilina 500mg',       '21 cápsulas',           3,  7,  4, 18.30, 0, 'ativo'),
  ('Loratadina 10mg',         '12 comprimidos',        4,  4,  1, 11.20, 0, 'ativo'),
  ('Losartana Potássica 50mg','30 comprimidos',        5,  5,  3,  9.40, 0, 'ativo'),
  ('Vitamina C 1g',           '10 comprimidos efervescentes', 8,  8,  2, 15.90, 0, 'ativo'),
  ('Protetor Solar FPS 50',   'Loção - 60g',           6,  6,  1, 42.90, 0, 'ativo'),
  ('Álcool Gel 70%',          'Frasco - 500mL',        7,  7,  4,  9.99, 0, 'ativo'),
  ('Omeprazol 20mg',          '14 cápsulas',           9,  9,  3, 13.50, 0, 'ativo'),
  ('Clonazepam 2mg',          '30 comprimidos',       11,  3,  2, 21.75, 1, 'ativo'),
  ('Metilfenidato 10mg',      '30 comprimidos',       11, 10,  1, 48.30, 1, 'ativo');

-- ---------- ESTOQUE_LOTE ----------
INSERT INTO EstoqueLote (id_produto, numero_lote, quantidade, preco_custo, data_fabricacao, data_validade) VALUES
  ( 1, 'L240718A', 120, 5.10, '2024-07-01', '2027-07-01'),
  ( 2, 'L240812B',  80, 2.30, '2024-08-01', '2026-12-01'),
  ( 3, 'L240509A',  55, 3.80, '2024-05-01', '2026-10-01'),
  ( 4, 'L250103A',  40, 7.20, '2025-01-01', '2027-01-01'),
  ( 5, 'L250214B',  60, 9.90, '2025-02-01', '2027-02-01'),
  ( 6, 'L241010C',  70, 6.40, '2024-10-01', '2026-11-01'),
  ( 7, 'L250320A',  90, 5.00, '2025-03-01', '2027-06-01'),
  ( 8, 'L250401B',  50, 8.95, '2025-04-01', '2027-04-01'),
  ( 9, 'L250615A',  25, 27.00, '2025-06-01', '2028-06-01'),
  (10, 'L250222C', 200, 4.75, '2025-02-01', '2026-12-15'),
  (11, 'L250518A',  65, 7.60, '2025-05-01', '2027-05-01'),
  (12, 'L240930B',  35, 13.40, '2024-09-01', '2026-09-30'),
  (13, 'L250721A',  18, 31.90, '2025-07-01', '2027-07-01');

-- ---------- VENDA ----------
INSERT INTO Venda (id_cliente, id_funcionario, data_hora, forma_pagamento, desconto, total) VALUES
  (1, 3, '2026-09-10 09:15:00', 'pix',           0.00,  32.29),
  (2, 2, '2026-09-11 14:30:00', 'dinheiro',      0.00,  27.10),
  (3, 4, '2026-09-11 16:05:00', 'cartao_debito', 5.00,  30.25),
  (4, 2, '2026-09-12 10:40:00', 'cartao_credito',0.00,  43.35),
  (5, 5, '2026-09-12 17:20:00', 'pix',           2.00,  53.65),
  (6, 3, '2026-09-13 08:50:00', 'dinheiro',      0.00,  48.30);

-- ---------- ITEM_VENDA ----------
INSERT INTO ItemVenda (id_venda, id_produto, quantidade, preco_unitario, subtotal) VALUES
  (1,  1, 2,  8.90, 17.80),
  (1,  2, 1,  4.50,  4.50),
  (1, 10, 1,  9.99,  9.99),
  (2,  6, 1, 11.20, 11.20),
  (2,  8, 1, 15.90, 15.90),
  (3, 12, 1, 21.75, 21.75),
  (3, 11, 1, 13.50, 13.50),
  (4,  5, 2, 18.30, 36.60),
  (4,  3, 1,  6.75,  6.75),
  (5,  4, 1, 12.75, 12.75),
  (5,  9, 1, 42.90, 42.90),
  (6, 13, 1, 48.30, 48.30);

-- ---------- RECEITA ----------
INSERT INTO Receita (id_venda, id_produto, nome_medico, crm_medico, uf_crm, data_emissao, observacao) VALUES
  (3, 12, 'Dr. Antônio Ferreira',   'CRM 12345', 'MA', '2026-09-11', 'Uso contínuo - esquema de redução gradual'),
  (6, 13, 'Dra. Juliana Albuquerque', 'CRM 28710', 'MA', '2026-09-13', 'Notificação de receita B2 - retenção de 30 dias');