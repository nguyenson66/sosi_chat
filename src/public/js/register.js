const form_register = document.getElementById('form-register');

const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

const error = document.getElementById('error');

function success() {
    form_register.submit();
}

function showError(input, valueError) {
    arr = [username, email, password, password2];

    for (let i = 0; i < arr.length; i++) {
        arr[i].classList.remove('error-outline');
    }

    input.classList.add('error-outline');
    error.innerText = valueError;
}

// Check email is valid
function checkEmail(email) {
    const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (re.test(email.value.trim())) {
        return true;
    } else {
        showError(email, 'Email không hợp lệ');
        return false;
    }
}

function checkPassword(pass1, pass2) {
    const val1 = pass1.value;
    const val2 = pass2.value;

    if (val1.length < 8) {
        showError(pass1, 'Mật khẩu của bạn quá yếu ít hơn 8 kí tự');
        return false;
    } else if (val1 != val2) {
        showError(pass2, 'Mật khẩu 2 không khớp');
        return false;
    } else {
        return true;
    }
}

function checkUsername(username) {
    const val = username.value;

    var specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|<>\/?]/gi;

    if (val.length == 0) {
        showError(username, 'Không thể để trống tên của bạn');
        return false;
    }
    if (val.match(specialChars) == null) {
        return true;
    } else {
        showError(username, 'Tên của bạn không được chứa kí tự đặc biệt');
        return false;
    }
}

function checkValidRegister() {
    if (
        checkUsername(username) &&
        checkEmail(email) &&
        checkPassword(password, password2)
    ) {
        success();
    }
}

function checkValidLogin() {
    if (checkEmail(email)) {
        success();
    }
}
