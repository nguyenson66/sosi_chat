const path = require('path')
const jwt = require('jsonwebtoken')
const Crypto = require('crypto-js')
const User = require('../../Models/User')
const Room = require('../../Models/Room')
const Message = require('../../Models/Message')


//[GET] /
exports.introduce = (req,res) => {
    res.render('client/introduce')
}

//[GET] /home
exports.home = (req,res) => {
    const user = req.body.user
    let completed_user = true

    
    if(user.sex == undefined){
        completed_user = false
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
            completed_user
        })

    }).catch(err => console.log(err.message))
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
            const checkUserInRoom = room.list_user.find(userId => userId == data_user._id)

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

                console.log(list_room)

                res.render('client/chat-new', {
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

//[GET] /rutgon
exports.rutgon = (req,res) => {
    res.render('client/rutgon')
}

/////////////////////////////////// POST ///////////////////////////////////////