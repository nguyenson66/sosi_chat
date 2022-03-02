const Room = require('../app/Models/Room');
const Message = require('../app/Models/Message');
const User = require('../app/Models/User');
const moment = require('moment');
const events = require('../app/Middleware/EventEmitter');
const botAI = require('../app/Middleware/BOT');
const asyncWrapper = require('../app/Middleware/asyncWrapper');

function socketIO(io) {
    io.on('connection', function (socket) {
        // console.log(socket.id);

        socket.on('joinRoom', (list_room_id) => {
            let list_id = list_room_id.split(',');

            /// join all room of user
            for (let i = 0; i < list_id.length; i++) {
                socket.join(list_id[i]);
            }
        });

        socket.on(
            'messageChatRoom',
            ({ room_id, user_id, user_name, type, msg }) => {
                // console.log({ room_id, user_id, user_name, msg });

                const time = moment()
                    .utcOffset(420)
                    .format('YYYY/MM/DD HH:mm:ss:ms');
                // console.log(time)

                let user_id_s = user_id,
                    user_name_s = user_name,
                    msg_s = msg,
                    avatar = process.env.AVATAR_STRANGER;

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
                            room_id,
                            user_id_s,
                            user_name_s,
                            msg,
                            type,
                            time,
                            avatar,
                        });

                        io.to(room_id).emit('typingMessage', {
                            currentRoomId: room_id,
                            typingServer: false,
                        });

                        // console.log(message)
                        await message.save();

                        //////////////////// MESSAGE BOT /////////////////
                        if (msg.substring(0, 4) == '!bot') {
                            botAI.messageProcessing(
                                msg
                                    .toLowerCase()
                                    .substring(4, msg.length)
                                    .trim()
                            );
                        }
                        /////////////////////////////////////////////////
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

                        const time = moment()
                            .utcOffset(420)
                            .format('YYYY/MM/DD HH:mm:ss:ms');
                        //BOT send message to the room
                        io.to(room_id).emit('message', {
                            room_id,
                            user_id_s: '621cd6aaf36dd4349f838a08',
                            user_name_s: 'BOT',
                            msg: `'${user_name}' đã thêm '${user.username}' vào nhóm`,
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

        // event change title room
        socket.on(
            'changeTitleRoom',
            asyncWrapper(async ({ user_name, title, room_id }) => {
                let room = await Room.findById(room_id);
                room.title = title;
                room.save();

                // format time
                const time = moment()
                    .utcOffset(420)
                    .format('YYYY/MM/DD HH:mm:ss:ms');

                // check public_infor
                let username = user_name;
                if (!room.public_infor) username = 'Một người lạ';

                //BOT send message to the room/////
                io.to(room_id).emit('message', {
                    room_id,
                    user_id_s: '621cd6aaf36dd4349f838a08',
                    user_name_s: 'BOT',
                    msg: `'${username}' đã thay đổi tên của nhóm`,
                    type: 'text',
                    time,
                    avatar: 'https://res.cloudinary.com/soicondibui/image/upload/v1646059461/sosichat/avatarbot_ai6zji.jpg',
                });

                // save message to database
                const message = new Message({
                    room_id: room_id,
                    user_id: '621cd6aaf36dd4349f838a08',
                    content: `${username} đã thay đổi tên của nhóm`,
                    type: 'text',
                    time,
                });

                message.save();
                ////////////////////////////////////

                io.to(room_id).emit('statusChangeTitleRoom', {
                    currentRoomId: room_id,
                    title,
                });
            })
        );

        //listen typing message event
        socket.on('typingMessage', ({ room_id, typing }) => {
            const typingServer = typing;
            let timeOut = undefined;

            if (typing) {
                timeOut = setTimeout(() => {
                    io.to(room_id).emit('typingMessage', {
                        currentRoomId: room_id,
                        typingServer: false,
                    });
                }, 5000);
            } else {
                clearTimeout(timeOut);
            }

            io.to(room_id).emit('typingMessage', {
                currentRoomId: room_id,
                typingServer,
            });
        });

        socket.on('disconnect', () => {});
    });

    //////////////////// Event emitter ///////////////////

    //user out room
    events.on('userOutRoom', (username, roomId) => {
        const time = moment().utcOffset(420).format('YYYY/MM/DD HH:mm:ss:ms');
        //BOT send message to the room
        io.to(roomId).emit('message', {
            room_id: roomId,
            user_id_s: '621cd6aaf36dd4349f838a08',
            user_name_s: 'BOT',
            msg: `'${username}' đã rời khỏi nhóm :<  !!!`,
            type: 'text',
            time,
            avatar: 'https://res.cloudinary.com/soicondibui/image/upload/v1646059461/sosichat/avatarbot_ai6zji.jpg',
        });

        const message = new Message({
            room_id: roomId,
            user_id: '621cd6aaf36dd4349f838a08',
            content: `'${username}' đã rời khỏi nhóm :< !!!`,
            type: 'text',
            time,
        });

        message.save();
    });

    events.on('userJoinRoom', ({ username, roomId }) => {
        const time = moment().utcOffset(420).format('YYYY/MM/DD HH:mm:ss:ms');
        //BOT send message to the room
        io.to(roomId).emit('message', {
            room_id: roomId,
            user_id_s: '621cd6aaf36dd4349f838a08',
            user_name_s: 'BOT',
            msg: `'${username}' vừa tham gia nhóm. Chúc bạn một ngày vui vẻ !!!`,
            type: 'text',
            time,
            avatar: 'https://res.cloudinary.com/soicondibui/image/upload/v1646059461/sosichat/avatarbot_ai6zji.jpg',
        });

        const message = new Message({
            room_id: roomId,
            user_id: '621cd6aaf36dd4349f838a08',
            content: `'${username}' vừa tham gia nhóm. Chúc bạn một ngày vui vẻ !!!`,
            type: 'text',
            time,
        });

        message.save();
    });
}

module.exports = socketIO;
