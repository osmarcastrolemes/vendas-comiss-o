const pool = require('../../config/db');

// Lançar nova venda
const criar = async (req, res) => {
  const { categoria_id, codigo, valor_total, data_venda } = req.body;
  const colaborador_id = req.usuario.id;

  console.log('📅 data_venda recebida do app:', data_venda);

  try {
    const result = await pool.query(
      `INSERT INTO vendas (colaborador_id, categoria_id, codigo, valor_total, data_venda)
       VALUES ($1, $2, $3, $4, $5::date)
       RETURNING *`,
      [colaborador_id, categoria_id, codigo, valor_total, data_venda || new Date().toISOString().split('T')[0]]
    );

    console.log('📅 data_venda salva no banco:', result.rows[0].data_venda);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar vendas do colaborador logado
const listarMinhas = async (req, res) => {
  const colaborador_id = req.usuario.id;
  const { mes, ano } = req.query;

  try {
    const result = await pool.query(
      `SELECT v.*, c.nome AS categoria
       FROM vendas v
       JOIN categorias c ON c.id = v.categoria_id
       WHERE v.colaborador_id = $1
         AND EXTRACT(MONTH FROM v.data_venda) = $2
         AND EXTRACT(YEAR FROM v.data_venda) = $3
       ORDER BY v.data_venda DESC`,
      [colaborador_id, mes || new Date().getMonth() + 1, ano || new Date().getFullYear()]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Resumo do mês (total vendido + comissão)
const resumo = async (req, res) => {
  const colaborador_id = req.usuario.id;
  const { mes, ano } = req.query;

  try {
    const result = await pool.query(
      `SELECT
         SUM(v.valor_total) AS total_vendido,
         ROUND(SUM(v.valor_total) * (SELECT CAST(valor AS NUMERIC) / 100 FROM parametros WHERE chave = 'percentual_comissao'), 2) AS comissao,
         (SELECT valor FROM parametros WHERE chave = 'percentual_comissao') AS percentual_comissao
       FROM vendas v
       WHERE v.colaborador_id = $1
         AND EXTRACT(MONTH FROM v.data_venda) = $2
         AND EXTRACT(YEAR FROM v.data_venda) = $3`,
      [colaborador_id, mes || new Date().getMonth() + 1, ano || new Date().getFullYear()]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Listar todas as vendas (apenas admin)
const listarTodas = async (req, res) => {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { mes, ano } = req.query;

  try {
    const result = await pool.query(
      `SELECT v.*, c.nome AS categoria, u.nome AS colaborador
       FROM vendas v
       JOIN categorias c ON c.id = v.categoria_id
       JOIN usuarios u ON u.id = v.colaborador_id
       WHERE EXTRACT(MONTH FROM v.data_venda) = $1
         AND EXTRACT(YEAR FROM v.data_venda) = $2
       ORDER BY v.data_venda DESC`,
      [mes || new Date().getMonth() + 1, ano || new Date().getFullYear()]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { criar, listarMinhas, resumo, listarTodas };