const path = require('path')
const jwt = require('jsonwebtoken')
const Crypto = require('crypto-js')
const User = require('../../Models/User')
const Room = require('../../Models/Room')
const Message = require('../../Models/Message')

exports.checkLogin = async (req,res,next) => {
    const user_cookie = req.cookies.user_cookie
    if(!user_cookie){
        res.redirect('/login')
    }
    else{
        const data_user = jwt.verify(user_cookie, process.env.JWT_KEY)

        User.findById(data_user.user_id)
            .then(user => {
                if(user){
                    req.body.user = user
                    next()
                }
                else{
                    console.log(err)
                    res.redirect('/login')
                }
            })
            .catch(err => {
                console.log(err)
                res.redirect('/login')
            })
    }
}


//[GET] /login
exports.login = async (req,res) => {
    res.render('client/login',{
        title : 'Chào mừng bạn đến trang trò chuyện online của Sosi'
    })
}


/////////////////////////////////// POST ///////////////////////////////////////
//[POST] /login
exports.loginPOST = async(req,res) => {
    // console.log(req.body)
    const email = req.body.email
    const password = req.body.password
    let error = []



    User.findOne({email})
    .then(user => {
        if(!user){
            res.status(302).render('client/login',{
                title : 'Chào mừng bạn đến trang trò chuyện online của Sosi',
                error_login : 'Wrong email or password'
            })
        }
        else{
            const answer_password = Crypto.AES.decrypt(user.password, process.env.CRYPTO_KEY).toString(Crypto.enc.Utf8)

            if(answer_password === password){
                const token_user = jwt.sign({user_id : user._id , username : user.username}, process.env.JWT_KEY , {expiresIn: '5d'})
    
                res.cookie('user_cookie', token_user, {maxAge : 5*24*60*60000})
    
                res.redirect('/')
            }
            else{
                res.status(302).render('client/login',{
                    title : 'Chào mừng bạn đến trang trò chuyện online của Sosi',
                    error_login : 'Wrong email or password'
                })
            }
        }
    })
    .catch(err => {
        console.log(err)
        res.status(302).render('client/login',{
            title : 'Chào mừng bạn đến trang trò chuyện online của Sosi',
            error_login : 'Something wrong'
        })
    })
}

//[POST] /register
exports.registerPOST = async(req,res) => {
    let {username, email, password, password2} = req.body

    if(password != password2){
        res.render('client/login',{
            title : 'Chào mừng bạn đến trang trò chuyện online của Sosi',
            error_register : 'Password do not match'
        })
    }

    const findUser = await User.findOne({email : email})
    // console.log(findUser)

    if(findUser){

        res.render('client/login',{
            title : 'Chào mừng bạn đến trang trò chuyện online của Sosi',
            error_register : 'Email address already exits'
        })
    }
    else{
        password = Crypto.AES.encrypt(password, process.env.CRYPTO_KEY).toString()
        const avatar = process.env.AVATAR_DEFAULT
        const status = 1

        // console.log(avatar)

        const newUser = new User({username, email, password,avatar,status})
        newUser.save()
        res.redirect('/login')
    }
}

//[POST] /complete-user
exports.CompleteUser = async(req,res) => {
    let user = req.body.user
    user.sex = req.body.sex
    user.age = req.body.age
    user.option = req.body.option

    const updateUser = new User(user)
    updateUser.save()

    res.redirect('/')
}