document.addEventListener("DOMContentLoaded", function() {
    const editBtn = document.getElementById('edit-profile-btn');
    const modal = document.getElementById('edit-profile-modal');
    const closeBtn = document.querySelector('.close-btn');

    // Open modal & prefill form + hide profile info
    editBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.querySelector('.profile-info').style.display = 'none';

        // Name
        document.getElementById('edit-name').value = document.getElementById('profile-name').innerText;

        // Phone
        const phoneText = document.getElementById('profile-phone').innerText.trim();
        document.getElementById('edit-phone').value = (phoneText === 'Enter your phone number' || phoneText === '') ? '' : phoneText;

        // Address
        const addressText = document.getElementById('profile-address').innerText.trim();
        document.getElementById('edit-address').value = (addressText === 'Enter your address' || addressText === '') ? '' : addressText;
    });

    // Close modal & show profile info
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.querySelector('.profile-info').style.display = 'block';
    });

    // Close modal if clicking outside modal content
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
            document.querySelector('.profile-info').style.display = 'block';
        }
    });

    // Update profile on form submit
    document.getElementById('edit-profile-form').addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('edit-name').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();
        const address = document.getElementById('edit-address').value.trim();

        // Update the visible profile info with placeholders if empty
        document.getElementById('profile-name').innerText = name ? name : 'Your Name';
        document.getElementById('profile-phone').innerText = phone ? phone : 'Enter your phone number';
        document.getElementById('profile-address').innerText = address ? address : 'Enter your address';

        // Update profile image preview if a new image is selected
        const fileInput = document.getElementById('profile-image-input');
        if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('profile-image').src = event.target.result;
            }
            reader.readAsDataURL(fileInput.files[0]);
        }

        // Close modal and show profile info
        modal.style.display = 'none';
        document.querySelector('.profile-info').style.display = 'block';

        // TODO: এখানে তোমার API কল করে ব্যাকএন্ডে ডাটা পাঠাতে পারো (যদি থাকে)
    });

    // Cancel button hides modal and shows profile info
    document.getElementById('cancel-profile-btn').addEventListener('click', function() {
        modal.style.display = 'none';
        document.querySelector('.profile-info').style.display = 'block';
    });

    // Optional: make phone and address text clickable to open modal
    document.getElementById('profile-phone').addEventListener('click', () => {
        editBtn.click();
    });

    document.getElementById('profile-address').addEventListener('click', () => {
        editBtn.click();
    });
});
