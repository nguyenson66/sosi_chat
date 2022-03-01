const express = require('express');
const router = express.Router();
const HomeController = require('../app/Controllers/Client/HomeController');
const UserController = require('../app/Controllers/Client/UserController');

router.get('/login', UserController.login);
router.get('/register', UserController.register);
router.get('/c/:id', UserController.checkLogin, HomeController.chat);
router.get('/j/:id', UserController.checkLogin, HomeController.joinRoom);
router.get('/introduce', HomeController.introduce);
router.get('/my-profile', UserController.checkLogin, UserController.myProfile);
router.get('/out/:id', UserController.checkLogin, HomeController.outRoom);
router.get('/logout', UserController.logout);
router.get(
    '/',
    UserController.checkLogin,
    UserController.checkCompleteUser,
    HomeController.home
);

router.post('/login', UserController.loginPOST);
router.post('/register', UserController.registerPOST);
router.post(
    '/my-profile',
    UserController.checkLogin,
    UserController.myProfilePOST
);

module.exports = router;
