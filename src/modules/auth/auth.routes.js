const express = require('express');
const router = express.Router();
const { cadastrar, login, resetSenha } = require('./auth.controller');

router.post('/cadastrar', cadastrar);
router.post('/login', login);
router.post('/reset-senha', resetSenha);

module.exports = router;