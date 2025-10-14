import ProductoService from '../services/ProductoService.js';

class ProductoController {
    async index(req, res) {
        const productos = await ProductoService.getAllProducts();
        const totalProductos = productos.length;
        res.render('index', { title: 'Dashboard Administrativo', totalProductos, productos });
    }

    async getAddProduct(req, res) {
        res.render('create', { title: 'Agregar Producto' });
    }

    async addProduct(req, res) {
        const { nombre, precio, descripcion, marca, stock, imagen } = req.body;
        await ProductoService.createProduct({ nombre, precio, descripcion, marca, stock, imagen });
        res.redirect('/');
    }

    async getEditProduct(req, res) {
        const { id } = req.params;
        const producto = await ProductoService.getProductById(id);
        res.render('edit', { title: 'Editar Producto', producto });
    }

    async updateProduct(req, res) {
        const { id } = req.params;
        const { nombre, precio, descripcion, marca, stock, imagen } = req.body;
        await ProductoService.updateProduct(id, { nombre, precio, descripcion, marca, stock, imagen });
        res.redirect('/');
    }

    async deleteProduct(req, res) {
        const { id } = req.params;
        await ProductoService.deleteProduct(id);
        res.redirect('/');
    }
}

export default new ProductoController();
