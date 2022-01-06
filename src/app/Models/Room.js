const mongoose = require('mongoose')
const Schema = mongoose.Schema


const Room = new Schema({
    title : String,
    list_user : [String],
    public_room : Boolean,
    public_infor : Boolean,
    avatar : String,
}, {versionKey: false})

module.exports = mongoose.model('Room', Room)