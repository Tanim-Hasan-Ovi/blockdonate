<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$database = "block__donate";

$conn = new mysqli($servername, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $pass = $_POST['password'];

    // Check admin table first
    $stmt = $conn->prepare("SELECT * FROM admins WHERE email = ? AND password = ?");
    if (!$stmt) {
        die("Admin statement failed: " . $conn->error);
    }
    $stmt->bind_param("ss", $email, $pass);
    $stmt->execute();
    $adminResult = $stmt->get_result();

    if ($adminResult->num_rows > 0) {
        $_SESSION['user_type'] = 'admin';
        $_SESSION['email'] = $email;
        header("Location: dashboard.html");
        exit();
    }

    // Check users table
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
    if (!$stmt) {
        die("User statement failed: " . $conn->error);
    }
    $stmt->bind_param("ss", $email, $pass);
    $stmt->execute();
    $userResult = $stmt->get_result();

    if ($userResult->num_rows > 0) {
        $_SESSION['user_type'] = 'user';
        $_SESSION['email'] = $email;
        header("Location: profile.html");
        exit();
    }

    $_SESSION['login_error'] = "Invalid email or password";
    header("Location: login.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blockchain Donation Portal | Login</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/login.css">
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <i class="fas fa-donate"></i>
            <h1>BlockDonate</h1>
            <p>Transparent giving powered by blockchain</p>
        </div>
        
        <a href="index.html" class="back-button">
            <i class="fas fa-arrow-left"></i> Back
        </a>

        <?php if (isset($_SESSION['login_error'])): ?>
            <div class="error-message">
                <?php echo htmlspecialchars($_SESSION['login_error']); ?>
                <?php unset($_SESSION['login_error']); ?>  <!-- Clear the error after showing -->
            </div>
        <?php endif; ?>

        <form class="login-form" method="POST" action="login.php">
            <!-- Your email and password fields here -->
            <div class="input-group">
                <label for="email">Email Address</label>
                <input type="email" class="form-control" id="email" name="email" placeholder="Enter your email"  required>
            </div>
            <div class="input-group">
                <label for="password">Password</label>
                <input type="password" class="form-control" id="password" name="password" placeholder="Enter your password" required>
                <i class="fas fa-eye password-toggle" id="togglePassword"></i>
            </div>
            
            <!-- Login button -->
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-sign-in-alt"></i> Login
            </button>
        </form>

        <div class="divider">OR</div>

        <div class="wallet-connect">
            <p>Connect with your blockchain wallet</p>
            <button type="button" class="btn btn-wallet" id="metamask-connect">
                <i class="fab fa-ethereum"></i> Connect MetaMask
            </button>
        </div>
        
        <div class="footer-links">
            <a href="#"><i class="fas fa-key"></i> Forgot Password?</a>
            <a href="signup.php"><i class="fas fa-user-plus"></i> Create Account</a>
            <a href="#"><i class="fas fa-info-circle"></i> About</a>
        </div>
    </div>

    <script>
        // Password toggle functionality
        const togglePassword = document.querySelector('#togglePassword');
        const password = document.querySelector('#password');
        
        togglePassword.addEventListener('click', function() {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            password.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
        
        // Wallet connection functionality
        document.getElementById('metamask-connect').addEventListener('click', async () => {
            try {
                if (window.ethereum) {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    console.log('Connected account:', accounts[0]);
                    // Here you would typically authenticate the user with your backend
                } else {
                    alert('Please install MetaMask to use this feature!');
                }
            } catch (error) {
                console.error('Error connecting to MetaMask:', error);
            }
        });
    </script>
</body>
</html>
