const mongoose = require('mongoose')

async function connect () {
    try {
        await mongoose.connect('mongodb://localhost:27017/sosichat', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('connect db successfully')
    } catch (error) {
        console.log('connect db fail' + error.message)        
    }
}

module.exports = {connect}

// 'mongodb://localhost:27017/sosichat'
// 'mongodb+srv://sositech:soicondibui@cluster0.crtjk.mongodb.net/sosichat?retryWrites=true&w=majority'