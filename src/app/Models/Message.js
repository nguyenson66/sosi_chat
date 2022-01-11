const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Message = new Schema({
    room_id : {type : String, index: true},
    user_id : {type : String, index: true},
    user_name : String,
    content : String,
    time : String,
}, {versionKey: false})


module.exports = mongoose.model('Message', Message)