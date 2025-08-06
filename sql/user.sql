CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `wallet_address` varchar(42) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `wallet_address` (`wallet_address`)
);

ALTER TABLE users
ADD COLUMN phone VARCHAR(20) DEFAULT 'Phone number',
ADD COLUMN address VARCHAR(255) DEFAULT 'Address',
ADD COLUMN profile_image VARCHAR(255) DEFAULT 'images/default-profile.jpg';
