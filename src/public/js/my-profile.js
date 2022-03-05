const btnUpdate = document.getElementById('btn-update-profile');
const btnChange = document.getElementById('btn-change-profile');
const btnClose = document.getElementById('btn-close');
const selectImage = document.getElementById('select-image');
const inputImage = document.getElementById('image');

const formChangeProfile = document.getElementById('form-change-profile');
const profileData = document.getElementById('profile-data');

function setStatus(status) {
    if (status === 'false') {
        btnUpdate.classList.add('block-button');
        btnClose.classList.add('block-button');
        btnChange.classList.remove('block-button');

        profileData.classList.remove('block');
        formChangeProfile.classList.add('block');

        selectImage.style.display = 'none';
    } else {
        btnChange.classList.add('block-button');
        btnUpdate.classList.remove('block-button');
        btnClose.classList.remove('block-button');

        profileData.classList.add('block');
        formChangeProfile.classList.remove('block');

        selectImage.style.display = 'block';
    }
}

setStatus(status);

btnChange.addEventListener('click', () => {
    setStatus('true');
});

btnUpdate.addEventListener('click', () => {
    formChangeProfile.submit();
});

btnClose.addEventListener('click', () => {
    setStatus('false');
});

selectImage.addEventListener('click', () => {
    inputImage.click();
});

inputImage.addEventListener('change', () => {
    const typeFile = inputImage.files[0].type;

    if (typeFile === 'image/jpeg' || typeFile === 'image/png') {
        var sizeFile = inputImage.files[0].size / 1024 / 1024;

        if (sizeFile <= 1.5) {
            document.querySelector('#avatar').src = URL.createObjectURL(
                inputImage.files[0]
            );
        } else {
            showToast({
                type: 'error',
                title: 'Error',
                icon: 'far fa-times-circle',
                message: 'Vui lòng chọn ảnh có size nhỏ hơn 1.5 MB',
            });
        }
    } else {
        showToast({
            type: 'error',
            title: 'Error',
            icon: 'far fa-times-circle',
            message: 'Vui lòng chọn ảnh có đuôi là png hoặc jpg !!',
        });
    }
});
