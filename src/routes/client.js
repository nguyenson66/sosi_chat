const express = require('express')
const router = express.Router();
const HomeController = require('../app/Controllers/Client/HomeController')
const UserController = require('../app/Controllers/Client/UserController')

router.get('/login', UserController.login)
router.get('/c/:id', UserController.checkLogin, HomeController.chat)
router.get('/j/:id', UserController.checkLogin, HomeController.joinRoom)
router.get('/home', UserController.checkLogin, HomeController.home)
router.get('/rutgon', HomeController.rutgon)
router.get('', HomeController.introduce)


router.post('/login', UserController.loginPOST)
router.post('/register', UserController.registerPOST)
router.post('/complete-user', UserController.checkLogin, UserController.CompleteUser)

module.exports = router