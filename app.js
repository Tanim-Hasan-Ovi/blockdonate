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

// Create upload folder if not exists
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage }).fields([
  { name: 'image', maxCount: 1 },
  { name: 'documents', maxCount: 10 } // Allow up to 10 document files
]);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve uploads folder as static content
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Setup session management
app.use(session({
  secret: 'your_secret_key', // Secret key for session
  resave: false,
  saveUninitialized: true
}));

// Route to render the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));  // Serve login.html file
});

// Route to handle login POST request
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check admin table first
  db.query('SELECT * FROM admins WHERE email = ? AND password = ?', [email, password], (err, result) => {
    if (err) {
      console.error('Error checking admin:', err);
      return res.status(500).send('Internal server error');
    }

      if (result.length > 0) {
      req.session.user_type = 'admin';
      req.session.email = email;
      return res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));  // Serve dashboard.html to the admin
    }

    // Then check users table
    db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, result) => {
      if (err) {
        console.error('Error checking user:', err);
        return res.status(500).send('Internal server error');
      }

     if (result.length > 0) {
        req.session.user_type = 'user';
        req.session.email = email;
        return res.sendFile(path.join(__dirname, 'public', 'profile.html'));  // Serve profile.html to the user
      }

      // If no user or admin found
      req.session.login_error = 'Invalid email or password';
      return res.redirect('/login');  // Redirect back to login with error message
    });
  });
});

// Route to render the dashboard (admin)
app.get('/dashboard', (req, res) => {
  if (req.session.user_type === 'admin') {
    res.send('Welcome to Admin Dashboard');
  } else {
    res.redirect('/login');
  }
});

// Route to render the user profile
app.get('/profile', (req, res) => {
  if (req.session.user_type === 'user') {
    res.send('Welcome to your Profile');
  } else {
    res.redirect('/login');
  }
});

// Route to create a campaign
app.post('/create-campaign', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).send('Error uploading files');
    }

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
              path.join('uploads', file.filename),
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
});

// Route to get all campaigns
app.get('/campaigns', (req, res) => {
  db.query('SELECT * FROM campaigns', (err, campaigns) => {
    if (err) return res.status(500).send('Error fetching campaigns');

    campaigns.forEach((campaign, index) => {
      db.query('SELECT * FROM campaign_files WHERE campaign_id = ?', [campaign.id], (err, files) => {
        if (err) {
          console.error('Error fetching campaign files:', err);
        } else {
          campaigns[index].documents = files.map(file => ({
            fileName: file.file_name,
            filePath: `/uploads/${file.file_name}`,
          }));
        }

        if (index === campaigns.length - 1) {
          res.json(campaigns);
        }
      });
    });
  });
});

// Route to get a specific campaign by ID
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
