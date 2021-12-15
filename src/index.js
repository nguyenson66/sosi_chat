const express = require('express')
// const expressLayouts = require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const path = require('path')
const routes = require('./routes')
const db = require('./Config/connectDB')
const moment = require('moment')

/// schema db ////
const Room = require('./app/Models/Room')
const Message = require('./app/Models/Message')

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


/////////////////// socket /////////////////////////////
io.on('connection', function(socket) {
    // console.log(socket.id)

    socket.on('joinRoom', room_id => {
        // console.log(room_id)
        socket.join(room_id)
    })

    socket.on('messageChatRoom', ({room_id,user_id, user_name, msg}) => {
        
        const time = moment().format('h:mm A DD/MM/YYYY')
        // console.log(time)
        
        let user_id_s = user_id, user_name_s = user_name,msg_s = msg, time_s = time

        Room.findById(room_id)
            .then(room => {
                // set name user is 'stranger' if public_infor = 0 
                const public_infor = room.list_user.find(user => user.user_id === user_id).public_infor
                if(public_infor == 0)
                    user_name_s = 'Người lạ'

                const message = new Message({
                    room_id : room_id,
                    user_id : user_id,
                    user_name : user_name_s,
                    content : msg,
                    time : time,
                })    
                
                // send message to all user in room
                io.to(room_id).emit('message', {user_id_s,user_name_s,msg_s, time_s})
                
                // console.log(message)
                message.save()
            })
            .catch(err => {console.log(err.message)})
    })

    socket.on('disconnect' , () => {

    })
})
///////////////////////////////////////////////////////


server.listen(3000 , () => {
    console.log('server is running')
})