const express = require('express')
const router = express.Router();
const HomeController = require('../app/Controllers/Client/HomeController')

router.get('/login', HomeController.login)
router.get('/c/:id', HomeController.chat)

router.get('',HomeController.home)


router.post('/login', HomeController.loginPOST)

module.exports = router