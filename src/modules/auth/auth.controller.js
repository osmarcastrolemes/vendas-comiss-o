const pool = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Cadastrar usuário
const cadastrar = async (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'E-mail já cadastrado' });
    }

    const senha_hash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil)
       VALUES ($1, $2, $3, $4) RETURNING id, nome, email, perfil`,
      [nome, email, senha_hash, perfil || 'colaborador']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = result.rows[0];

    console.log('Usuario encontrado:', JSON.stringify(usuario));
    console.log('senha recebida:', senha);
    console.log('senha_hash do banco:', usuario?.senha_hash);

    if (!usuario) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reset de senha
const resetSenha = async (req, res) => {
  const { email, nova_senha } = req.body;

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const senha_hash = await bcrypt.hash(nova_senha, 10);

    await pool.query(
      'UPDATE usuarios SET senha_hash = $1 WHERE email = $2',
      [senha_hash, email]
    );

    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { cadastrar, login, resetSenha };
