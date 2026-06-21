const pool = require('../../config/db');

// Listar todos os parâmetros (apenas admin)
const listar = async (req, res) => {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM parametros ORDER BY chave ASC`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar parâmetro (apenas admin)
const atualizar = async (req, res) => {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { chave } = req.params;
  const { valor } = req.body;

  try {
    const result = await pool.query(
      `UPDATE parametros SET valor = $1, atualizado_em = NOW()
       WHERE chave = $2
       RETURNING *`,
      [valor, chave]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parâmetro não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, atualizar };