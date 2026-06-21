const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const { listar, buscarPorId, atualizar, desativar } = require('./usuarios.controller');

router.get('/', auth, listar);
router.get('/:id', auth, buscarPorId);
router.put('/:id', auth, atualizar);
router.patch('/:id/desativar', auth, desativar);

module.exports = router;