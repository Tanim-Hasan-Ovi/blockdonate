import { checkAuthAndHideModals, isLoggedIn } from './auth-core.js';
import { initProtectedLinks } from './auth-modals.js';

// Session management
function setupSessionListeners() {
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            checkAuthAndHideModals();
            initProtectedLinks();
        }
    });

    window.addEventListener('hashchange', function() {
        checkAuthAndHideModals();
        initProtectedLinks();
    });
}

export { setupSessionListeners };