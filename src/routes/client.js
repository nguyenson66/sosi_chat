const express = require('express');
const router = express.Router();
const HomeController = require('../app/Controllers/Client/HomeController');
const UserController = require('../app/Controllers/Client/UserController');
const path = require('path');

router.get(
    '/.well-known/pki-validation/F83F345113877CC4A9852640301B7A2E.txt',
    (req, res) => {
        res.sendFile(
            path.join(__dirname + '../../') +
                '/public/F83F345113877CC4A9852640301B7A2E.txt'
        );
    }
);

router.get('/login', UserController.login);
router.get('/register', UserController.register);
router.get('/c/:id', UserController.checkLogin, HomeController.chat);
router.get('/j/:id', UserController.checkLogin, HomeController.joinRoom);
router.get('/home', UserController.checkLogin, HomeController.home);
router.get('', HomeController.introduce);

router.post('/login', UserController.loginPOST);
router.post('/register', UserController.registerPOST);
router.post(
    '/complete-user',
    UserController.checkLogin,
    UserController.CompleteUser
);

module.exports = router;
