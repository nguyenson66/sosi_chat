const express = require('express')
// const expressLayouts = require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const path = require('path')
const routes = require('./routes')
const db = require('./config/connectDB')
const moment = require('moment')

/// schema db ////
const Room = require('./app/Models/Room')
const Message = require('./app/Models/Message')
const User = require('./app/Models/User')

// setup 
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieParser())
db.connect();

// set template engine
// app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname + '/views'))


// set routes
routes(app)


/////////////////////////////////////////// socket ///////////////////////////////////////////////////////
io.on('connection', function(socket) {
    // console.log(socket.id)

    socket.on('joinRoom', room_id => {
        // console.log(room_id)
        socket.join(room_id)
    })

    socket.on('messageChatRoom', ({room_id,user_id, user_name, msg}) => {
        
        const time = moment().format('h:mm:ss A DD/MM/YYYY')
        // console.log(time)
        
        let user_id_s = user_id, user_name_s = user_name,msg_s = msg

        Room.findById(room_id)
            .then(room => {
                // set name user is 'stranger' if public_infor = 0 
                const public_infor = room.public_infor
                if(!public_infor)
                    user_name_s = 'Người lạ'

                const message = new Message({
                    room_id : room_id,
                    user_id : user_id,
                    user_name : user_name_s,
                    content : msg,
                    time : time,
                })    
                
                // send message to all user in room
                io.to(room_id).emit('message', {user_id_s,user_name_s,msg_s})
                
                // console.log(message)
                message.save()
            })
            .catch(err => {console.log(err.message)})
    })

    /// new stranger room
    socket.on('new-stranger-room', (user_id) => {
        User.findById(user_id)
            .then(async function(user) {
                const option = user.option
                let list_user = []

                for(let i=0;i<option.length;i++){
                    // Search for the right user through option
                    await User.find({'sex' : option[i],
                            'option' : user.sex,
                        })
                        .then(user_pair => {
                            // delete user created room in list user
                            user_pair = user_pair.find(user => user._id != user_id)

                            if(user_pair != undefined){
                                list_user = list_user.concat(user_pair)
                            }
                        })
                        .catch(err => console.log(err.message))
                    }
                    
                let list_user_2 = []
                /// Check if two users have the same room
                for(let j = 0;j < list_user.length; j++){
                    await Room.findOne({
                        'list_user' : [user_id, list_user[j]._id]
                    })
                        .then(c_room =>{
                            if(!c_room)
                                list_user_2.push(list_user[j])
                        })
                        .catch(err => console.log(err.message))
                }

                if(list_user_2.length != 0){
                    const rd_user = Math.floor(Math.random() * list_user_2.length)
                    const room = new Room({
                        title : 'Trò chuyện cùng người lạ',
                        list_user : [user_id,list_user_2[rd_user]._id],
                        public_infor : false,
                        public_room : false,
                        avatar : "avatar_room.jpg",
                    })

                    room.save((err, room) => {
                        if(err) console.log(err.message)
                        else{
                            const room_id = room._id

                            socket.emit('successfull-pairing', room_id)
                        }
                    })
                }
                else{
                    console.log('khong the ghep doi')
                }
            })
            .catch(err => console.log(err.message))
    })

    //// new group room chat
    socket.on('new-group-chat' ,(user_id) => {
        Room.create({
            title : 'Nhóm chat vui vẻ <3',
            list_user : [user_id],
            public_room : true,
            public_infor : true,
            avatar : 'avatar_room.jpg'
        }, function(err, data) {
            if(err) console.log(err.message)
            else{

                socket.emit('redirect-group-chat', data._id)
            }
        })
    })

    socket.on('disconnect' , () => {

    })
})
////////////////////////////////////////////////////////////////////////////////////////////////////


server.listen(3000 , () => {
    console.log('server is running')
})