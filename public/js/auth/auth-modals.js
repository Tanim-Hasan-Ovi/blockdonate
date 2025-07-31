import { isLoggedIn } from './auth-core.js';

// Global modal handler
function handleProtectedClick(event) {
    if (!isLoggedIn()) {
        event.preventDefault();
        const modalType = this.getAttribute('data-modal-type');
        const modal = document.getElementById(modalType + 'Modal');
        if (modal) modal.style.display = 'block';
    }
}

// Initialize protected links
function initProtectedLinks() {
    document.querySelectorAll('[data-protected]').forEach(link => {
        link.addEventListener('click', handleProtectedClick);
        
        if (isLoggedIn()) {
            const authedHref = link.getAttribute('data-authed-href');
            if (authedHref) link.href = authedHref;
        }
    });
}

export { initProtectedLinks, handleProtectedClick };