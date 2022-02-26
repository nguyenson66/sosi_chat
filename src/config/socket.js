const Room = require('../app/Models/Room');
const Message = require('../app/Models/Message');
const User = require('../app/Models/User');
const moment = require('moment');

function socketIO(io) {
    io.on('connection', function (socket) {
        // console.log(socket.id);

        socket.on('joinRoom', (room_id) => {
            // console.log(room_id)
            socket.join(room_id);
        });

        socket.on('messageChatRoom', ({ room_id, user_id, user_name, msg }) => {
            // console.log({ room_id, user_id, user_name, msg });

            const time = moment().format('DD/MM/YYYY hh:mm A');
            // console.log(time)

            let user_id_s = user_id,
                user_name_s = user_name,
                msg_s = msg,
                avatar = 'https://bit.ly/3Lxwgqe';

            Room.findById(room_id)
                .then(async (room) => {
                    // set name user is 'stranger' if public_infor = 0
                    const public_infor = room.public_infor;
                    if (!public_infor) user_name_s = 'Người lạ';
                    else {
                        const data_user = await User.findById(user_id);
                        avatar = data_user.avatar;
                    }

                    const message = new Message({
                        room_id: room_id,
                        user_id: user_id,
                        content: msg,
                        time: time,
                    });

                    // send message to all user in room
                    io.to(room_id).emit('message', {
                        user_id_s,
                        user_name_s,
                        msg_s,
                        time,
                        avatar,
                    });

                    // console.log(message)
                    message.save();
                })
                .catch((err) => {
                    console.log(err.message);
                });
        });

        /// new stranger room
        socket.on('new-stranger-room', (user_id) => {
            User.findById(user_id)
                .then(async function (user) {
                    const option = user.option;
                    let list_user = [];

                    for (let i = 0; i < option.length; i++) {
                        // Search for the right user through option
                        await User.find({ sex: option[i], option: user.sex })
                            .then((user_pair) => {
                                // delete user created room in list user
                                user_pair = user_pair.find(
                                    (user) => user._id != user_id
                                );

                                if (user_pair != undefined) {
                                    list_user = list_user.concat(user_pair);
                                }
                            })
                            .catch((err) => console.log(err.message));
                    }

                    let list_user_2 = [];
                    /// Check if two users have the same room
                    for (let j = 0; j < list_user.length; j++) {
                        await Room.findOne({
                            $or: [
                                { list_user: [user_id, list_user[j]._id] },
                                { list_user: [list_user[j]._id, user_id] },
                            ],
                        })
                            .then((c_room) => {
                                if (!c_room) list_user_2.push(list_user[j]);
                            })
                            .catch((err) => console.log(err.message));
                    }

                    if (list_user_2.length != 0) {
                        const rd_user = Math.floor(
                            Math.random() * list_user_2.length
                        );
                        const room = new Room({
                            title: 'Trò chuyện cùng người lạ',
                            list_user: [user_id, list_user_2[rd_user]._id],
                            public_infor: false,
                            public_room: false,
                            avatar: 'https://res.cloudinary.com/soicondibui/image/upload/v1642665781/sosichat/icon/question_2_p4nifa.png',
                        });

                        room.save((err, room) => {
                            if (err) console.log(err.message);
                            else {
                                socket.emit('successfull-pairing', {
                                    status: 200,
                                    room_id: room._id,
                                });
                            }
                        });
                    } else {
                        socket.emit('successfull-pairing', {
                            status: 404,
                            room_id: '',
                        });
                    }
                })
                .catch((err) => console.log(err.message));
        });

        //// new group room chat
        socket.on('new-group-chat', (user_id) => {
            Room.create(
                {
                    title: 'Nhóm chat vui vẻ <3',
                    list_user: [user_id],
                    public_room: true,
                    public_infor: true,
                    avatar: 'https://res.cloudinary.com/soicondibui/image/upload/v1642665782/sosichat/icon/people_a9kmc5.png',
                },
                function (err, data) {
                    if (err) console.log(err.message);
                    else {
                        socket.emit('redirect-group-chat', data._id);
                    }
                }
            );
        });

        socket.on('disconnect', () => {});
    });
}

module.exports = socketIO;
