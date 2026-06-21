const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const { listar } = require('./categorias.controller');

router.get('/', auth, listar);

module.exports = router;