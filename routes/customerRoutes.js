import express from "express";
const router = express.Router();
import customerController from "../controller/customerController.js"

router.get('/create', customerController.viewBlank);
router.post('/create', customerController.create);
router.get('/view', customerController.viewAll);
router.get('/update/:id', customerController.edit);
router.post('/update/:id', customerController.update);
router.get('/delete/:id', customerController.delete);


export default router;