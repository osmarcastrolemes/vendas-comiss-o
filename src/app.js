const express = require('express');
const app = express();

app.use(express.json());

// Rotas
app.use('/auth', require('./modules/auth/auth.routes'));
app.use('/vendas', require('./modules/vendas/vendas.routes'));
app.use('/usuarios', require('./modules/usuarios/usuarios.routes'));
app.use('/parametros', require('./modules/parametros/parametros.routes'));

app.get('/', (req, res) => {
  res.json({ message: '🚀 API de Vendas funcionando!' });
});

module.exports = app;