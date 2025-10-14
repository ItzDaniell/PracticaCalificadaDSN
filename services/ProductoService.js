import ProductoRepository from "../repositories/ProductoRepository.js";

class ProductoService {
    async getAllProducts() {
        const productos = await ProductoRepository.getAll();
        return productos.map(producto => ({
            id: producto._id,
            nombre: producto.nombre,
            marca: producto.marca,
            descripcion: producto.descripcion,
            precio: producto.precio,
            stock: producto.stock,
            imagen: producto.imagen
        }));
    }

    async createProduct(data) {
        return await ProductoRepository.createProduct(data);
    }

    async getProductById(id) {
        const producto = await ProductoRepository.getById(id);
        if (!producto) throw new Error("Producto no encontrado");
        return {
            id: producto._id,
            nombre: producto.nombre,
            marca: producto.marca,
            descripcion: producto.descripcion,
            precio: producto.precio,
            stock: producto.stock,
            imagen: producto.imagen
        };
    }

    async updateProduct(id, data) {
        return await ProductoRepository.updateProduct(id, data);
    }

    async deleteProduct(id) {
        return await ProductoRepository.deleteProduct(id);
    }
}

export default new ProductoService();
