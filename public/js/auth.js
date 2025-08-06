document.addEventListener("DOMContentLoaded", function () {
    // Get modal elements
    const profileModal = document.getElementById("profileModal");
    const campaignModal = document.getElementById("campaignModal");
    const myProfileLink = document.getElementById("myProfileLink");
    const startCampaignLink = document.getElementById("startCampaignLink");

    // Function to check if user is logged in
    function isLoggedIn() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        return !!token; // If token exists, user is logged in
    }

    // Check session status by querying the backend
    fetch('/check-session')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn || isLoggedIn()) {
                // If logged in, set href and allow access to profile page
                if (myProfileLink) {
                    myProfileLink.href = myProfileLink.getAttribute("data-authed-href");
                    myProfileLink.classList.remove("disabled");
                }

                if (startCampaignLink) {
                    startCampaignLink.href = startCampaignLink.getAttribute("data-authed-href");
                    startCampaignLink.classList.remove("disabled");
                }
                // Hide modals if logged in
                if (profileModal) profileModal.style.display = "none";
                if (campaignModal) campaignModal.style.display = "none";
            } else {
                // If not logged in, show the modals
                if (myProfileLink) {
                    myProfileLink.classList.add("disabled");
                    myProfileLink.addEventListener("click", function (event) {
                        event.preventDefault();
                        if (profileModal) profileModal.style.display = "block";  // Show profile modal
                    });
                }

                if (startCampaignLink) {
                    startCampaignLink.addEventListener("click", function (event) {
                        event.preventDefault();
                        if (campaignModal) campaignModal.style.display = "block";  // Show campaign modal
                    });
                }
            }
        })
        .catch(err => {
            console.error("Error checking session:", err);
        });

    // Close modal handlers (using the data-modal attribute)
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener("click", function () {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = "none"; // Close the modal
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
            // Simulate login
            localStorage.setItem('authToken', 'example-token-123');
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = "none"; // Close all modals after login
            });
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'profile.html';
            window.location.href = redirectUrl; // Redirect to profile page or default
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            window.location.href = 'index.html'; // Redirect to homepage after logout
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
            modal.style.display = 'none'; // Hide modals if logged in
        });
    }
}
