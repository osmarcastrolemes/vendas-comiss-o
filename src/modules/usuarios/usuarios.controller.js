const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

// Listar todos os usuários (apenas admin)
const listar = async (req, res) => {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  try {
    const result = await pool.query(
      `SELECT id, nome, email, perfil, ativo, criado_em
       FROM usuarios
       ORDER BY nome ASC`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar usuário por ID (apenas admin)
const buscarPorId = async (req, res) => {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, nome, email, perfil, ativo, criado_em
       FROM usuarios WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Atualizar usuário (apenas admin)
const atualizar = async (req, res) => {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { id } = req.params;
  const { nome, email, senha, perfil, ativo } = req.body;

  try {
    let senha_hash = undefined;
    if (senha) {
      senha_hash = await bcrypt.hash(senha, 10);
    }

    const result = await pool.query(
      `UPDATE usuarios SET
         nome = COALESCE($1, nome),
         email = COALESCE($2, email),
         senha_hash = COALESCE($3, senha_hash),
         perfil = COALESCE($4, perfil),
         ativo = COALESCE($5, ativo)
       WHERE id = $6
       RETURNING id, nome, email, perfil, ativo`,
      [nome, email, senha_hash, perfil, ativo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Desativar usuário (apenas admin)
const desativar = async (req, res) => {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE usuarios SET ativo = false WHERE id = $1
       RETURNING id, nome, ativo`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { listar, buscarPorId, atualizar, desativar };