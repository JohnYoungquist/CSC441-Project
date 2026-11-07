CREATE TABLE IF NOT EXISTS sites (
  id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS equipment (
  id VARCHAR(30) PRIMARY KEY,
  site_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  FOREIGN KEY (site_id) REFERENCES sites(id)
);
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  password_hash VARCHAR(160) NOT NULL
);
CREATE TABLE IF NOT EXISTS user_sites (
  user_id INT NOT NULL,
  site_id INT NOT NULL,
  PRIMARY KEY (user_id, site_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (site_id) REFERENCES sites(id)
);
CREATE TABLE IF NOT EXISTS service_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id VARCHAR(30) NOT NULL,
  user_id INT NOT NULL,
  priority ENUM('Low','Normal','High') NOT NULL,
  status ENUM('Open','In Progress','Closed') NOT NULL DEFAULT 'Open',
  issue VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
