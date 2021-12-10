const express = require('express')
const router = express.Router();
const HomeController = require('../app/Controllers/Client/HomeController')

router.get('',HomeController.home)

module.exports = router