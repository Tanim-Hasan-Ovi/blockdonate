// Authentication functions
async function checkAuth() {
  const response = await fetch('/api/check-auth');
  const data = await response.json();
  return data.authenticated;
}

// Modal control
function hideAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
}

// Initialize protected links
async function initProtectedLinks() {
  const isAuthenticated = await checkAuth();
  
  document.querySelectorAll('[data-protected]').forEach(link => {
    link.addEventListener('click', async function(e) {
      if (!(await checkAuth())) {
        e.preventDefault();
        const modalType = this.id.includes('Profile') ? 'profile' : 'campaign';
        document.getElementById(`${modalType}Modal`).style.display = 'block';
      }
    });
  });

  if (isAuthenticated) {
    hideAllModals();
  }
}

// Login handler
async function handleLogin(username, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (data.success) {
    hideAllModals();
    window.location.href = 'profile.html';
  }
  return data;
}

// Logout handler
async function handleLogout() {
  await fetch('/api/logout', { method: 'POST' });
  window.location.href = 'index.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  initProtectedLinks();
  
  // Close modal handlers
  document.querySelectorAll('.close, .modal').forEach(el => {
    el.addEventListener('click', function(e) {
      if (e.target === this || e.target.classList.contains('close')) {
        const modalId = e.target.closest('.modal').id || 
                       e.target.getAttribute('data-modal');
        document.getElementById(modalId).style.display = 'none';
      }
    });
  });
});