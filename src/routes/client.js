const express = require('express')
const router = express.Router();
const HomeController = require('../app/Controllers/Client/HomeController')
const UserController = require('../app/Controllers/Client/UserController')

router.get('/login', UserController.login)
router.get('/c/:id', UserController.checkLogin, HomeController.chat)
router.get('/j/:id', UserController.checkLogin, HomeController.joinRoom)
router.get('', UserController.checkLogin , HomeController.home)


router.post('/login', UserController.loginPOST)
router.post('/register', UserController.registerPOST)
router.post('/complete-user', UserController.checkLogin, UserController.CompleteUser)

module.exports = router