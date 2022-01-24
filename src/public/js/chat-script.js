var chat_form = document.getElementById('chat-form');
var form_message = document.querySelector('.box-message');
form_message.scrollTop = form_message.scrollHeight;

var socket = io();
var url = window.location.pathname.split('/');
var room_id = url[url.length - 1];
// console.log(room_id);

socket.emit('joinRoom', room_id);

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
socket.on('message', ({ user_id_s, user_name_s, msg_s }) => {
    // console.log(user_name_s);

    const div = document.createElement('div');
    div.classList.add('message');
    if (user_id == user_id_s)
        div.classList.add('my-message');

    const box = document.createElement('div')

    const message_user = document.createElement('div')
    message_user.classList.add('message-user')
    const img = document.createElement('img')
    img.src = 'https://res.cloudinary.com/soicondibui/image/upload/v1642665781/sosichat/icon/question_2_p4nifa.png'
    img.alt = "avatar"
    const p_username = document.createElement('p')
    p_username.innerText = user_name_s
    message_user.appendChild(img)
    message_user.appendChild(p_username)

    const message_content = document.createElement('div')
    message_content.classList.add('message-content')
    const p_content = document.createElement('p')
    p_content.innerText = msg_s
    message_content.appendChild(p_content)

    box.appendChild(message_user)
    box.appendChild(message_content)

    div.appendChild(box)

    document.querySelector('.box-message').appendChild(div)


    form_message.scrollTop = form_message.scrollHeight;
});


/*//////////////////////////////////////////////////////////////////// */
// create room 

const form_redirect = document.forms['form-redirect'];

$('#new-stranger-room').click(() => {
    socket.emit('new-stranger-room', '<%- user._id %>');
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