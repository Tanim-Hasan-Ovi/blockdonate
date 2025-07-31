// Authentication core functions
function isLoggedIn() {
    return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
}

function checkAuthAndHideModals() {
    if (isLoggedIn()) {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

export { isLoggedIn, checkAuthAndHideModals };