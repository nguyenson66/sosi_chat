const express = require('express');
const router = express.Router();
const HomeController = require('../app/Controllers/Client/HomeController');
const UserController = require('../app/Controllers/Client/UserController');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, '../public/images') });

// user //
router.get('/login', UserController.login);
router.get('/register', UserController.register);
router.get('/verify', UserController.verify);
router.get('/my-profile', UserController.checkLogin, UserController.myProfile);
router.get('/out/:id', UserController.checkLogin, HomeController.outRoom);
router.get('/logout', UserController.logout);

// function //
router.get('/message', UserController.checkLogin, HomeController.getMessage);
router.get('/send-email-verify', UserController.sendMailVerify);
router.get('/c/:id', UserController.checkLogin, HomeController.chat);
router.get('/j/:id', UserController.checkLogin, HomeController.joinRoom);
router.get('/introduce', HomeController.introduce);
router.get(
    '/',
    (req, res, next) => {
        const subdomains = req.subdomains;
        if (subdomains[subdomains.length - 1] === 'cv') {
            res.sendFile(path.join(__dirname, '../views/cv.html'));
        } else {
            next();
        }
    },
    UserController.checkLogin,
    UserController.checkCompleteUser,
    HomeController.home
);

//////// post method ///////
router.post('/login', UserController.loginPOST);
router.post('/register', UserController.registerPOST);
router.post(
    '/my-profile',
    upload.single('image'),
    UserController.checkLogin,
    UserController.myProfilePOST
);

//upload image
router.post(
    '/upload-image',
    upload.single('image'),
    HomeController.uploadImage
);

module.exports = router;
