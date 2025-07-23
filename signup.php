<?php
// Database configuration
$servername = "localhost"; // Change this to your server address
$username = "root"; // Change this to your MySQL username
$password = ""; // Change this to your MySQL password
$dbname = "block__donate";

// Create a connection to MySQL
$conn = new mysqli($servername, $username, $password, $dbname);

// Check the connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $conn->real_escape_string($_POST['username']);
    $email = $conn->real_escape_string($_POST['email']);
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirmPassword'];
    
    // Validate passwords
    if ($password !== $confirmPassword) {
        echo "<script>alert('Passwords do not match!');</script>";
        exit;
    }

    // Check if the email already exists
    $checkEmailQuery = "SELECT * FROM users WHERE email = '$email'";
    $result = $conn->query($checkEmailQuery);

    if ($result->num_rows > 0) {
        echo "<script>alert('Email already exists.');</script>";
        exit;
    }

    // Insert the user data into the database without hashing the password
    $insertQuery = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$password')";

    if ($conn->query($insertQuery) === TRUE) {
        echo "<script>alert('Account created successfully! Redirecting to login...'); window.location.href = 'login.html';</script>";
    } else {
        echo "Error: " . $insertQuery . "<br>" . $conn->error;
    }
    
    // Close connection
    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BlockDonate - Create Account</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/signup.css">
</head>
<body>
    <div class="login-container">
        <a href="login.html" class="back-button">
            <i class="fas fa-arrow-left"></i> Back
        </a>

        <div class="logo">
            <i class="fas fa-donate"></i>
            <h1>Create Account</h1>
            <p>Join our decentralized donation community</p>
        </div>
        
        <form class="login-form" id="registrationForm" method="POST" action="signup.php">
            <div class="input-group">
                <label for="username">Name</label>
                <input type="text" id="username" name="username" placeholder="Enter your name" required>
            </div>
            
            <div class="input-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" placeholder="Enter your email" required>
            </div>
            
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Create a password" required>
                <i class="fas fa-eye password-toggle" id="togglePassword"></i>
            </div>
            
            <div class="input-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required>
                <i class="fas fa-eye password-toggle" id="toggleConfirmPassword"></i>
            </div>
            
            <div class="input-group">
                <label>
                    <input type="checkbox" id="terms" required>
                    I agree to the <a href="#" style="color: var(--secondary);">Terms of Service</a> and <a href="#" style="color: var(--secondary);">Privacy Policy</a>
                </label>
            </div>
            
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-user-plus"></i> Create Account
            </button>
        </form>
        
        <div class="divider">OR</div>
        
        <div class="wallet-connect">
            <p>Register with your blockchain wallet</p>
            <button type="button" class="btn btn-wallet" id="metamask-register">
                <i class="fab fa-ethereum"></i> Sign Up with MetaMask
            </button>
        </div>
        
        <div class="footer-links">
            <a href="login.php"><i class="fas fa-sign-in-alt"></i> Already have an account? Login</a>
        </div>
    </div>

    <script>
        // Password toggle functionality
        const togglePassword = document.querySelector('#togglePassword');
        const password = document.querySelector('#password');
        const toggleConfirmPassword = document.querySelector('#toggleConfirmPassword');
        const confirmPassword = document.querySelector('#confirmPassword');
        
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
        
        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPassword.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    </script>
</body>
</html>
