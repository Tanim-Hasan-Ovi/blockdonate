document.addEventListener('DOMContentLoaded', function() {
    // Get elements
    const toggle = document.getElementById('mobileMenuToggle');
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('menuIcon');
    
    // Debugging check
    if (!toggle || !menu || !icon) {
        console.error("Couldn't find menu elements!");
        return;
    }
    
    // Click event for toggle
    toggle.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        
        // Toggle menu visibility
        menu.classList.toggle('active');
        
        // Change icon
        if (menu.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('active');
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });
});