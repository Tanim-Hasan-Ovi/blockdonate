document.addEventListener("DOMContentLoaded", function () {
    const editBtn = document.getElementById("edit-profile-btn");
    const modal = document.getElementById("edit-profile-modal");
    const closeBtn = document.querySelector(".close-btn");
    const form = document.getElementById("edit-profile-form");

    editBtn.addEventListener("click", () => {
        modal.style.display = "block";
    });

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target == modal) {
            modal.style.display = "none";
        }
    });

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await fetch("/user/update-profile", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                location.reload(); // Reload the page to reflect updated info
            } else {
                alert("Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile.");
        }
    });
});

document.getElementById('edit-profile-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  fetch('/user/update-profile', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      const user = data.user;

      // Update DOM elements with new user data
      document.getElementById('profile-name').innerText = user.username;
      document.getElementById('profile-phone').innerText = user.phone;
      document.getElementById('profile-address').innerText = user.address;

      if (user.profile_image) {
        document.getElementById('profile-image').src = user.profile_image;
      }

      // Close modal
      document.getElementById('edit-profile-modal').style.display = 'none';
    } else {
      alert('Failed to update profile.');
    }
  })
  .catch(err => {
    console.error('Error:', err);
    alert('An error occurred while updating profile.');
  });
});
