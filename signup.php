<?php
session_start();
require_once 'db_connect.php'; // Database connection file

$error = '';
$success = '';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);

    // Validate inputs
    if (empty($name) || empty($email) || empty($password)) {
        $error = "All fields are required!";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Invalid email format!";
    } elseif ($password !== $confirm_password) {
        $error = "Passwords don't match!";
    } elseif (strlen($password) < 8) {
        $error = "Password must be at least 8 characters!";
    } else {
        // Check if email already exists
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $stmt->store_result();
        
        if ($stmt->num_rows > 0) {
            $error = "Email already exists!";
        } else {
            // Hash password
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert new user
            $insert = $conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
            $insert->bind_param("sss", $name, $email, $hashed_password);
            
            if ($insert->execute()) {
                $success = "Registration successful! You can now login.";
                // Clear form
                $name = $email = '';
            } else {
                $error = "Registration failed. Please try again.";
            }
        }
    }
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
    <a href="login.php" class="back-button">
        <i class="fas fa-arrow-left"></i> Back
    </a>

    <div class="logo">
        <i class="fas fa-donate"></i>
        <h1>Create Account</h1>
        <p>Join our decentralized donation community</p>
    </div>
    
    <?php if (!empty($error)): ?>
        <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>
    
    <?php if (!empty($success)): ?>
        <div class="alert alert-success"><?php echo htmlspecialchars($success); ?></div>
    <?php endif; ?>
    
    <form class="login-form" method="POST" action="">
        <div class="input-group">
            <label for="username">Name</label>
            <input type="text" id="username" name="username" placeholder="Enter your name" 
                   value="<?php echo isset($_POST['username']) ? htmlspecialchars($_POST['username']) : ''; ?>" required>
        </div>
        
        <div class="input-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" placeholder="Enter your email"
                   value="<?php echo isset($_POST['email']) ? htmlspecialchars($_POST['email']) : ''; ?>" required>
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
                <input type="checkbox" id="terms" name="terms" required>
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
        <a href="login.html"><i class="fas fa-sign-in-alt"></i> Already have an account? Login</a>
    </div>
</div>

<script>
// Password toggle functionality
document.getElementById('togglePassword').addEventListener('click', function() {
    const password = document.getElementById('password');
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});

document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    const confirmPassword = document.getElementById('confirmPassword');
    const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPassword.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});
</script>

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
        
        // Form validation
        document.getElementById('registrationForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            if (password.value !== confirmPassword.value) {
                alert('Passwords do not match!');
                return;
            }
            
            if (!document.getElementById('terms').checked) {
                alert('You must agree to the terms and conditions');
                return;
            }
            
            // Here you would typically send the data to your backend
            console.log('Registration data:', {
                username: document.getElementById('username').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            });
            
            alert('Account created successfully! Redirecting to login...');
            window.location.href = 'login.html';
        });
        
        // Wallet registration
        document.getElementById('metamask-register').addEventListener('click', async () => {
            try {
                if (window.ethereum) {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    console.log('Connected account:', accounts[0]);
                    
                    // Here you would typically register the wallet address with your backend
                    alert(`Wallet registered: ${accounts[0]}\nYou can now login with your wallet`);
                    window.location.href = 'login.html';
                } else {
                    alert('Please install MetaMask to use this feature!');
                }
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
                alert('Error connecting wallet: ' + error.message);
            }
        });
    </script>
</body>
</html>