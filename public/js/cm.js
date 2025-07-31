// Get modal elements
const profileModal = document.getElementById("profileModal");
const campaignModal = document.getElementById("campaignModal");
const myProfileLink = document.getElementById("myProfileLink");
const startCampaignLink = document.getElementById("startCampaignLink");

// Check if user is logged in
function isLoggedIn() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return !!token;
}

// Hide all modals if already logged in
if (isLoggedIn()) {
    if (profileModal) profileModal.style.display = "none";
    if (campaignModal) campaignModal.style.display = "none";
}

// My Profile link logic
if (myProfileLink) {
    myProfileLink.addEventListener("click", function(event) {
        if (!isLoggedIn()) {
            event.preventDefault();
            if (profileModal) profileModal.style.display = "block";
        }
    });
}

// Start Campaign link logic
if (startCampaignLink) {
    startCampaignLink.addEventListener("click", function(event) {
        if (!isLoggedIn()) {
            event.preventDefault();
            if (campaignModal) campaignModal.style.display = "block";
        }
    });
}

// Close modal handlers (using data-modal attribute)
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener("click", function() {
        const modalId = this.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = "none";
    });
});

// Close when clicking outside modal
window.addEventListener("click", function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
});

// Login form handler
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Simulate successful login
        localStorage.setItem('authToken', 'example-token-123');

        // Close all modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = "none";
        });

        // Redirect to previous page or profile
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'profile.html';
        window.location.href = redirectUrl;
    });
}

// Logout handler
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        window.location.href = 'index.html';
    });
}