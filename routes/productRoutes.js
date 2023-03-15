import express from "express";
const router = express.Router();
import productController from "../controller/productController.js"

router.get('/create', productController.viewBlank);
router.post('/create', productController.create);
router.get('/view', productController.viewAll);
router.get('/update/:id', productController.edit);
router.post('/update/:id', productController.update);
router.get('/delete/:id', productController.delete);

export default router;