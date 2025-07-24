// Open Modal
const editBtn = document.getElementById('edit-profile-btn');
const modal = document.getElementById('edit-profile-modal');
const closeBtn = document.querySelector('.close-btn');

editBtn.addEventListener('click', () => {
    modal.style.display = 'block';

    // Pre-fill form with current data
    document.getElementById('edit-name').value = document.getElementById('profile-name').innerText;
    document.getElementById('edit-phone').value = document.getElementById('profile-phone').innerText;
    document.getElementById('edit-address').value = document.getElementById('profile-address').innerText;
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});

// Update Profile on Submit
document.getElementById('edit-profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('profile-name').innerText = document.getElementById('edit-name').value;
    document.getElementById('profile-phone').innerText = document.getElementById('edit-phone').value;
    document.getElementById('profile-address').innerText = document.getElementById('edit-address').value;

    // Handle Image Change
    const fileInput = document.getElementById('profile-image-input');
    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('profile-image').src = event.target.result;
        }
        reader.readAsDataURL(fileInput.files[0]);
    }

    modal.style.display = 'none';
});
