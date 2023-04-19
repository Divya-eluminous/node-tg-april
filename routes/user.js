const express = require('express');
const multer = require('multer');
const router = express.Router();
const userController = require('../controllers/userController');

const DIR_PHOTO = "./uploads/profile_photo/";
let storage_profile_photo = multer.diskStorage({
destination: (req, file, cb) => {
    cb(null, DIR_PHOTO);
},
filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
},
}); 
let upload_profile_photo = multer({
storage: storage_profile_photo,
fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpg|png|gif|bmp|jpeg)$/)){
        return cb(new Error('Please select image with jpg,png,gif,jpeg or bmp format'));
    }
    cb(undefined,true);
}
});
router.post('/create',upload_profile_photo.single('profile_photo'),userController.createUser);
router.patch('/update/:id',userController.updateUser);
router.delete('/delete/:id',userController.deleteUser);
router.get('/get-details/:id',userController.getDetails);
router.post('/list',userController.getUserList);
router.post('/login',userController.login);
router.post('/logout',userController.logout);

module.exports = router;