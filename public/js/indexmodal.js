document.addEventListener("DOMContentLoaded", function () {
    // Get modals and buttons
    const profileModal = document.getElementById("profileModal");
    const campaignModal = document.getElementById("campaignModal");
    const myProfileLink = document.getElementById("myProfileLink");
    const startCampaignLink = document.getElementById("startCampaignLink");

    // Function to check if the user is logged in
    function isLoggedIn() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        return !!token; // If token exists, user is logged in
    }

    // My Profile link logic
    if (myProfileLink) {
        myProfileLink.addEventListener("click", function (event) {
            if (!isLoggedIn()) {
                // If not logged in, prevent the default link behavior and show the profile modal
                event.preventDefault();
                if (profileModal) profileModal.style.display = "block";
            } else {
                // If logged in, navigate to the profile page
                window.location.href = myProfileLink.getAttribute("data-authed-href");
            }
        });
    }

    // Start Campaign link logic
    if (startCampaignLink) {
        startCampaignLink.addEventListener("click", function (event) {
            if (!isLoggedIn()) {
                // If not logged in, prevent the default link behavior and show the campaign modal
                event.preventDefault();
                if (campaignModal) campaignModal.style.display = "block";
            } else {
                // If logged in, navigate to the campaign creation page
                window.location.href = startCampaignLink.getAttribute("data-authed-href");
            }
        });
    }

    // Close modal handlers (using the data-modal attribute)
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener("click", function () {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = "none";  // Close the modal
        });
    });

    // Close when clicking outside modal
    window.addEventListener("click", function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none"; // Close modal if clicked outside
        }
    });

    // Login form handler (if in modal)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            // Simulate login (store token)
            localStorage.setItem('authToken', 'example-token-123'); 
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = "none";  // Close all modals after login
            });
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'profile.html';
            window.location.href = redirectUrl;  // Redirect to profile page or default
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            window.location.href = 'index.html';  // Redirect to homepage after logout
        });
    }

    // Check authentication state on page load
    checkAuthState();
});

// Function to check the authentication state
function checkAuthState() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    // Hide all modals if logged in
    if (token) {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';  // Hide modals if logged in
        });
    }
}
