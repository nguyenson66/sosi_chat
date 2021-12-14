const path = require('path')
const jwt = require('jsonwebtoken')
const User = require('../../Models/User')
const Room = require('../../Models/Room')

function checkLogin(user){
    
}


//[GET] /
exports.home = async (req,res) => {
    const user_cookie = req.cookies.user_cookie
    if(!user_cookie){
        res.redirect('/login')
    }

    // get data user from cookie
    const data_user = jwt.verify(user_cookie, 'sosichat')
    let error = []

    User.findById(data_user.user_id)
        .then(user => {
            if(!user) res.redirect('login')
            else{
                res.render('client/home',{
                    title : `Chào mừng ${user.username} đến với trang web`
                })


            }
        })
        .catch(err => {
            console.log(err.message)
            error.push('error_joinRoom', err.message)
            res.render('client/login', {title: 'Chào mừng bạn đến trang trò chuyện online của Sosi' , layout : path.join(__dirname + '../../../../views/layouts/login-layout'),error})
        })
}

//[GET] /login
exports.login = async (req,res) => {
    res.render('client/login',{
        title : 'Chào mừng bạn đến trang trò chuyện online của Sosi'
    })
}

//[GET] /c/:id
exports.chat = async (req,res) => {
    const user_cookie = req.cookies.user_cookie
    const room_id = req.params.id
    if(!user_cookie){
        res.redirect('/login')
    }

    // get data user from cookie
    const data_user = jwt.verify(user_cookie, 'sosichat')
    let error = []

    User.findById(data_user.user_id)
        .then(user => {
            if(!user) res.redirect('login')
            else{
                Room.findById(room_id)
                    .then(room => {
                        res.render('client/chat', {
                            title : room.title,
                            message : room.message,
                            user : {
                                user_id : user._id,
                                username : user.username
                            }
                        })
                    })
                    .catch(err => {
                        console.log(err.message)
                        error.push({'error_getdataroom' : err.message})
                        res.redirect('/')
                    })
            }
        })
        .catch(err => {
            console.log(err.message)
            error.push('error_joinRoom', err.message)
            res.render('client/login', {title: 'Chào mừng bạn đến trang trò chuyện online của Sosi' , layout : path.join(__dirname + '../../../../views/layouts/login-layout'),error})
        })
}



/////////////////////////////////// POST ///////////////////////////////////////
//[POST] /login
exports.loginPOST = async(req,res) => {
    // console.log(req.body)
    const email = req.body.email
    const password = req.body.password
    let error = []

    User.find({
        'email' : email,
        'password' : password
    })
    .then(user => {
        if(user.length === 0){
            error.push({'wrong_user' : 'Thông tin tài khoản hoặc mật khẩu không chính xác'})
            res.redirect('back')
        }
        else{
            const token_user = jwt.sign({user_id : user[0]._id , username : user[0].username}, 'sosichat' , {expiresIn: '5d'})

            res.cookie('user_cookie', token_user, {maxAge : 5*24*60*60000})

            res.redirect('/c/61b55eaa7e0e49df677114c3')
        }
    })
    .catch(err => {
        console.log(err.message)
        error.push({'error_login' : err.message})
        res.redirect('back')
    })
}

//[POST] /register
exports.registerPOST = async(req,res) => {

}