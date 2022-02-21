const path = require('path');
const jwt = require('jsonwebtoken');
const Crypto = require('crypto-js');
const User = require('../../Models/User');
const Room = require('../../Models/Room');
const Message = require('../../Models/Message');

//[GET] /
exports.introduce = (req, res) => {
    console.log('client send require');
    res.render('client/introduce');
};

//[GET] /home
exports.home = (req, res) => {
    const user = req.body.user;
    let completed_user = true;

    if (user.sex == undefined) {
        completed_user = false;
    }

    Room.find({ list_user: user._id })
        .then(function (room) {
            res.render('client/home', {
                user: {
                    _id: user._id,
                    user_name: user.username,
                    avatar: user.avatar,
                },
                title: 'Sosichat.tech',
                list_room: room,
                completed_user,
            });
        })
        .catch((err) => console.log(err.message));
};

//[GET] /j/:id
exports.joinRoom = async (req, res) => {
    const user = req.body.user;

    const room_id = req.params.id;
    Room.findById(room_id)
        .then((room) => {
            if (room.public_room) {
                //check already exits in the group
                if (!room.list_user.includes(user._id)) {
                    room.list_user.push(user._id);
                    room.save();
                }

                // redirect room
                res.redirect('/c/' + room_id);
            } else {
                res.redirect('/');
            }
        })
        .catch((err) => {
            console.log(err.message);

            //render view 404
            res.redirect('/');
        });
};

//[GET] /c/:id
exports.chat = async (req, res) => {
    const room_id = req.params.id;
    const data_user = req.body.user;

    try {
        // find room chat by id
        let room = await Room.findById(room_id);

        // check user already exists in room
        if (room.list_user.includes(data_user._id)) {
            var message = await Message.find({ room_id: room._id });

            // find all room user already exists in room
            const list_room = await Room.find({
                list_user: data_user._id,
            }).select('title avatar');

            // if user public information get title room is username stranger and get avatar
            if (room.public_infor) {
                let stranger = room.list_user.filter(
                    (item) => item != data_user._id
                );

                for (let i = 0; i < stranger.length; i++) {
                    stranger[i] = await User.findById(stranger[i]).select(
                        'username avatar'
                    );
                }

                for (let i = 0; i < message.length; i++) {
                    // format time
                    const f_time = message[i].time.split(' ');

                    if (message[i].user_id == data_user._id) {
                        message[i] = {
                            user_id: message[i].user_id,
                            user_name: 'You',
                            avatar: data_user.avatar,
                            content: message[i].content,
                            time: f_time[1],
                        };
                    } else {
                        const user = stranger.find(
                            (user) => user._id == message[i].user_id
                        );

                        message[i] = {
                            user_id: message[i].user_id,
                            user_name: user.username,
                            avatar: user.avatar,
                            content: message[i].content,
                            time: f_time[1],
                        };
                    }
                }
            } else {
                for (let i = 0; i < message.length; i++) {
                    //format time
                    const f_time = message[i].time.split(' ');

                    message[i] = {
                        user_id: message[i].user_id,
                        avatar: 'https://bit.ly/3Lxwgqe',
                        content: message[i].content,
                        time: f_time[1],
                    };

                    if (message[i].user_id == data_user._id) {
                        message[i].user_name = 'You';
                    } else {
                        message[i].user_name = 'Người lạ';
                    }
                }
            }

            res.render('client/chat', {
                title: room.title,
                user: {
                    _id: data_user._id,
                    username: data_user.username,
                },
                message,
                list_room,
            });
            // res.json({
            //     title: room.title,
            // user_id: data_user._id,
            //     message,
            //     list_room,
            // });
        } else {
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error);
        res.redirect('/home');
    }
};

/////////////////////////////////// POST ///////////////////////////////////////
