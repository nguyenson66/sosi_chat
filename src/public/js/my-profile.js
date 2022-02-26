const btnUpdate = document.getElementById('btn-update-profile');
const btnChange = document.getElementById('btn-change-profile');
const btnClose = document.getElementById('btn-close');

const formChangeProfile = document.getElementById('form-change-profile');
const profileData = document.getElementById('profile-data');

function setStatus(status) {
    if (status === 'false') {
        btnUpdate.classList.add('block-button');
        btnClose.classList.add('block-button');
        btnChange.classList.remove('block-button');

        profileData.classList.remove('block');
        formChangeProfile.classList.add('block');
    } else {
        btnChange.classList.add('block-button');
        btnUpdate.classList.remove('block-button');
        btnClose.classList.remove('block-button');

        profileData.classList.add('block');
        formChangeProfile.classList.remove('block');
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
