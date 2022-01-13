const express = require('express')
// const expressLayouts = require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const path = require('path')
const routes = require('./routes')
const db = require('./config/connectDB')
const dotenv = require('dotenv').config()


const socketIO = require('./config/socket')

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


///////// socket ///
socketIO(io)
/////////////


server.listen(3000 , () => {
    console.log('server is running')
})