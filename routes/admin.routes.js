import express from 'express';
import AdminStorageController from '../controllers/AdminStorageController.js';

const router = express.Router();

router.get('/admin', AdminStorageController.renderPage);
router.get('/admin/storage', AdminStorageController.getStorage);
router.post('/admin/storage', AdminStorageController.updateStorage);
router.post('/admin/storage/backup', AdminStorageController.backup);
router.post('/admin/storage/cleanup', AdminStorageController.cleanup);
router.post('/admin/storage/restore', AdminStorageController.restore);

export default router;
