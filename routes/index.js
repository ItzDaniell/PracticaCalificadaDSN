const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos');

router.get('/', function(req, res, next) {
  productosController.index(req, res);
});

module.exports = router;
