const asyncWrapper = require('../../Middleware/asyncWrapper');
const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('../../Models/User');

exports.checkLogin = asyncWrapper(async (req, res, next) => {
    const user_cookie = req.cookies.user_cookie;

    if (!user_cookie || user_cookie == '') {
        res.redirect('/introduce');
    } else {
        const data_user = jwt.verify(user_cookie, process.env.JWT_KEY);

        const user = await User.findById(data_user.user_id);

        if (user && user.role > 3) {
            next();
        } else {
            res.status(404).sendFile(
                path.join(__dirname, '../../../views/404.html')
            );
        }
    }
});

exports.Home = asyncWrapper(async (req, res) => {
    const user = await User.find();

    res.json(user);
});
