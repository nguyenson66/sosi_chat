const path = require('path')
const jwt = require('jsonwebtoken')
const User = require('../../Models/User')
const Room = require('../../Models/Room')
const Message = require('../../Models/Message')

exports.checkLogin = (req,res,next) => {
    const user_cookie = req.cookies.user_cookie
    if(!user_cookie){
        res.redirect('/login')
    }
    else{
        const data_user = jwt.verify(user_cookie, 'sosichat')

        User.findById(data_user.user_id)
            .then(user => {
                if(!user) res.redirect('login')
                else{
                    req.body.user = user
                    next()
                }
            })
            .catch(err => {
                console.log(err.message)
                res.redirect('/login')
            })
    }
}

//[GET] /
exports.home = (req,res) => {
    const user = req.body.user

    Room.find({'list_user' : user._id }).then(function(room) {

        res.render('client/home',{
            user : {
                '_id' : user._id,
                'user_name' : user.username,
                'avatar' : user.avatar,
            },
            title : 'Sosichat.tech',
            list_room : room,
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
    const room_id = req.params.id
    const data_user = req.body.user

    Room.findById(room_id)
        .then(async function(room) {
            const checkUserInRoom = room.list_user.find(user => user == data_user._id)

            if(!checkUserInRoom){
                res.redirect('/')
            }
            else
            {
                let message, list_room
                await Message.find({room_id : room._id})
                    .then(msg => {
                        
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