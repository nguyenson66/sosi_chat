var chat_form = document.getElementById('chat-form');
var form_message = document.querySelector('.box-message');
form_message.scrollTop = form_message.scrollHeight;

var socket = io();
var url = window.location.pathname.split('/');
var room_id = url[url.length - 1];
// console.log(room_id);

/////////////////////
var btnSticker = document.getElementById('btn-sticker');
var btnImage = document.getElementById('btn-image');
var showListSticker = document.getElementById('showListSticker');

/////////////////////////////////// SOCKET  /////////////////////////////////////////////////////
function eventTyping() {
    let msg = document.getElementById('msg').value;
    msg = msg.trim();
    if (msg != '') {
        // console.log(msg);
    }
}

// When the user clicks anywhere outside of the showListSticker, close it
window.onclick = (e) => {
    if (e.target == btnSticker || e.target == showListSticker) {
        showListSticker.style.display = 'block';
    } else {
        showListSticker.style.display = 'none';
    }
};

// hover event sticker
function overSticker(x) {
    const srcLink = x.src;

    x.src = srcLink;
}

// set event click sticker , send sticker to room
function sendGif(id) {
    socket.emit('messageChatRoom', {
        room_id,
        user_id,
        user_name,
        type: 'sticker',
        msg: id,
    });
}

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
        type: 'text',
        msg,
    });

    e.target.elements.msg.value = '';
});

// listen and push message into box message
socket.on(
    'message',
    ({ user_id_s, user_name_s, msg_s, type, time, avatar }) => {
        let userName = user_name_s;
        let messageServer = `<span>${msg_s}<span>`;

        //format time just get hh:mm
        let f_time = time.split(' ');
        f_time = f_time[1];

        // check type message and change value innerHTML
        if (type === 'sticker') {
            messageServer = `<img src="/gif/${msg_s}.gif" alt="${type}" draggable="false" onmouseover="overSticker(this)" >`;
        }

        const div = document.createElement('div');
        div.classList.add('message');
        if (user_id == user_id_s) {
            div.classList.add('my-message');
            userName = 'You';
        }

        const box = document.createElement('div');

        box.innerHTML = `
            <div>
                <div class="message-user">
                    <img
                        src="${avatar}"
                        alt="avatar"
                    />
                    <p>${userName}</p>
                </div>

                <div class="message-content">
                    <div class="content ${type}-message">
                        ${messageServer}
                    </div>
                    <div class="time-send">
                        <span>${f_time}</span>
                    </div>
                </div>
            </div>
        `;

        div.appendChild(box);

        document.querySelector('.box-message').appendChild(div);

        form_message.scrollTop = form_message.scrollHeight;
    }
);

//event add member to the room as email
function addMembers() {
    let emailMember = document.getElementById('add-members').value;
    emailMember = emailMember.trim();

    if (emailMember === '') {
        return;
    } else {
        document.getElementById('add-members').value = '';
        socket.emit('addMembersToRoom', { user_name, emailMember, room_id });
    }
}

//listen status add member event
socket.on('statusAddMembers', ({ statusAddMember, msg }) => {
    if (statusAddMember === 200) {
        showToast({
            type: 'success',
            title: 'Thành công',
            icon: 'far fa-check-circle',
            message: msg,
        });
    } else if (statusAddMember === 300) {
        showToast({
            type: 'info',
            title: 'Thất bại',
            icon: 'fas fa-info-circle',
            message: msg,
        });
    } else {
        showToast({
            type: 'error',
            title: 'Thất bại',
            icon: 'far fa-times-circle',
            message: msg,
        });
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////

const joinRoom = document.getElementById('linkJoinRoom');
const linkJoinRoom = document.domain + '/j/' + room_id;

joinRoom.innerText = linkJoinRoom;

function copyTextToClipboard() {
    navigator.clipboard.writeText(linkJoinRoom);
    showToast({
        type: 'success',
        title: 'Thành công',
        icon: 'far fa-check-circle',
        message: 'Đã copy liên kết tham gia nhóm chat !!!',
    });
}
