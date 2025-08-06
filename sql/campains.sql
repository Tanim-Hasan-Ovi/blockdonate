CREATE TABLE IF NOT EXISTS campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  goal DECIMAL(10,2),
  duration INT,
  cover_image VARCHAR(255),
  user_email VARCHAR(255), 
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);
