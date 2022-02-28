const Room = require('../app/Models/Room');
const Message = require('../app/Models/Message');
const User = require('../app/Models/User');
const moment = require('moment');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

function socketIO(io) {
    io.on('connection', function (socket) {
        // console.log(socket.id);

        socket.on('joinRoom', (room_id) => {
            // console.log(room_id)
            socket.join(room_id);
        });

        socket.on(
            'messageChatRoom',
            ({ room_id, user_id, user_name, type, msg }) => {
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
                            type,
                            time: time,
                        });

                        // send message to all user in room
                        io.to(room_id).emit('message', {
                            user_id_s,
                            user_name_s,
                            msg_s,
                            type,
                            time,
                            avatar,
                        });

                        // console.log(message)
                        message.save();
                    })
                    .catch((err) => {
                        console.log(err.message);
                    });
            }
        );

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
                            list_user: [
                                user_id,
                                list_user_2[rd_user]._id,
                                '621cd6aaf36dd4349f838a08',
                            ],
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
                    list_user: [user_id, '621cd6aaf36dd4349f838a08'],
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

        /// add member to room
        socket.on(
            'addMembersToRoom',
            async ({ user_name, emailMember, room_id }) => {
                try {
                    const user = await User.findOne({ email: emailMember });

                    if (user) {
                        let room = await Room.findById(room_id);

                        if (room.list_user.includes(user._id)) {
                            // send status add member event
                            socket.emit('statusAddMembers', {
                                statusAddMember: 300,
                                msg: `Tài khoản ${user.username} đã có trong nhóm !!!`,
                            });
                            return;
                        }

                        room.list_user.push(user._id);
                        room.save();

                        // send status add member event
                        socket.emit('statusAddMembers', {
                            statusAddMember: 200,
                            msg: `Đã thêm ${user.username} vào nhóm thành công !!!`,
                        });

                        const time = moment().format('DD/MM/YYYY hh:mm A');
                        //BOT send message to the room
                        io.to(room_id).emit('message', {
                            user_id_s: '621cd6aaf36dd4349f838a08',
                            user_name_s: 'BOT',
                            msg_s: `'${user_name}' đã thêm '${user.username}' vào nhóm`,
                            type: 'text',
                            time,
                            avatar: 'https://res.cloudinary.com/soicondibui/image/upload/v1646059461/sosichat/avatarbot_ai6zji.jpg',
                        });

                        const message = new Message({
                            room_id: room_id,
                            user_id: '621cd6aaf36dd4349f838a08',
                            content: `${user_name} đã thêm ${user.username} vào nhóm`,
                            type: 'text',
                            time,
                        });

                        message.save();
                    } else {
                        // send status add member event
                        socket.emit('statusAddMembers', {
                            statusAddMember: 404,
                            msg: `Không tìm thấy tài khoản có địa chỉ email là ${emailMember}`,
                        });
                    }
                } catch (error) {
                    console.log(error);
                    // send status add member event
                    socket.emit('statusAddMembers', {
                        statusAddMember: 500,
                        msg: `Server đang quá tải vui lòng thử lại sau vài phút !!`,
                    });
                }
            }
        );

        //////////////////// Event emitter ///////////////////

        //user out room
        eventEmitter.on('userOutRoom', (username, roomId) => {
            console.log(username, roomId);
        });

        socket.on('disconnect', () => {});
    });
}

module.exports = socketIO;
