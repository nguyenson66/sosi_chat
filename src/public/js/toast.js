function showToast({ type, title, icon, message }) {
    const notification = document.getElementById('notification');

    const div = document.createElement('div');
    div.classList.add(`notification-${type}`);
    div.innerHTML = `
                    <div class="notification-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="notification-body">
                        <div class="notification-title">
                            <h6>${title}</h6>
                        </div>
                        <div class="notification-message">
                            <span>${message}</span>
                        </div>
                    </div>
                `;

    notification.appendChild(div);

    setTimeout(() => {
        notification.removeChild(div);
    }, 3300);
}

function setDataToast(typeToast) {
    if (typeToast == 'success') {
        showToast({
            type: typeToast,
            title: 'Ghép đôi thành công !!!',
            icon: 'far fa-check-circle',
            message: 'Sẽ chuyển hướng sang cuộc trò chuyện mới trong 3 giây.',
        });
    } else if (typeToast == 'info') {
        showToast({
            type: typeToast,
            title: 'Ghép đôi',
            icon: 'fas fa-info-circle',
            message: 'Đang tiến hành ghép đôi với người lạ đợi xíu nha.',
        });
    } else if (typeToast == 'warning') {
        showToast({
            type: typeToast,
            title: 'Nguy hiểm',
            icon: 'fas fa-exclamation-triangle',
            message: 'Cẩn thận.',
        });
    } else {
        showToast({
            type: typeToast,
            title: 'Ghép đôi thất bại !!!',
            icon: 'far fa-times-circle',
            message: 'Không có đối tượng ghép đôi phù hợp với bạn.',
        });
    }
}
