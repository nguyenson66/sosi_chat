const form_register = document.getElementById('form-register');

const email = document.getElementById('email');
const password = document.getElementById('password');

const error = document.getElementById('error');

function success() {
    form_register.submit();
}

function showError(input, valueError) {
    arr = [email, password];

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
