// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet');
const adminLink = document.getElementById('admin-link');

// Check if user is admin (this would be replaced with actual admin check)
function isAdmin() {
    // In a real app, this would check the connected wallet against admin addresses
    return false;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Hide admin link if user is not admin
    if (!isAdmin()) {
        adminLink.style.display = 'none';
    }
    
    // Connect wallet button functionality
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', async function() {
            try {
                // This would connect to MetaMask or other wallet
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                connectWalletBtn.textContent = `${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`;
                console.log('Connected:', accounts[0]);
            } catch (error) {
                console.error('Error connecting wallet:', error);
            }
        });
    }
});

// Campaign form submission
const campaignForm = document.getElementById('campaign-form');
if (campaignForm) {
    campaignForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const title = document.getElementById('campaign-title').value;
        const description = document.getElementById('campaign-description').value;
        const category = document.getElementById('campaign-category').value;
        const goal = document.getElementById('campaign-goal').value;
        const duration = document.getElementById('campaign-duration').value;
        const documentFile = document.getElementById('campaign-document').files[0];
        
        // Validate form
        if (!title || !description || !category || !goal || !duration || !documentFile) {
            alert('Please fill in all fields');
            return;
        }
        
        // In a real app, this would upload to IPFS and create a smart contract
        console.log('Creating campaign:', {
            title,
            description,
            category,
            goal,
            duration,
            document: documentFile.name
        });
        
        alert('Campaign submitted for admin approval!');
        campaignForm.reset();
    });
}

import { checkAuthAndHideModals } from './auth/auth-core.js';
import { initProtectedLinks } from './auth/auth-modals.js';
import { setupSessionListeners } from './auth/auth-session.js';

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndHideModals();
    initProtectedLinks();
    setupSessionListeners();
});

// Login handler
function handleLogin() {
    localStorage.setItem('authToken', 'your-auth-token');
    checkAuthAndHideModals();
    initProtectedLinks();
    // Redirect logic...
}

// Logout handler
function handleLogout() {
    localStorage.removeItem('authToken');
    initProtectedLinks();
    window.location.href = 'index.html';
}

// Auth Check Helper Function
function checkAuthAndHideModals() {
    if (isLoggedIn()) {
        // Hide all modals site-wide
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Remove any click handlers that show modals
        const protectedLinks = document.querySelectorAll('[data-protected]');
        protectedLinks.forEach(link => {
            link.removeEventListener('click', handleProtectedClick);
            link.href = link.getAttribute('data-authed-href') || link.href;
        });
    }
}

// Run on every page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthAndHideModals();
});