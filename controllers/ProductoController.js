import ProductoService from '../services/ProductoService.js';
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

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
        try {
            upload.single('imagen')(req, res, async (err) => {
                if (err) {
                    console.error('Error al cargar la imagen:', err);
                    return res.status(400).send('Error al cargar la imagen');
                }
                const { nombre, precio, descripcion, marca, stock } = req.body;
                await ProductoService.createProduct({ 
                    nombre, 
                    precio: Number(precio), 
                    descripcion, 
                    marca, 
                    stock: Number(stock),
                    file: req.file
                });
                res.redirect('/');
            });
        } catch (error) {
            console.error('Error al crear el producto:', error);
            res.status(500).send('Error al crear el producto');
        }
    }

    async getEditProduct(req, res) {
        const { id } = req.params;
        const producto = await ProductoService.getProductById(id);
        res.render('edit', { title: 'Editar Producto', producto });
    }

    async updateProduct(req, res) {
        try {
            upload.single('imagen')(req, res, async (err) => {
                if (err) {
                    console.error('Error al cargar la imagen:', err);
                    return res.status(400).send('Error al cargar la imagen');
                }
                const { id } = req.params;
                const { nombre, precio, descripcion, marca, stock, imagenActual } = req.body;
                await ProductoService.updateProduct(id, { 
                    nombre, 
                    precio: Number(precio), 
                    descripcion, 
                    marca, 
                    stock: Number(stock),
                    file: req.file,
                    imagenActual
                });
                res.redirect('/');
            });
        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            res.status(500).send('Error al actualizar el producto');
        }
    }

    async deleteProduct(req, res) {
        const { id } = req.params;
        await ProductoService.deleteProduct(id);
        res.redirect('/');
    }
}

export default new ProductoController();
