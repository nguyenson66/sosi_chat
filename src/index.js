const express = require('express')
const ejs = require('ejs')
const expressLayouts = require('express-ejs-layouts')
const cookieParser = require('cookie-parser')
const path = require('path')
const routes = require('./routes')
app = express()


// setup 
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieParser())

// set template engine
app.use(expressLayouts)
app.set('layout', path.join(__dirname + '/views/layouts/home-layout'))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname + '/views'))


// set routes
routes(app)


app.listen(3000,() => {
    console.log('server is running port 3000')
})