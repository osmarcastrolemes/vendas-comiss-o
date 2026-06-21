const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const { criar, listarMinhas, resumo, listarTodas } = require('./vendas.controller');

router.post('/', auth, criar);
router.get('/minhas', auth, listarMinhas);
router.get('/resumo', auth, resumo);
router.get('/todas', auth, listarTodas);

module.exports = router;