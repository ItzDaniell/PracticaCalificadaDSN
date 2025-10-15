import ProductoRepository from "../repositories/ProductoRepository.js";
import S3Service from './S3Service.js';

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
            imageUrl = await S3Service.uploadFile(data.file);
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
            // Si hay una nueva imagen, eliminar la anterior y subir la nueva
            if (imageUrl) {
                await S3Service.deleteFile(imageUrl);
            }
            imageUrl = await S3Service.uploadFile(data.file);
        }
        return await ProductoRepository.updateProduct(id, {
            ...data,
            imagen: imageUrl
        });
    }

    async deleteProduct(id) {
        const producto = await this.getProductById(id);
        if (producto.imagen) {
            await S3Service.deleteFile(producto.imagen);
        }
        return await ProductoRepository.deleteProduct(id);
    }
}

export default new ProductoService();
