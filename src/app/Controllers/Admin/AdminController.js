const User = require('../../Models/User')

exports.checkLogin = (req,res,next) => {
    const user_cookie = req.cookies.user_cookie
    if(!user_cookie){
        res.redirect('/login')
    }
    else{
        const data_user = jwt.verify(user_cookie, process.env.JWT_KEY)

        User.findById(data_user.user_id)
            .then(user => {
                if(!user) res.redirect('login')
                else{
                    req.body.user = user
                    next()
                }
            })
            .catch(err => {
                console.log(err)
                res.redirect('/login')
            })
    }
}