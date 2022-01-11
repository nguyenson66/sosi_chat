const path = require('path')
const jwt = require('jsonwebtoken')
const Crypto = require('crypto-js')
const User = require('../../Models/User')
const Room = require('../../Models/Room')
const Message = require('../../Models/Message')

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

//[GET] /
exports.home = (req,res) => {
    const user = req.body.user
    let complete_user = false

    if(user.sex == undefined){
        complete_user = true
    }

    Room.find({'list_user' : user._id }).then(function(room) {

        res.render('client/home',{
            user : {
                '_id' : user._id,
                'user_name' : user.username,
                'avatar' : user.avatar,
            },
            title : 'Sosichat.tech',
            list_room : room,
            complete_user
        })

    }).catch(err => console.log(err.message))
}

//[GET] /login
exports.login = async (req,res) => {
    res.render('client/login',{
        title : 'Chào mừng bạn đến trang trò chuyện online của Sosi'
    })
}

//[GET] /j/:id
exports.joinRoom = async (req,res) => {
    const user = req.body.user

    const room_id = req.params.id
    Room.findById(room_id)
        .then(room => {
            if(room.public_room){
                
                //check already exits in the group
                if(!room.list_user.includes(user._id)){
                    room.list_user.push(user._id)
                    room.save();
                }

                // redirect room
                res.redirect('/c/' + room_id)
            }
            else{
                res.redirect('/')
            }
        })
        .catch(err => {
            console.log(err.message)

            //render view 404
            res.redirect('/')
        })
}

//[GET] /c/:id
exports.chat = async (req,res) => {
    console.log('start')
    const room_id = req.params.id
    const data_user = req.body.user

    Room.findById(room_id)
        .then(async function(room) {
            const checkUserInRoom = room.list_user.find(userId => userId == data_user._id)
            console.log('check')

            if(!checkUserInRoom){
                res.redirect('/')
            }
            else
            {
                let message, list_room
                await Message.find({room_id : room._id})
                    .then(msg => {
                        console.log('done')

                        message = msg
                    })
                    .catch(err => {
                        console.log(err.message)

                        /// render view 404
                        res.redirect('/')
                    })
                
                await Room.find({list_user : data_user._id})
                    .then(room => {
                        list_room = room
                    })
                    .catch(err => {
                        console.log(err.message)
                        
                        /// render view 404
                        res.redirect('/')
                
                
                    })
                
                let title_room
                if(room.public_room){
                    title_room = room.title
                }else{
                    if(room.public_infor){
                        const stranger_id = room.list_user.find(id => id != data_user._id)
                        await User.findById(stranger_id)
                            .then(data => title_room = data.username)
                            .catch(err => console.log(err))
                    }else{
                        title_room = 'Người lạ'
                    }
                }


                console.log('response')
                res.render('client/chat', {
                    title : title_room,
                    user : {
                        '_id' : data_user._id,
                        'user_name' : data_user.username,
                        'avatar' : data_user.avatar,
                    },
                    list_room : list_room,
                    message : message,
                })
            }
        })
        .catch(err => {
            console.log(err)

            /// render view 404
            res.redirect('/')
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

exports.CompleteUser = async(req,res) => {
    let user = req.body.user
    user.sex = req.body.sex
    user.age = req.body.age
    user.option = req.body.option

    const updateUser = new User(user)
    updateUser.save()

    res.redirect('/')
}