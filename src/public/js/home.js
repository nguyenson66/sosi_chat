const form_r = document.getElementById('form-register')
const form_login = document.getElementById('form-login')

const username_r = document.getElementById('username_r')
const email_r = document.getElementById('email_r')
const password_r = document.getElementById('password_r')
const password2_r = document.getElementById('password2_r')

const email = document.getElementById('email')
const password = document.getElementById('password')

// Show input error message
function showError(input, message) {
	const formControl = input.parentElement
	formControl.className = 'form-control error'
	const small = formControl.querySelector('small')
	small.innerText = message
}

// Show success outline
function showSuccess(input) {
	const formControl = input.parentElement
	formControl.className = 'form-control success'
    const small = formControl.querySelector('small')
	small.innerText = ''
}

// Check email is valid
function checkEmail(input) {
	const re =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

	if (re.test(input.value.trim())) {
		showSuccess(input)
	} else {
		showError(input, 'Email is not valid')
	}
}

// Check required fields
function checkRequired(inputArr) {
	let isRequired = false
	inputArr.forEach(function (input) {
		if (input.value.trim() === '') {
			showError(input, `${getFieldName(input)} is required`)
			isRequired = true
		} else {
			showSuccess(input)
		}
	})

	return isRequired
}

// Check input length
function checkLength(input, min, max) {
	if (input.value.length < min) {
		showError(
			input,
			`${getFieldName(input)} must be at least ${min} characters`
		)
	} else if (input.value.length > max) {
		showError(
			input,
			`${getFieldName(input)} must be less than ${max} characters`
		)
	} else {
		showSuccess(input)
	}
}

// Check passwords match
function checkPasswordsMatch(input1, input2) {
	if (input1.value !== input2.value) {
		showError(input2, 'Passwords do not match')
	}
}

// Get fieldname
function getFieldName(input) {
	return input.id.charAt(0).toUpperCase() + input.id.slice(1)
}

// Event listeners
form_r.addEventListener('submit', function (e) {
	e.preventDefault()

	if (!checkRequired([username_r, email_r, password_r, password2_r])) {
		checkLength(username_r, 3, 15)
		checkLength(password_r, 6, 25)
		checkEmail(email_r)
		checkPasswordsMatch(password_r, password2_r)

		form_r.submit()
	}
})

form_login.addEventListener('submit', function (e) {
	e.preventDefault()

	if (!checkRequired([email, password])) {
		checkLength(password, 5, 25)
		checkEmail(email)

		form_login.submit()
	}
})