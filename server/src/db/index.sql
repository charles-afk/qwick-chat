CREATE TABLE IF NOT EXISTS users(
	id INT PRIMARY KEY AUTO_INCREMENT,
	full_name VARCHAR(50) NOT NULL,
	email VARCHAR(100) NOT NULL,
	password VARCHAR(255) NOT NULL,
	provider VARCHAR(100) NOT NULL,
	profile_pic VARCHAR(255),
  user_type INT(6),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATE,
	deleted_at DATE
);
CREATE TABLE IF NOT EXISTS messages(
  id INT PRIMARY KEY AUTO_INCREMENT,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  text TEXT,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at DATE,
	deleted_at DATE,
  CONSTRAINT fk_sender
    FOREIGN KEY (sender_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_receiver
    FOREIGN KEY (receiver_id) REFERENCES users(id)
    ON DELETE CASCADE
);