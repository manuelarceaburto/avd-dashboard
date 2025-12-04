-- Create database
CREATE DATABASE IF NOT EXISTS avd_dashboard;
USE avd_dashboard;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  last_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Host pools table
CREATE TABLE IF NOT EXISTS host_pools (
  host_pool_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL,
  status ENUM('online', 'offline', 'maintenance') DEFAULT 'online',
  total_capacity INT NOT NULL,
  current_load INT DEFAULT 0,
  cpu_usage DECIMAL(5,2) DEFAULT 0,
  memory_usage DECIMAL(5,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  session_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  host_pool VARCHAR(100) NOT NULL,
  status ENUM('active', 'disconnected', 'idle') DEFAULT 'active',
  cpu_usage DECIMAL(5,2) DEFAULT 0,
  memory_usage DECIMAL(5,2) DEFAULT 0,
  duration INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  metric_id INT PRIMARY KEY AUTO_INCREMENT,
  session_id INT,
  cpu_usage DECIMAL(5,2) NOT NULL,
  memory_usage DECIMAL(5,2) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  alert_id INT PRIMARY KEY AUTO_INCREMENT,
  severity ENUM('critical', 'warning', 'info') NOT NULL,
  message TEXT NOT NULL,
  source VARCHAR(100),
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data

-- Sample users
INSERT INTO users (username, email, status, last_login) VALUES
('john.doe', 'john.doe@company.com', 'active', NOW() - INTERVAL 5 MINUTE),
('jane.smith', 'jane.smith@company.com', 'active', NOW() - INTERVAL 15 MINUTE),
('bob.wilson', 'bob.wilson@company.com', 'active', NOW() - INTERVAL 1 HOUR),
('alice.brown', 'alice.brown@company.com', 'active', NOW() - INTERVAL 2 HOUR),
('charlie.davis', 'charlie.davis@company.com', 'inactive', NOW() - INTERVAL 1 DAY);

-- Sample host pools
INSERT INTO host_pools (name, region, status, total_capacity, current_load, cpu_usage, memory_usage) VALUES
('Pool-EastUS-01', 'East US', 'online', 100, 45, 35.5, 62.3),
('Pool-WestUS-01', 'West US', 'online', 80, 32, 28.7, 51.2),
('Pool-CentralUS-01', 'Central US', 'online', 120, 78, 65.8, 71.5),
('Pool-NorthEU-01', 'North Europe', 'online', 60, 15, 12.4, 25.8),
('Pool-WestEU-01', 'West Europe', 'maintenance', 100, 0, 0, 0);

-- Sample sessions
INSERT INTO sessions (user_id, host_pool, status, cpu_usage, memory_usage, duration) VALUES
(1, 'Pool-EastUS-01', 'active', 45.2, 68.5, 180),
(2, 'Pool-WestUS-01', 'active', 32.1, 55.3, 135),
(3, 'Pool-EastUS-01', 'idle', 15.5, 42.1, 270),
(4, 'Pool-CentralUS-01', 'active', 78.9, 82.4, 90),
(1, 'Pool-NorthEU-01', 'active', 52.3, 71.2, 200),
(2, 'Pool-CentralUS-01', 'disconnected', 8.1, 25.3, 45);

-- Sample performance metrics (last 24 hours)
INSERT INTO performance_metrics (session_id, cpu_usage, memory_usage, timestamp)
SELECT 
  1,
  20 + (RAND() * 60),
  30 + (RAND() * 50),
  NOW() - INTERVAL n HOUR
FROM (
  SELECT 0 n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
  UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
  UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
  UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20
  UNION SELECT 21 UNION SELECT 22 UNION SELECT 23
) hours;

-- Sample alerts
INSERT INTO alerts (severity, message, source, resolved) VALUES
('critical', 'High CPU usage detected on Pool-CentralUS-01', 'Pool-CentralUS-01', FALSE),
('warning', 'Memory usage above 80% on session 4', 'Session Monitor', FALSE),
('info', 'Scheduled maintenance for Pool-WestEU-01 starting soon', 'System', FALSE),
('warning', 'Unusual login pattern detected for user bob.wilson', 'Security', FALSE);

-- Create indexes for performance
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);
