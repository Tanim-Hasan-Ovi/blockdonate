const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');  // For managing sessions
const app = express();

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'block__donate'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Ensure upload directories exist
const profileImageDir = path.join(__dirname, "uploads", "profile-images");
if (!fs.existsSync(profileImageDir)) {
  fs.mkdirSync(profileImageDir, { recursive: true });
}
const documentDir = path.join(__dirname, "uploads", "documents");
if (!fs.existsSync(documentDir)) {
  fs.mkdirSync(documentDir, { recursive: true });
}

// Multer storage configuration for documents
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/documents/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: documentStorage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]);

// Session middleware (Make sure it's before any route handlers)
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  console.log("Checking authentication...");
  console.log("Session Data: ", req.session);  // Debugging line to check session content
  if (req.session && req.session.user_type === 'user') {
    return next();  // Proceed if the user is authenticated
  }
  res.redirect('/login');  // Redirect to login page if not authenticated
}

// Middleware to parse JSON and urlencoded bodies
app.use(express.static('public'));  // Serve static files
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies
app.use(express.json());  // Parse JSON bodies

// Serve uploads folder as static content
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes

// Profile page - show user data
app.get("/profile", isAuthenticated, (req, res) => {
  const email = req.session.email;  // Get email from session

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).send("Internal server error");
    }

    if (result.length > 0) {
      // Fetch user's campaigns
      db.query("SELECT * FROM campaigns WHERE user_email = ?", [email], (err2, campaigns) => {
        if (err2) {
          console.error("Error fetching campaigns:", err2);
          return res.status(500).send("Internal server error");
        }
        res.render("profile", { user: result[0], campaigns: campaigns });  // Render profile.ejs with user data and campaigns
      });
    } else {
      res.redirect("/login"); // If no user found, redirect to login
    }
  });
});

// Create Campaign Route (Authenticated)
app.post('/create-campaign', isAuthenticated, upload, (req, res) => {
  const { title, description, goal, duration } = req.body;
  const userEmail = req.session.email;  // Get the logged-in user's email
  const imageFile = req.files.image ? req.files.image[0] : null;

  if (!imageFile) {
    return res.status(400).send('Cover image is required');
  }

  // Check if a campaign with this title already exists for the user
  const checkQuery = 'SELECT * FROM campaigns WHERE title = ? AND user_email = ?';
  db.query(checkQuery, [title, userEmail], (err, results) => {
    if (err) {
      console.error('Error checking for duplicates:', err);
      return res.status(500).send('Error checking for duplicates');
    }

    if (results.length > 0) {
      return res.status(400).send('A campaign with this title already exists');
    }

    // Insert new campaign
    const query = 'INSERT INTO campaigns (title, description, goal, duration, cover_image, user_email) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [title, description, goal, duration, imageFile.filename, userEmail], (err, result) => {
      if (err) {
        console.error('DB Insert Error:', err);
        return res.status(500).send('Error saving campaign');
      }

      // Redirect to profile page after creating the campaign
      res.redirect('/profile');
    });
  });
});

// Setup session management
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Middleware
app.use(express.static('public'));  // Serve static files
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies
app.use(express.json());  // Parse JSON bodies

// Serve uploads folder as static content
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Profile page - show user data
app.get("/profile", isAuthenticated, (req, res) => {
  const email = req.session.email;  // Get email from session

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).send("Internal server error");
    }

    if (result.length > 0) {
      res.render("profile", { user: result[0] });  // Render profile.ejs with user data
    } else {
      res.redirect("/login"); // If no user found, redirect to login
    }
  });
});

// Signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// Signup POST handler
app.post('/signup', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailQuery, [email], (err, result) => {
    if (err) {
      console.error('Error checking email:', err);
      return res.status(500).send('Internal server error');
    }

    if (result.length > 0) {
      return res.status(400).send('Email already exists');
    }

    const insertQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(insertQuery, [username, email, password], (err, result) => {
      if (err) {
        console.error('Error inserting user:', err);
        return res.status(500).send('Error saving user');
      }

      res.send('<script>alert("Account created successfully! Redirecting to login..."); window.location.href = "/login";</script>');
    });
  });
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login POST handler
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM admins WHERE email = ? AND password = ?', [email, password], (err, result) => {
    if (err) {
      console.error('Error checking admin:', err);
      return res.status(500).send('Internal server error');
    }

    if (result.length > 0) {
      req.session.user_type = 'admin';
      req.session.email = email;
      req.session.username = result[0].username; // Ensure username is also saved in session
      return res.redirect('/dashboard');
    }

    // Check user next
    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, result) => {
      if (err) {
        console.error('Error checking user:', err);
        return res.status(500).send('Internal server error');
      }

      if (result.length > 0) {
        req.session.user_type = 'user';  // Set user_type to 'user' after successful login
        req.session.email = email;
        req.session.username = result[0].username;  // Use 'name' field for username
        console.log("Session initialized for user:", req.session); // Debugging line
        return res.redirect('/profile'); // Redirect to user profile page
      }

      req.session.login_error = 'Invalid email or password';
      return res.redirect('/login');
    });
  });
});


// /check-session route
app.get('/check-session', (req, res) => {
  if (req.session.user_type) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

// /logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
});

// Admin dashboard
app.get('/dashboard', (req, res) => {
  if (req.session.user_type === 'admin') {
    res.send('Welcome to Admin Dashboard');
  } else {
    res.redirect('/login');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
