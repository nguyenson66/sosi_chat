var chat_form = document.getElementById('chat-form');
var form_message = document.querySelector('.box-message');
form_message.scrollTop = form_message.scrollHeight;

var socket = io();
var url = window.location.pathname.split('/');
var room_id = url[url.length - 1];
// console.log(room_id);

// say to server user join room
socket.emit('joinRoom', room_id);

// event send message
chat_form.addEventListener('submit', (e) => {
    e.preventDefault();

    //get message
    let msg = e.target.elements.msg.value;
    msg = msg.trim();

    if (!msg) return false;

    //emit message to server
    socket.emit('messageChatRoom', {
        room_id,
        user_id,
        user_name,
        msg,
    });

    e.target.elements.msg.value = '';
});

// listen and push message into box message
socket.on('message', ({ user_id_s, user_name_s, msg_s, time, avatar }) => {
    console.log(avatar);

    //format time just get hh:mm
    let f_time = time.split(' ');
    f_time = f_time[1];

    const div = document.createElement('div');
    div.classList.add('message');
    if (user_id == user_id_s) div.classList.add('my-message');

    const box = document.createElement('div');

    const message_user = document.createElement('div');
    message_user.classList.add('message-user');
    const img = document.createElement('img');
    img.src = avatar;
    img.alt = 'avatar';
    const p_username = document.createElement('p');

    if (user_id == user_id_s) {
        p_username.innerText = 'You';
    } else {
        p_username.innerText = user_name_s;
    }

    message_user.appendChild(img);
    message_user.appendChild(p_username);

    //// content message and time send ////
    const message_content = document.createElement('div');
    message_content.classList.add('message-content');

    /// content
    const content = document.createElement('div');
    content.classList.add('content');

    const spanContent = document.createElement('span');
    spanContent.innerText = msg_s;

    content.appendChild(spanContent);

    /// time send
    const time_send = document.createElement('div');
    time_send.classList.add('time-send');
    const spanTime = document.createElement('span');
    spanTime.innerText = f_time;
    time_send.appendChild(spanTime);
    ///

    message_content.appendChild(content);
    message_content.appendChild(time_send);
    /////////////

    box.appendChild(message_user);
    box.appendChild(message_content);

    div.appendChild(box);

    document.querySelector('.box-message').appendChild(div);

    form_message.scrollTop = form_message.scrollHeight;
});

/*//////////////////////////////////////////////////////////////////// */
// create room

const form_redirect = document.forms['form-redirect'];

$('#new-stranger-room').click(() => {
    socket.emit('new-stranger-room', '<%- user._id %>');
    alert('Đang tìm đối tượng thích hợp cho bạn vui lòng đợi trong giây lát');

    // listen event successfull pairing
    socket.on('successfull-pairing', (room_id) => {
        form_redirect.action = '/c/' + room_id;
        form_redirect.submit();
    });
});

$('#new-group').click(() => {
    socket.emit('new-group-chat', '<%- user._id %>');
    alert(`Tạo phòng trò chuyện thành công bấm 'ok' để chuyển hướng`);

    socket.on('redirect-group-chat', (room_id) => {
        form_redirect.action = '/c/' + room_id;
        form_redirect.submit();
    });
});
