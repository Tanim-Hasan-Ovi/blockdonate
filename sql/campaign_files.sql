CREATE TABLE IF NOT EXISTS campaign_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id INT,
  file_name VARCHAR(255),
  file_path VARCHAR(255),
  file_size INT,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);
