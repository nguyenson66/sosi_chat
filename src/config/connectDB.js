const mongoose = require('mongoose')

async function connect () {
    try {
        await mongoose.connect(process.env.DB_CLOUD, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('connect db successfully')
    } catch (error) {
        console.log('connect db fail' + error.message)        
    }
}

module.exports = {connect}