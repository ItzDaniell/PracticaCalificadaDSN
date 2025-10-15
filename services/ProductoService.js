import ProductoRepository from "../repositories/ProductoRepository.js";
import StorageFactory from './storage/StorageFactory.js';

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
        let imageUrl = '';
        if (data.file) {
            const storage = await StorageFactory.get();
            const { url } = await storage.upload(data.file);
            imageUrl = url;
        }
        return await ProductoRepository.createProduct({
            ...data,
            imagen: imageUrl
        });
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
        let imageUrl = data.imagenActual;
        if (data.file) {
            const storage = await StorageFactory.get();
            if (imageUrl) {
                await storage.deleteByUrl(imageUrl);
            }
            const { url } = await storage.upload(data.file);
            imageUrl = url;
        }
        return await ProductoRepository.updateProduct(id, {
            ...data,
            imagen: imageUrl
        });
    }

    async deleteProduct(id) {
        const producto = await this.getProductById(id);
        if (producto.imagen) {
            const storage = await StorageFactory.get();
            await storage.deleteByUrl(producto.imagen);
        }
        return await ProductoRepository.deleteProduct(id);
    }
}

export default new ProductoService();
