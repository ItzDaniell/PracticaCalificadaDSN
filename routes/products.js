const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos');
    
router.get('/', function(req, res, next) {
  productosController.getProducts(req, res);
});

router.post('/', function(req, res, next) {
  productosController.addProduct(req, res);
});

module.exports = router;
