const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = new Pool();

exports.index = function (req, res) {
    res.render('index', { title: 'Agregar Producto' });
}

exports.getProducts = function (req, res) {
    pool.query('SELECT * FROM productos', (err, result) => {
        if (err) {
            console.error('Error fetching products:', err);
            res.status(500).send('Error fetching products');
            return;
        }
        res.render('productos', { title: 'Lista de productos', array: result.rows });
    });
}

exports.addProduct = function (req, res) {
    const { nombre, precio, descripcion } = req.body;
    pool.query('INSERT INTO productos (name, price, description) VALUES ($1, $2, $3)', [nombre, precio, descripcion], (err) => {
        if (err) {
            console.error('Error adding product:', err);
            res.status(500).send('Error adding product');
            return;
        }
        res.redirect('/productos');
    });
}
