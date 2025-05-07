<?php
$servername = "localhost";
$username = "ovi";
$password = "a123456";
$database = "block_donate";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>