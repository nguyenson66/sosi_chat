const path = require('path');
const Crypto = require('crypto-js');
const fs = require('fs');
const Room = require('../../Models/Room');
const events = require('../../Middleware/EventEmitter');
const asyncWrapper = require('../../Middleware/asyncWrapper');
const getMessage_Room = require('../../Middleware/getMessage_Room');
const upload = require('../../Middleware/upload');

//[GET] /introduce
exports.introduce = (req, res) => {
    res.render('client/introduce');
};

//[GET] /
exports.home = asyncWrapper(async (req, res) => {
    const data_user = req.body.user;
    let completed_user = true;

    if (data_user.sex == undefined) {
        completed_user = false;
    }

    // get list room of user
    let list_room = await Room.find({ list_user: data_user._id });
    list_room = await getMessage_Room.getInforRoom(list_room, data_user._id);

    res.render('client/home', {
        data_user,
        title: 'Sosichat.tech',
        list_room,
        completed_user,
        list_id_room: list_room.map((x) => x._id),
    });
});

//[GET] /j/:id
exports.joinRoom = asyncWrapper(async (req, res) => {
    const user = req.body.user;

    const room_id = req.params.id;

    const room = await Room.findById(room_id);

    if (room.public_room) {
        if (!room.list_user.includes(user._id)) {
            room.list_user.push(user._id);
            await room.save();

            events.emit('userJoinRoom', {
                username: user.username,
                roomId: room_id,
            });
        }

        res.redirect('/c/' + room_id);
    } else {
        res.status(404).sendFile(
            path.join(__dirname, '../../../views/404.html')
        );
    }
});

//[GET] /c/:id
exports.chat = asyncWrapper(async (req, res) => {
    const room_id = req.params.id;
    const data_user = req.body.user;

    const data_room = await Room.findById(room_id);

    //check user exists in the room
    if (!data_room.list_user.includes(data_user._id)) {
        //if user doesn't exist in the room, user will see 404 not found
        res.status(404).sendFile(
            path.join(__dirname, '../../../views/404.html')
        );
    } else {
        // get list room of user
        let list_room = await Room.find({ list_user: data_user._id });
        list_room = await getMessage_Room.getInforRoom(
            list_room,
            data_user._id
        );

        /// get message in the room
        let message = await getMessage_Room.getMessage(
            data_room,
            data_user._id,
            0
        );

        res.render('client/chat', {
            data_room,
            user: data_user,
            message,
            list_room,
            list_id_room: list_room.map((x) => x._id),
        });
    }
});

//[GET] /out/:id
exports.outRoom = asyncWrapper(async (req, res) => {
    const roomId = req.params.id;
    const userId = req.body.user._id;

    let room = await Room.findById(roomId);

    room.list_user = room.list_user.filter((ele) => {
        return ele != userId;
    });

    await room.save();

    events.emit('userOutRoom', req.body.user.username, roomId);

    res.redirect('/');
});

/////////////////////////////////// POST ///////////////////////////////////////

///////////////////////// API /////////////////////////////////

//[GET] /message?room_id=...&skip=....
exports.getMessage = asyncWrapper(async (req, res) => {
    const room_id = req.query.room_id;
    const skip = req.query.skip;
    const data_user = req.body.user;

    const data_room = await Room.findById(room_id);

    //check user exists in the room
    if (!data_room.list_user.includes(data_user._id)) {
        //if user doesn't exist in the room, user will see 404 not found
        return res.status(404).json({
            status: 404,
            msg: 'User does not exists in the room',
        });
    }

    /// get message in the room
    let message = await getMessage_Room.getMessage(
        data_room,
        data_user._id,
        skip
    );

    res.json({
        status: 200,
        message,
    });
});

//[POST] /upload-image
exports.uploadImage = asyncWrapper(async (req, res) => {
    const result = await upload.uploadImage(req.file.path);

    fs.unlink(req.file.path, (err) => {
        if (err) {
            console.log(err);
        }
    });

    res.json(result);
});
