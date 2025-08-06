const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');  // For managing sessions
const app = express();
const campaignRoutes = require('./routes/campaignRoutes'); // রুট ঠিকভাবে
app.use('/api', campaignRoutes); // /api/campaigns হিসেবে route হবে


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
//
// JSON API for campaigns (frontend fetch purpose)
app.get('/api/campaigns', async (req, res) => {
    try {
        const campaigns = await new Promise((resolve, reject) => {
            const sql = `
                SELECT campaigns.*, users.name AS creator_name
                FROM campaigns
                JOIN users ON campaigns.user_email = users.email
            `;
            db.query(sql, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });

        // Attach documents
        for (let i = 0; i < campaigns.length; i++) {
            const files = await new Promise((resolve) => {
                db.query('SELECT * FROM campaign_files WHERE campaign_id = ?', [campaigns[i].id], (err, files) => {
                    if (err || !files) resolve([]);
                    else resolve(files);
                });
            });

            campaigns[i].documents = files.map(f => ({
                fileName: f.file_name,
                filePath: `/uploads/documents/${f.file_name}`
            }));
        }

        res.json(campaigns);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//

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

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      if (file.fieldname === 'image') {
        cb(null, 'uploads/cover-images/');
      } else if (file.fieldname === 'documents') {
        cb(null, 'uploads/documents/');
      }
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  })
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'documents', maxCount: 10 }
]);
const coverImageDir = path.join(__dirname, "uploads", "cover-images");
if (!fs.existsSync(coverImageDir)) {
  fs.mkdirSync(coverImageDir, { recursive: true });
}


// Session middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

// Middleware
app.use(express.static('public'));  // Serve static files
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies
app.use(express.json());  // Parse JSON bodies
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  console.log("Checking authentication...");
  console.log("Session Data: ", req.session);  // Debugging line to check session content
  if (req.session && req.session.user_type === 'user') {
    return next();  // Proceed if the user is authenticated
  }
  res.redirect('/login');  // Redirect to login page if not authenticated
}

// ------------------- Routes ------------------- //

// Profile page
app.get("/profile", isAuthenticated, (req, res) => {
  const email = req.session.email;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).send("Internal server error");

    if (result.length > 0) {
      db.query("SELECT * FROM campaigns WHERE user_email = ?", [email], (err2, campaigns) => {
        if (err2) return res.status(500).send("Internal server error");
        res.render("profile", { user: result[0], campaigns: campaigns });
      });
    } else {
      res.redirect("/login");
    }
  });
});
//
// Serve cover images
app.use('/uploads/cover-images', express.static(path.join(__dirname, 'uploads/cover-images')));

// Serve documents
app.use('/uploads/documents', express.static(path.join(__dirname, 'uploads/documents')));

//

//
// ✅ Create campaign route (Authenticated, using async/await)
app.post('/create-campaign', isAuthenticated, upload, async (req, res) => {
  try {
    const { title, description, category, goal, duration } = req.body;
    const userEmail = req.session.email;
    const imageFile = req.files.image ? req.files.image[0] : null;

    if (!imageFile) {
      return res.status(400).send('Cover image is required');
    }

    // ✅ Check for duplicate title for the same user
    const existing = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM campaigns WHERE title = ? AND user_email = ?', [title, userEmail], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (existing.length > 0) {
      return res.status(400).send('Campaign title already exists');
    }

    // ✅ Insert new campaign
    const result = await new Promise((resolve, reject) => {
      const insertQuery = `
        INSERT INTO campaigns (title, description, category, goal, duration, cover_image, user_email)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(insertQuery, [title, description, category, goal, duration, imageFile.filename, userEmail], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    const campaignId = result.insertId;

    // ✅ Insert uploaded documents (if any)
    if (req.files.documents && req.files.documents.length > 0) {
      for (let file of req.files.documents) {
        await new Promise((resolve, reject) => {
          const fileInsertQuery = `
            INSERT INTO campaign_files (campaign_id, file_name, file_path, file_size)
            VALUES (?, ?, ?, ?)
          `;
          db.query(fileInsertQuery, [
            campaignId,
            file.filename,
            path.join('uploads', 'documents', file.filename),
            file.size
          ], (err) => {
            if (err) {
              console.error('Error saving document:', err);
              reject(err);
            } else resolve();
          });
        });
      }
    }

    // ✅ Success: redirect to profile
    res.redirect('/profile');

  } catch (err) {
    console.error('Error creating campaign:', err);
    res.status(500).send('Internal server error');
  }
});

//


// Signup routes
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'views', 'signup.html')));
app.post('/signup', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) return res.status(400).send('Passwords do not match');

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).send('Internal server error');
    if (result.length > 0) return res.status(400).send('Email already exists');

    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [username, email, password], (err, result) => {
      if (err) return res.status(500).send('Error saving user');
      res.send('<script>alert("Account created successfully! Redirecting to login..."); window.location.href = "/login";</script>');
    });
  });
});

// Login routes
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Admin check
  db.query('SELECT * FROM admins WHERE email = ? AND password = ?', [email, password], (err, result) => {
    if (err) return res.status(500).send('Internal server error');
    if (result.length > 0) {
      req.session.user_type = 'admin';
      req.session.email = email;
      req.session.username = result[0].username;
      return res.redirect('/dashboard');
    }

    // User check
    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, result) => {
      if (err) return res.status(500).send('Internal server error');
      if (result.length > 0) {
        req.session.user_type = 'user';
        req.session.email = email;
        req.session.username = result[0].username;
        return res.redirect('/profile');
      }

      req.session.login_error = 'Invalid email or password';
      return res.redirect('/login');
    });
  });
});

// Check session
app.get('/check-session', (req, res) => {
  res.json({ loggedIn: !!req.session.user_type });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Error destroying session:', err);
    res.redirect('/login');
  });
});

// Admin dashboard
app.get('/dashboard', (req, res) => {
  if (req.session.user_type === 'admin') res.send('Welcome to Admin Dashboard');
  else res.redirect('/login');
});

// Get all campaigns with documents
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await new Promise((resolve, reject) => {
      const sql = `
        SELECT campaigns.*, users.name AS creator_name
        FROM campaigns
        JOIN users ON campaigns.user_email = users.email
      `;
      db.query(sql, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    for (let i = 0; i < campaigns.length; i++) {
      const files = await new Promise((resolve) => {
        db.query('SELECT * FROM campaign_files WHERE campaign_id = ?', [campaigns[i].id], (err, files) => {
          if (err || !files) resolve([]);
          else resolve(files);
        });
      });

      campaigns[i].documents = files.map(f => ({
        fileName: f.file_name,
        filePath: `/uploads/documents/${f.file_name}`
      }));
    }

    res.json(campaigns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
