// new room with stranger
function newStranger() {
    setDataToast('info');
    setTimeout(() => {
        socket.emit('new-stranger-room', user_id);
    }, 3000);
}

socket.on('successfull-pairing', ({ status, room_id }) => {
    if (status == 200) {
        setDataToast('success');

        window.setTimeout(() => {
            window.location.href = '/c/' + room_id;
        }, 3300);
    } else if (status == 404) {
        setDataToast('error');
    }
});

// create new group
function newGroup() {
    showToast({
        type: 'info',
        title: 'Server',
        icon: 'fas fa-info-circle',
        message: 'Đang tạo phòng chat nhóm vui lòng đợi !!!',
    });

    setTimeout(() => {
        socket.emit('new-group-chat', user_id);
    }, 3300);
}

socket.on('redirect-group-chat', (room_id) => {
    showToast({
        type: 'success',
        title: 'Tạo nhóm thành công !',
        icon: 'far fa-check-circle',
        message: 'Bạn sẽ tự động chuyển hướng sau 3 giây.',
    });

    window.setTimeout(() => {
        window.location.href = '/c/' + room_id;
    }, 3300);
});
