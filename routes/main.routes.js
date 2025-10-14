import ProductoController from "../controllers/ProductoController.js";
import express from 'express'
const router = express.Router();

router.get('/', ProductoController.index);

export default router