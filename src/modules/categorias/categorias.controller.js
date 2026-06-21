const pool = require('../../config/db');

const listar = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categorias WHERE ativo = true ORDER BY nome ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar };