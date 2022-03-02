//////// join all list room //////////////

// say to server user join room
socket.emit('joinRoom', list_room_id);

// change title room
socket.on('statusChangeTitleRoom', ({ currentRoomId, title }) => {
    if (currentRoomId == room_id) {
        document.getElementById(`title-room-${currentRoomId}`).innerText =
            title;
        document.title = title;
    }

    document.getElementById(`room-${currentRoomId}`).innerText = title;
});

// change last message in list room
socket.on(
    'message',
    ({ room_id, user_id_s, user_name_s, msg, type, time, avatar }) => {
        let username = user_name_s;

        if (user_id == user_id_s) username = 'You';

        let lastMessage = msg;

        if (type == 'sticker') lastMessage = 'Đã gửi một Sticker';
        else if (type == 'image') lastMessage = 'Đã gửi một hình ảnh.';

        document.getElementById(
            `last-message-${room_id}`
        ).innerText = `${username}: ${lastMessage}`;
    }
);
