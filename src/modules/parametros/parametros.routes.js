const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const { listar, atualizar } = require('./parametros.controller');

router.get('/', auth, listar);
router.put('/:chave', auth, atualizar);

module.exports = router;