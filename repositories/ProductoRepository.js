import Producto from "../models/Producto.js";

class ProductoRepository {
    async getAll() {
        return await Producto.find();
    }

    async createProduct(data){
        const newProduct = new Producto(data);
        return await newProduct.save();
    }

    async getById(id){
        return await Producto.findById(id);
    }

    async updateProduct(id, data){
        return await Producto.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteProduct(id){
        return await Producto.findByIdAndDelete(id);
    }
}

export default new ProductoRepository();