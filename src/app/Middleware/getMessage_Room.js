const Message = require('../Models/Message');
const User = require('../Models/User');
const asyncWrapper = require('./asyncWrapper');

module.exports.getMessage = asyncWrapper(
    async (data_room, user_id, numberSkip) => {
        let message = await Message.find({ room_id: data_room._id })
            .sort({ time: 'desc' })
            .skip(Number(numberSkip))
            .limit(20);

        /// check type of room if type == group => username, avatar public
        if (data_room.type == 'group') {
            //find name and avatar user

            for (let i = 0; i < message.length; i++) {
                const user = await User.findById(message[i].user_id);

                if (message[i].user_id == user_id) {
                    message[i] = {
                        ...message[i]._doc,
                        username: 'You',
                        avatar: user.avatar,
                    };
                } else {
                    message[i] = {
                        ...message[i]._doc,
                        username: user.username,
                        avatar: user.avatar,
                    };
                }
            }
        } else {
            for (let i = 0; i < message.length; i++) {
                if (message[i].user_id == process.env.ID_BOT) {
                    const user = await User.findById(process.env.ID_BOT);

                    message[i] = {
                        ...message[i]._doc,
                        username: user.username,
                        avatar: user.avatar,
                    };
                } else if (message[i].user_id == user_id) {
                    message[i] = {
                        ...message[i]._doc,
                        username: 'You',
                        avatar: process.env.AVATAR_STRANGER,
                    };
                } else {
                    message[i] = {
                        ...message[i]._doc,
                        username: 'Người lạ',
                        avatar: process.env.AVATAR_STRANGER,
                    };
                }
            }
        }

        for (let i = 0; i < message.length; i++) {
            message[i].time = message[i].time.split(' ')[1].substring(0, 5);
        }

        return message.reverse();
    }
);

module.exports.getInforRoom = asyncWrapper(async (list_room, user_id) => {
    for (let i = 0; i < list_room.length; i++) {
        const room_id = list_room[i]._id;

        const last_msg = await Message.findOne({ room_id })
            .sort({ time: 'desc' })
            .select('user_id content type');

        if (!last_msg) {
            list_room[i] = {
                ...list_room[i]._doc,
                last_msg: 'Chúc bạn một ngày vui vẻ !',
                username: 'BOT',
            };
        } else {
            const user = await User.findById(last_msg.user_id).select(
                'username'
            );

            let username = user.username;

            // check public infor , if public_infor = false => username = 'Stranger'
            if (list_room[i].type == 'stranger') username = 'Người lạ';

            if (last_msg.user_id == process.env.ID_BOT) username = 'BOT';

            if (user_id == last_msg.user_id) username = 'You';

            let msg = last_msg.content;
            if (last_msg.type == 'sticker') msg = 'Đã gửi một Sticker';
            else if (last_msg.type == 'image') msg = 'Đã gửi một hình ảnh.';

            list_room[i] = {
                ...list_room[i]._doc,
                last_msg: msg,
                username,
            };
        }
    }

    return list_room;
});
