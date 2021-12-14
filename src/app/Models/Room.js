const mongoose = require('mongoose')
const Schema = mongoose.Schema


const Room = new Schema({
    title : String,
    list_user : [{
        user_id : String,
        public_infor : Number,
    }],
    message : [{
        msg : String,
        user_id : String,
        user_name : String,
        time : String,
    }]
}, {versionKey: false})

module.exports = mongoose.model('Room', Room)