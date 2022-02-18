const nav = document.querySelector('.nav');

window.addEventListener('scroll', fixNav);

function fixNav() {
    if (window.scrollY > nav.offsetHeight + 170) {
        nav.classList.add('active');
    } else {
        nav.classList.remove('active');
    }
}

function joinNow() {
    window.location.href = '/login';
}
