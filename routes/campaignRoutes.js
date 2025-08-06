const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

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
// All campaigns with attached documents
router.get('/campaigns', async (req, res) => {
  try {
    const [campaigns] = await db.promise().query('SELECT * FROM campaigns');
    const [documents] = await db.promise().query('SELECT * FROM campaign_files');

    const campaignsWithDocs = campaigns.map(campaign => {
      const docs = documents.filter(doc => doc.campaign_id === campaign.id);
      return {
        ...campaign,
        documents: docs.map(doc => ({
          fileName: doc.file_name,
          filePath: doc.file_path
        }))
      };
    });

    res.json(campaignsWithDocs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
