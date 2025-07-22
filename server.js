const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// ✅ Create uploads folder if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// ✅ MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'block__donate'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// ✅ Route to handle form
app.post('/create-campaign', upload.array('documents', 5), (req, res) => {
  const { title, description, category, goal, duration, termsAgree } = req.body;

  const fileNames = req.files.map(file => file.filename).join(',');

  const sql = `INSERT INTO campaigns (title, description, category, goal, duration, documents) 
               VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [title, description, category, goal, duration, fileNames], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).send('Error saving data');
    }
    res.send('<h2>Campaign Created Successfully!</h2><a href="/">Back to Home</a>');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


