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

// Multer storage configuration for profile images
const profileImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile-images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const profileImageUpload = multer({ storage: profileImageStorage });

// Multer storage configuration for documents (used in campaign creation)
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

// Routes

// Profile page - show user data
app.get("/profile", (req, res) => {
  if (req.session.user_type === "user") {
    const email = req.session.email;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).send("Internal server error");
      }

      if (result.length > 0) {
        res.render("profile", { user: result[0] });
      } else {
        res.redirect("/login");
      }
    });
  } else {
    res.redirect("/login");
  }
});



// POST /user/update-profile (with multer upload)
app.post('/user/update-profile', profileImageUpload.single('profileImage'), (req, res) => {
  const email = req.session.email;
  if (!email) {
    return res.status(401).send('Unauthorized: No session found');
  }

  const { username, phone, address } = req.body;
  let profileImagePath = null;

  if (req.file) {
    profileImagePath = req.file.path.replace(/\\/g, '/');
  }

  let sql = "UPDATE users SET username = ?, phone = ?, address = ?";
  const params = [username, phone, address];

  if (profileImagePath) {
    sql += ", profile_image = ?";
    params.push(profileImagePath);
  }

  sql += " WHERE email = ?";
  params.push(email);

  db.query(sql, params, (err) => {
    if (err) {
      console.error('Profile update error:', err);
      return res.status(500).json({ success: false });
    }

    // Update successful, fetch latest user info
    const fetchUserSql = "SELECT id, username, phone, address, email, profile_image FROM users WHERE email = ?";
    db.query(fetchUserSql, [email], (err2, results) => {
      if (err2 || results.length === 0) {
        return res.status(500).json({ success: false });
      }

      const updatedUser = results[0];
      if (updatedUser.profile_image) {
        updatedUser.profile_image = '/' + updatedUser.profile_image.replace(/\\/g, '/');
      }

      return res.json({ success: true, user: updatedUser });
    });
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

  // Check admin first
  db.query('SELECT * FROM admins WHERE email = ? AND password = ?', [email, password], (err, result) => {
    if (err) {
      console.error('Error checking admin:', err);
      return res.status(500).send('Internal server error');
    }

    if (result.length > 0) {
      req.session.user_type = 'admin';
      req.session.email = email;
      return res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    }

    // Check user next
    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, result) => {
      if (err) {
        console.error('Error checking user:', err);
        return res.status(500).send('Internal server error');
      }

      if (result.length > 0) {
        req.session.user_type = 'user';
        req.session.email = email;
        req.session.username = result[0].username; // fix to use 'name' field
        return res.redirect('/profile');
      }

      req.session.login_error = 'Invalid email or password';
      return res.redirect('/login');
    });
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

// Create campaign route with file uploads
app.post('/create-campaign', upload, (req, res) => {
  const { title, description, category, goal, duration } = req.body;
  const imageFile = req.files.image ? req.files.image[0] : null;

  if (!imageFile) {
    return res.status(400).send('Cover image is required');
  }

  const checkQuery = 'SELECT * FROM campaigns WHERE title = ?';
  db.query(checkQuery, [title], (err, results) => {
    if (err) {
      console.error('Error checking for duplicates:', err);
      return res.status(500).send('Error checking for duplicates');
    }

    if (results.length > 0) {
      return res.status(400).send('A campaign with this title already exists');
    }

    const query = `INSERT INTO campaigns (title, description, category, goal, duration, cover_image) VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(query, [title, description, category, goal, duration, imageFile.filename], (err, result) => {
      if (err) {
        console.error('DB Insert Error:', err);
        return res.status(500).send('Error saving campaign');
      }

      const campaignId = result.insertId;

      if (req.files.documents && req.files.documents.length > 0) {
        req.files.documents.forEach((file) => {
          const fileQuery = `INSERT INTO campaign_files (campaign_id, file_name, file_path, file_size) VALUES (?, ?, ?, ?)`;
          db.query(fileQuery, [
            campaignId,
            file.filename,
            path.join('uploads', 'documents', file.filename),
            file.size
          ], (err) => {
            if (err) console.error('Error saving document:', err);
          });
        });
      }

      res.send('Campaign created successfully');
    });
  });
});

// Get all campaigns
app.get('/campaigns', (req, res) => {
  db.query('SELECT * FROM campaigns', (err, campaigns) => {
    if (err) return res.status(500).send('Error fetching campaigns');

    let completed = 0;

    campaigns.forEach((campaign, index) => {
      db.query('SELECT * FROM campaign_files WHERE campaign_id = ?', [campaign.id], (err, files) => {
        if (!err) {
          campaigns[index].documents = files.map(file => ({
            fileName: file.file_name,
            filePath: `/uploads/documents/${file.file_name}`,
          }));
        }
        completed++;
        if (completed === campaigns.length) {
          res.json(campaigns);
        }
      });
    });
  });
});

// Get campaign by id
app.get('/campaign/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM campaigns WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).send('Error fetching campaign');
    if (result.length === 0) return res.status(404).send('Not found');
    res.json(result[0]);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
