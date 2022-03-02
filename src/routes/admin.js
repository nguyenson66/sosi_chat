const express = require('express');
const router = express.Router();
const AdminController = require('../app/Controllers/Admin/AdminController');

router.get('', AdminController.checkLogin, AdminController.Home);

module.exports = router;
