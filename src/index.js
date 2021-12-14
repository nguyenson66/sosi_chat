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

///
const Room = require('./app/Models/Room')

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

        // console.log({room_id,user_id, user_name, msg})

        // socket.join(room)

        const time = moment().format('h:mm A DD/MM/YYYY')
        // console.log(time)

        Room.findById(room_id)
            .then(room => {
                room.message.push({
                    msg : msg,
                    user_id : user_id,
                    user_name : user_name,
                    time : time
                })

                room.save()
                    .then(() => {})
                    .catch(err => console.log(err.message))
            })
            .catch(err => {
                console.log(err.message)
            })
        
        const user_id_s = user_id, user_name_s = user_name,msg_s = msg, time_s = time

        io.to(room_id).emit('message', {user_id_s,user_name_s,msg_s, time_s})
    })

    socket.on('disconnect' , () => {

    })
})
///////////////////////////////////////////////////////


server.listen(3000 , () => {
    console.log('server is running')
})