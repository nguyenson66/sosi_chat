const express = require('express')
const router = express.Router()
const AdminController = require('../app/Controllers/Admin/AdminController')


// router.get('', AdminController.checkLogin, AdminController.Home)

router.post('/test', AdminController.test)

module.exports = router