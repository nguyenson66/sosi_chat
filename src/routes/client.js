const express = require('express')
const router = express.Router();
const HomeController = require('../app/Controllers/Client/HomeController')

router.get('/login', HomeController.login)
router.get('/c/:id', HomeController.checkLogin, HomeController.chat)
router.get('/j/:id', HomeController.checkLogin, HomeController.joinRoom)
router.get('', HomeController.checkLogin , HomeController.home)


router.post('/login', HomeController.loginPOST)

module.exports = router