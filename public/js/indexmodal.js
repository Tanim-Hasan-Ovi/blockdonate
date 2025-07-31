document.addEventListener("DOMContentLoaded", function () {
    // Get modals and buttons
    const profileModal = document.getElementById("profileModal");
    const campaignModal = document.getElementById("campaignModal");
    const myProfileLink = document.getElementById("myProfileLink");
    const startCampaignLink = document.getElementById("startCampaignLink");

    // Check if user is logged in
    function isLoggedIn() {
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        return !!token;
    }

    // Hide modals if already logged in
    if (isLoggedIn()) {
        if (profileModal) profileModal.style.display = "none";
        if (campaignModal) campaignModal.style.display = "none";
    }

    // My Profile link logic
    if (myProfileLink) {
        myProfileLink.addEventListener("click", function (event) {
            if (!isLoggedIn()) {
                event.preventDefault();
                if (profileModal) profileModal.style.display = "block";
            }
        });
    }

    // Start Campaign link logic
    if (startCampaignLink) {
        startCampaignLink.addEventListener("click", function (event) {
            if (!isLoggedIn()) {
                event.preventDefault();
                if (campaignModal) campaignModal.style.display = "block";
            }
        });
    }

    // Close modal handlers (using the data-modal attribute)
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener("click", function () {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = "none";
        });
    });

    // Close when clicking outside modal
    window.addEventListener("click", function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
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
                modal.style.display = "none";
            });
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'profile.html';
            window.location.href = redirectUrl;
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            window.location.href = 'index.html';
        });
    }
});
// Check authentication state on page load
document.addEventListener('DOMContentLoaded', function() {
  checkAuthState();
});

function checkAuthState() {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
  // Hide all modals if logged in
  if (token) {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });
  }
}

// Login form handler
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (email && password) {
      // Store token
      localStorage.setItem('authToken', 'example-token');
      
      // Hide all modals
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
      
      // Redirect
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'profile.html';
      window.location.href = redirectUrl;
    } else {
      alert('Please enter both email and password');
    }
  });
}

// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize modals
  initModals();
  checkAuthState();
});

function initModals() {
  // Profile link
  document.getElementById('myProfileLink')?.addEventListener('click', function(e) {
    if (!isLoggedIn()) {
      e.preventDefault();
      document.getElementById('profileModal').style.display = 'block';
    }
  });

  // Campaign link
  document.getElementById('startCampaignLink')?.addEventListener('click', function(e) {
    if (!isLoggedIn()) {
      e.preventDefault();
      document.getElementById('campaignModal').style.display = 'block';
    }
  });

  // Close buttons
  document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', function() {
      const modalId = this.getAttribute('data-modal');
      document.getElementById(modalId).style.display = 'none';
    });
  });

  // Close when clicking outside
  window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });
}

function isLoggedIn() {
  return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
}

function checkAuthState() {
  if (isLoggedIn()) {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });
  }
}