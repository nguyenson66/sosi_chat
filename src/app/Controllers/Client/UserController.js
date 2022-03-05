const path = require('path');
const jwt = require('jsonwebtoken');
const Crypto = require('crypto-js');
const fs = require('fs');
const asyncWrapper = require('../../Middleware/asyncWrapper');
const User = require('../../Models/User');
const sendMail = require('../../Middleware/sendMail');
const upload = require('../../Middleware/upload');

exports.checkLogin = asyncWrapper(async (req, res, next) => {
    const user_cookie = req.cookies.user_cookie;
    if (!user_cookie) {
        res.redirect('/introduce');
    } else {
        jwt.verify(user_cookie, process.env.JWT_KEY, async (err, data_user) => {
            if (err) {
                console.log(err);
                return res.redirect('/login');
            }

            const user = await User.findById(data_user.user_id);

            if (user) {
                req.body.user = user;
                next();
            } else {
                res.status(300).redirect('/login');
            }
        });
    }
});

exports.checkCompleteUser = async (req, res, next) => {
    if (req.body.user.age === undefined) {
        res.redirect('/my-profile');
    } else {
        next();
    }
};

//[GET] /login
exports.login = async (req, res) => {
    res.render('client/login', {
        error: [],
    });
};

//[GET] /register
exports.register = (req, res) => {
    res.render('client/register', {
        error: [],
    });
};

//[GET] /verify
exports.verify = asyncWrapper(async (req, res) => {
    const user_id = req.query.user_id;
    const email = req.query.email;
    const token_user = req.query.token_user;

    if (!user_id || !email || !token_user) {
        return res
            .status(404)
            .sendFile(path.join(__dirname, '../../../views/404.html'));
    }

    let user = await User.findById(user_id);
    user.isVerified = true;
    user.save();

    if (user.email === email) {
        res.cookie('user_cookie', token_user, {
            maxAge: 5 * 24 * 60 * 60000,
        });

        res.redirect('/');
    } else {
        return res
            .status(404)
            .sendFile(path.join(__dirname, '../../../views/404.html'));
    }
});

//[GET] /my-profile
exports.myProfile = (req, res) => {
    let err = '',
        status = 'false';

    const dataUser = req.body.user;

    if (dataUser.sex === undefined) {
        err = 'Vui lòng hoàn thiện hồ sơ để tiếp tục sử dụng dịch vụ';
        status = 'true';
        dataUser.option = [];
    }

    res.render('client/profile', {
        err,
        status,
        user: dataUser,
    });
};

//[GET] /logout
exports.logout = (req, res) => {
    res.cookie('user_cookie', '', { maxAge: 0 });

    res.redirect('/introduce');
};

/////////////////////////////////// POST ///////////////////////////////////////
//[POST] /login
exports.loginPOST = asyncWrapper(async (req, res) => {
    // console.log(req.body)

    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email });

    if (user) {
        const answer_password = Crypto.AES.decrypt(
            user.password,
            process.env.CRYPTO_KEY
        ).toString(Crypto.enc.Utf8);

        if (answer_password === password) {
            // check verify User
            if (user.isVerified) {
                const token_user = jwt.sign(
                    { user_id: user._id, username: user.username },
                    process.env.JWT_KEY,
                    { expiresIn: '5d' }
                );

                res.cookie('user_cookie', token_user, {
                    maxAge: 5 * 24 * 60 * 60000,
                });

                res.redirect('/');
            } else {
                return res.render('client/verifyUser', {
                    email: user.email,
                });
            }
        } else {
            res.status(302).render('client/login', {
                error: 'Thông tin tài khoản hoặc mật khẩu không chính xác',
            });
        }
    } else {
        res.status(302).render('client/login', {
            error: 'Thông tin tài khoản hoặc mật khẩu không chính xác',
        });
    }
});

//[POST] /register
exports.registerPOST = asyncWrapper(async (req, res) => {
    let { username, email, password, password2 } = req.body;

    if (password != password2) {
        res.status(302).render('client/register', {
            error: '2 mật khẩu không trùng khớp',
        });
    }

    const findUser = await User.findOne({ email: email });
    // console.log(findUser)

    if (findUser) {
        res.render('client/register', {
            error: 'Địa chỉ Email đã tồn tại !!!',
        });
    } else {
        password = Crypto.AES.encrypt(
            password,
            process.env.CRYPTO_KEY
        ).toString();
        const avatar = process.env.AVATAR_DEFAULT;
        const status = 1;

        // console.log(avatar)

        const newUser = new User({
            username,
            email,
            password,
            avatar,
            status,
            role: 0,
            isVerified: false,
        });
        const user = await newUser.save();

        const token_user = jwt.sign(
            { user_id: user._id, username: user.username },
            process.env.JWT_KEY,
            { expiresIn: '5d' }
        );

        sendMail.vefifiedEmail(user._id, email, token_user);

        res.render('client/verifyUser', { email });
    }
});

//[POST] /my-profile
exports.myProfilePOST = asyncWrapper(async (req, res) => {
    if (req.body.age === '' || req.body.sex === '') {
        // check if age == null or user.sex == null render view profile

        let err = '',
            status = 'false';

        const user = req.body.user;
        let dataUser = {
            username: user.username,
            email: user.email,
        };

        if (user.sex === undefined) {
            err = 'Vui lòng hoàn thiện hồ sơ để tiếp tục sử dụng dịch vụ';
            status = 'true';
            dataUser.option = [];
        } else {
            dataUser.age = user.age;
            dataUser.option = user.option;
            dataUser.sex = user.sex;
        }

        res.render('client/profile', {
            err,
            status,
            user: dataUser,
        });
    } else {
        let user = req.body.user;
        user.age = req.body.age;
        user.username = req.body.username;
        user.sex = req.body.sex;
        if (req.body.option) {
            user.option = req.body.option;
        } else {
            user.option = [];
        }

        //process avatar
        if (req.file) {
            const data = await upload.uploadImage(req.file.path);

            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.log(err);
                }
            });

            user.avatar = data.result.url;
        }

        console.log(user);

        const newUser = new User(user);
        newUser.save();
        res.redirect('/my-profile');
    }
});

////////////////////////////////// API /////////////////////////////////////////

//[GET] /send-mail-verify
exports.sendMailVerify = async (req, res) => {
    if (email) {
        const user = await User.findOne({ email }).select(
            '_id username isVerified'
        );

        // check user dont exists
        if (!user) {
            return res.json({
                status: 404,
                msg: email + ' does not exists',
            });
        }
        // check verified emaill address
        if (user.isVerified) {
            res.json({
                status: 400,
                msg: 'Verified email address',
            });
        } else {
            const token_user = jwt.sign(
                { user_id: user._id, username: user.username },
                process.env.JWT_KEY,
                { expiresIn: '5d' }
            );

            sendMail.vefifiedEmail(user._id, email, token_user);

            res.json({
                status: 200,
                msg: 'Send new email verify successfully',
            });
        }
    } else {
        res.json({
            status: 404,
            msg: 'Can not send email verify to ' + email,
        });
    }
};
