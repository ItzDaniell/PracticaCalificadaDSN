import ProductoController from "../controllers/ProductoController.js";
import express from 'express'
const router = express.Router();

router.get('/productos/add', ProductoController.getAddProduct);
router.post('/productos', ProductoController.addProduct);
router.get('/producto/:id/edit', ProductoController.getEditProduct);
router.post('/producto/:id/update', ProductoController.updateProduct);
router.post('/producto/:id/delete', ProductoController.deleteProduct);

export default router