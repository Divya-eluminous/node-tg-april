const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { verifyToken,checkRole } = require('../middleware/auth');


const isSuperadmin = checkRole(['superadmin']);

router.post('/create',verifyToken,isSuperadmin,roleController.createRole);
router.patch('/update/:id',verifyToken,isSuperadmin,roleController.updateRole);
router.post('/list',verifyToken,isSuperadmin,roleController.getRoles);
router.delete('/delete/:id',verifyToken,isSuperadmin,roleController.deleteRole);
router.post('/assign',verifyToken,isSuperadmin,roleController.assignRole);
router.post('/update-roles',verifyToken,roleController.userUpdateRole);

module.exports = router;