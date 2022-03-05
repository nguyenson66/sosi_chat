var chat_form = document.getElementById('chat-form');
var form_message = document.querySelector('.box-message');
const typingAnimation = document.getElementById('typing-animation');
form_message.scrollTop = form_message.scrollHeight;

/////////////////////
var btnSticker = document.getElementById('btn-sticker');
var btnImage = document.getElementById('btn-image');
var showListSticker = document.getElementById('showListSticker');

/////////////////////////////////// SOCKET  /////////////////////////////////////////////////////
////// socket ///////

var typing = false;
var timeout = undefined;

//listen typing message event
function eventTyping() {
    let msg = document.getElementById('msg').value;
    msg = msg.trim();
    if (msg != '' && typing == false) {
        typing = true;

        socket.emit('typingMessage', {
            room_id,
            typing: true,
        });

        timeout = setTimeout(() => {
            typing = false;
            socket.emit('typingMessage', {
                room_id,
                typing: false,
            });
        }, 5000);
    } else if (msg == '' && typing == true) {
        socket.emit('typingMessage', {
            room_id,
            typing: false,
        });

        typing = false;
        clearTimeout(timeout);
    }
}

socket.on('typingMessage', ({ currentRoomId, typingServer }) => {
    // check the current chat room
    if (currentRoomId == room_id) {
        if (typingServer == true) {
            typingAnimation.style.display = 'flex';
            typing = true;
        } else {
            typingAnimation.style.display = 'none';
            typing = false;
        }
    }
});

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
    ({ room_id, user_id_s, user_name_s, msg, type, time, avatar }) => {
        // check the current chat room
        if (url[url.length - 1] == room_id) {
            let userName = user_name_s;
            let messageServer = `<span>${msg}<span>`;

            //format time just get hh:mm
            let f_time = time.split(' ');
            f_time = f_time[1].substring(0, 5);

            // check type message and change value innerHTML
            if (type === 'sticker') {
                messageServer = `<img src="/gif/${msg}.gif" alt="${type}" draggable="false" onmouseover="overSticker(this)" >`;
            } else if (type === 'image') {
                messageServer = `<img src="${msg}" alt="${type}" onclick="pushUpImage('${msg}')">`;
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

////// change title room ///////
const newTitleRoom = document.getElementById('new-title-room');

function changeTitleRoom() {
    let title = newTitleRoom.value.trim();

    if (title != '') {
        socket.emit('changeTitleRoom', {
            user_name,
            title,
            room_id,
        });

        newTitleRoom.value = '';
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////

const joinRoom = document.getElementById('linkJoinRoom');
const linkJoinRoom = window.location.hostname + '/j/' + room_id;

joinRoom.innerText = linkJoinRoom;

//copy text to clipboard
async function copyTextToClipboard() {
    // try {
    //     await navigator.clipboard.writeText(linkJoinRoom);
    //     showToast({
    //         type: 'success',
    //         title: 'Thành công',
    //         icon: 'far fa-check-circle',
    //         message: 'Đã copy liên kết tham gia nhóm chat !!!',
    //     });
    // } catch (error) {
    //     console.error('Failed to copy : ', error);
    // }
    showToast({
        type: 'info',
        title: 'Bảo trì',
        icon: 'fas fa-info-circle',
        message: 'Chức năng này đang được bảo trì. Vui lòng thử lại sau',
    });
}

/// api get message //
const boxMessage = document.getElementById('box-message');
let checkScroll = true;
let skip = 20;

if (checkScroll) {
    let oldHeight = boxMessage.scrollHeight;

    function scrollY() {
        // if user scroll top of list message => get api message
        if (boxMessage.scrollTop === 0) {
            fetch(`/message?room_id=${room_id}&skip=${skip}`)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    if (data.status !== 200) {
                        return;
                    }

                    if (data.message.length === 0) {
                        checkScroll = false;
                        return;
                    }
                    // add skip 20
                    skip += 20;

                    const message = data.message;
                    let div = document.createElement('div');

                    for (let i = 0; i < message.length; i++) {
                        let msg = document.createElement('div');
                        msg.classList.add('message');

                        if (user_id === message[i].user_id)
                            msg.classList.add('my-message');

                        let content = '';

                        if (message[i].type === 'sticker') {
                            content = `
                                <img
                                    src="/gif/${message[i].content}.gif"
                                    alt="${message[i].type}"
                                    draggable="false"
                                    onmouseover="overSticker(this)"
                                />
                            `;
                        } else if (message[i].type === 'image') {
                            content = `
                                <img
                                    src="${message[i].content}"
                                    alt="${message[i].type}"
                                />
                            `;
                        } else {
                            content = `<span>${message[i].content}</span>`;
                        }

                        msg.innerHTML = `
                            <div>
                                <div class="message-user">
                                    <img
                                        src="${message[i].avatar}"
                                        alt="avatar"
                                    />
                                    <p>${message[i].username}</p>
                                </div>

                                <div class="message-content">
                                    <div
                                        class="content ${message[i].type}-message"
                                    >
                                        ${content}
                                    </div>
                                    <div class="time-send">
                                        <span>${message[i].time}</span>
                                    </div>
                                </div>
                            </div>
                        `;

                        // push message to div
                        div.appendChild(msg);
                    }

                    // push div to the top box message
                    boxMessage.innerHTML = div.innerHTML + boxMessage.innerHTML;

                    // set old position scroll
                    boxMessage.scrollTop = boxMessage.scrollHeight - oldHeight;
                    oldHeight = boxMessage.scrollHeight;
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }
}

/// choose and send image ///
const chooseImage = document.getElementById('image-message');

btnImage.addEventListener('click', () => {
    chooseImage.click();
});

// It will be triggered when a file will be selected
chooseImage.addEventListener('change', () => {
    const typeFile = chooseImage.files[0].type;
    var sizeFile = chooseImage.files[0].size / 1024 / 1024;

    if (sizeFile > 1.5) {
        showToast({
            type: 'error',
            title: 'Error',
            icon: 'far fa-times-circle',
            message: 'Vui lòng lựa chọn ảnh có kích thước nhỏ hơn 1.5 MB',
        });
        return;
    }

    if (typeFile === 'image/jpeg' || typeFile === 'image/png') {
        const formData = document.getElementById('form-image');

        var form = new FormData(formData);

        fetch('/upload-image', {
            // Your POST endpoint
            method: 'POST',
            body: form, // This is your file object
        })
            .then(
                (response) => response.json() // if the response is a JSON object
            )
            .then((data) => {
                //emit image message to server
                if (data.status === 200) {
                    socket.emit('messageChatRoom', {
                        room_id,
                        user_id,
                        user_name,
                        type: 'image',
                        msg: data.result.url,
                    });
                } else {
                    showToast({
                        type: 'error',
                        title: 'Error',
                        icon: 'far fa-times-circle',
                        message:
                            'Server đang quá tải vui lòng thử lại sau. Cảm ơn !',
                    });
                }
            })
            .catch((error) => {
                showToast({
                    type: 'error',
                    title: 'Error',
                    icon: 'far fa-times-circle',
                    message:
                        'Không thể upload ảnh vào lúc này vui lòng kiểm tra kết nối !',
                });
            });
    } else {
        showToast({
            type: 'error',
            title: 'Error',
            icon: 'far fa-times-circle',
            message: 'Vui lòng chọn ảnh có đuôi là png hoặc jpg !!',
        });
    }
});

//// push up image
const divPushUp = document.querySelector('#push-up-image');
const imagePushUp = document.querySelector('#image-push-up');
const closePushUp = document.querySelector('#close-push-up');

function pushUpImage(url) {
    divPushUp.style.display = 'flex';
    imagePushUp.src = url;
}

closePushUp.addEventListener('click', () => {
    divPushUp.style.display = 'none';
});
