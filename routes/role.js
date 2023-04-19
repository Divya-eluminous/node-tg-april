const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken } = require('../middleware/auth');

router.post('/create',verifyToken,roleController.createRole);
router.patch('/update/:id',verifyToken,roleController.updateRole);
router.post('/list',verifyToken,roleController.getRoles);
router.delete('/delete/:id',verifyToken,roleController.deleteRole);
router.post('/assign',verifyToken,roleController.assignRole);

module.exports = router;