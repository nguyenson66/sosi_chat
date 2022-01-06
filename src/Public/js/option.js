$('#new-stranger-room').click(() => {
    socket.emit('new-stranger-room', '<%- user._id %>');
    console.log('<%- user._id %>')
    alert(
        'Đang tìm đối tượng thích hợp cho bạn vui lòng đợi trong giây lát'
    );

    // listen event successfull pairing
    socket.on('successfull-pairing', (room_id) => {
        form_redirect.action = '/c/' + room_id;
        form_redirect.submit();
    });
});

$('#new-group').click(() => {
    socket.emit('new-group-chat', '<%- user._id %>');
    alert(
        `Tạo phòng trò chuyện thành công bấm 'ok' để chuyển hướng`
    );

    socket.on('redirect-group-chat', (room_id) => {
        form_redirect.action = '/c/' + room_id;
        form_redirect.submit();
    });
});