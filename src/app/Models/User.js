const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema(
    {
        username: String,
        password: String,
        sex: Number,
        age: String,
        avatar: String,
        option: [Number],
        email: String,
        status: Number,
        role: Number,
        isVerified: Boolean,
    },
    { versionKey: false }
);

module.exports = mongoose.model('User', User);
