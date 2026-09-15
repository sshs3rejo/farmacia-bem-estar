# Contexto do Projeto — TDE Programação em Banco de Dados

## Sobre o trabalho
- **Curso:** Análise e Desenvolvimento de Sistemas (ADS) — UniFacema, 3º período
- **UC:** Programação em Banco de Dados
- **Professor:** Nayron Morais Almeida
- **Tipo:** Trabalho Discente Efetivo (TDE), em grupo (5 integrantes)
- **Prazo de entrega:** 16/09/2026, **exclusivamente pelo AVA** — só é permitido UM único envio, então precisa estar tudo revisado antes.
- **Carga horária do TDE:** 15h

## O que a atividade pede
Estudo de caso com **no mínimo 10 entidades**, cobrindo:
1. Requisitos **funcionais** e **não-funcionais**
2. Modelagem de banco de dados (**MER e/ou DER**)
3. Relatório em **ABNT** com a estrutura:
   1. Introdução — contextualizar o problema
   2. Metodologia — planejamento da execução
   3. Resultados e Discussões — apresentar e discutir os resultados
   4. Conclusão
   5. Referências

**Obrigatório:** seção descrevendo a contribuição de cada membro do grupo (sem isso, o grupo zera).

### Critérios de avaliação
| Critério | Pontos |
|---|---|
| Organização | 2 |
| Análise Crítica | 2 |
| Adequação | 2 |
| Relevância | 3 |
| Normatização (ABNT) | 1 |

## Domínio escolhido: Farmácia
Escolhido entre farmácia e petshop, priorizando simplicidade de execução (fluxo linear de compra/venda, sem precisar modelar agendamento).

### Entidades propostas (mínimo 10 — ainda a confirmar com o grupo)
1. Cliente
2. Funcionário
3. Produto
4. Categoria (do produto)
5. Fabricante
6. Fornecedor
7. Venda
8. Item_Venda
9. Receita (medicamentos controlados)
10. Estoque/Lote (controle de validade)

## Divisão de papéis no grupo (5 pessoas)
| Papel | Responsável |
|---|---|
| Requisitos (funcionais e não-funcionais) | Integrante A |
| Diagramas — MER + DER (mesma dupla, para manter consistência) | Integrantes B e C |
| Redação do relatório (ABNT) | Integrante D |
| Código SQL (DDL + DML) | **Eu (Felipe)** |
| Revisão geral, normatização ABNT, referências e seção de contribuições | **Eu (Felipe)** |

## Regras importantes de notação
- **MER (modelo conceitual):** notação de **Peter Chen** — entidades e atributos em elipses, relacionamentos em losango. **Sem tipos de dado e sem chaves.**
- **DER (modelo lógico):** tabelas com PK/FK e cardinalidades definidas — é aqui que os tipos de dado entram.

## Minha parte (código)
Depois que o DER estiver fechado, preciso escrever:
- `CREATE TABLE` para as ~10 entidades, com PK/FK e constraints coerentes com o DER
- `INSERT` de dados de exemplo (dados fictícios realistas de farmácia: clientes, produtos, vendas, receitas)

## Formatação ABNT (padrão usado nos trabalhos do curso)
- Fonte Arial 12pt
- Espaçamento 1,5 ou duplo
- Recuo de primeira linha de parágrafo: 1,25cm
- Texto justificado
- Margens: 3cm superior/esquerda, 2cm inferior/direita

## Arquivos já existentes no repositório
- `3PN_ADS_FORMULÁRIO TDE_TDE01_PROGRAMAÇÃO EM BANCO DE DADOS_NAYRON MORAIS.pdf` — formulário oficial da atividade
- `TDE - PROGRAMAÇÃO EM BANCO DE DADOS.docx` — documento do relatório, já com capa institucional pronta
