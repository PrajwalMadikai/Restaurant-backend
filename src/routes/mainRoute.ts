import express from 'express';
import multer from 'multer';
import mainController from '../controller/mainController';
const router=express.Router()

const upload = multer({ 
    dest: 'uploads/',  
    limits: { fileSize: 10 * 1024 * 1024 }, 
});

router.get('/fetch',mainController.fetchAllRestaurant)

router.post('/add-restaurant',upload.single('image'),mainController.addRestaurant)

router.put('/update/:id',upload.single('image'),mainController.updateRestaurant);

router.delete('/delete/:id', mainController.deleteRestaurant);

export default router