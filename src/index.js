const express = require('express')
const ejs = require('ejs')
const cookieParser = require('cookie-parser')
const path = require('path')
const routes = require('./routes')
app = express()


// setup 
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieParser())

// set view ejs
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname + '/views'))


// set routes
routes(app)


app.listen(3000,() => {
    console.log('server is running port 3000')
})