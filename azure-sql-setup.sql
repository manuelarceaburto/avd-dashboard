-- Azure SQL Server Setup Script for AVD Dashboard
-- Drop tables in correct order (foreign keys first)
IF OBJECT_ID('performance_metrics', 'U') IS NOT NULL DROP TABLE performance_metrics;
IF OBJECT_ID('sessions', 'U') IS NOT NULL DROP TABLE sessions;
IF OBJECT_ID('alerts', 'U') IS NOT NULL DROP TABLE alerts;
IF OBJECT_ID('host_pools', 'U') IS NOT NULL DROP TABLE host_pools;
IF OBJECT_ID('users', 'U') IS NOT NULL DROP TABLE users;
GO

-- Users table
CREATE TABLE users (
  user_id INT PRIMARY KEY IDENTITY(1,1),
  username NVARCHAR(100) NOT NULL UNIQUE,
  email NVARCHAR(255) NOT NULL,
  status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login DATETIME2,
  created_at DATETIME2 DEFAULT SYSDATETIME()
);
GO

-- Host pools table
CREATE TABLE host_pools (
  host_pool_id INT PRIMARY KEY IDENTITY(1,1),
  name NVARCHAR(100) NOT NULL,
  region NVARCHAR(50) NOT NULL,
  status NVARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
  total_capacity INT NOT NULL,
  current_load INT DEFAULT 0,
  cpu_usage DECIMAL(5,2) DEFAULT 0,
  memory_usage DECIMAL(5,2) DEFAULT 0,
  last_updated DATETIME2 DEFAULT SYSDATETIME(),
  created_at DATETIME2 DEFAULT SYSDATETIME()
);
GO

-- Sessions table
CREATE TABLE sessions (
  session_id INT PRIMARY KEY IDENTITY(1,1),
  user_id INT NOT NULL,
  host_pool NVARCHAR(100) NOT NULL,
  status NVARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'idle')),
  cpu_usage DECIMAL(5,2) DEFAULT 0,
  memory_usage DECIMAL(5,2) DEFAULT 0,
  duration INT DEFAULT 0,
  created_at DATETIME2 DEFAULT SYSDATETIME(),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
GO

-- Performance metrics table
CREATE TABLE performance_metrics (
  metric_id INT PRIMARY KEY IDENTITY(1,1),
  session_id INT,
  cpu_usage DECIMAL(5,2) NOT NULL,
  memory_usage DECIMAL(5,2) NOT NULL,
  timestamp DATETIME2 DEFAULT SYSDATETIME(),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);
GO

-- Alerts table
CREATE TABLE alerts (
  alert_id INT PRIMARY KEY IDENTITY(1,1),
  severity NVARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  message NVARCHAR(MAX) NOT NULL,
  source NVARCHAR(100),
  resolved BIT DEFAULT 0,
  created_at DATETIME2 DEFAULT SYSDATETIME()
);
GO

-- Insert sample users
INSERT INTO users (username, email, status, last_login) VALUES
('john.doe', 'john.doe@company.com', 'active', DATEADD(MINUTE, -5, SYSDATETIME())),
('jane.smith', 'jane.smith@company.com', 'active', DATEADD(MINUTE, -15, SYSDATETIME())),
('bob.wilson', 'bob.wilson@company.com', 'active', DATEADD(HOUR, -1, SYSDATETIME())),
('alice.brown', 'alice.brown@company.com', 'active', DATEADD(HOUR, -2, SYSDATETIME())),
('charlie.davis', 'charlie.davis@company.com', 'inactive', DATEADD(DAY, -1, SYSDATETIME())),
('mike.johnson', 'mike.johnson@company.com', 'active', DATEADD(MINUTE, -10, SYSDATETIME())),
('sarah.williams', 'sarah.williams@company.com', 'active', DATEADD(MINUTE, -25, SYSDATETIME())),
('david.lee', 'david.lee@company.com', 'active', DATEADD(MINUTE, -45, SYSDATETIME())),
('emily.chen', 'emily.chen@company.com', 'active', DATEADD(HOUR, -1, SYSDATETIME())),
('robert.taylor', 'robert.taylor@company.com', 'active', DATEADD(HOUR, -2, SYSDATETIME())),
('lisa.anderson', 'lisa.anderson@company.com', 'active', DATEADD(HOUR, -3, SYSDATETIME()));
GO

-- Insert host pools
INSERT INTO host_pools (name, region, status, total_capacity, current_load, cpu_usage, memory_usage) VALUES
('Pool-EastUS-01', 'East US', 'online', 100, 45, 35.5, 62.3),
('Pool-WestUS-01', 'West US', 'online', 80, 32, 28.7, 51.2),
('Pool-CentralUS-01', 'Central US', 'online', 120, 78, 65.8, 71.5),
('Pool-NorthEU-01', 'North Europe', 'online', 60, 15, 12.4, 25.8),
('Pool-WestEU-01', 'West Europe', 'maintenance', 100, 0, 0, 0),
('Pool-EastUS-02', 'East US', 'online', 150, 95, 62.3, 78.5),
('Pool-SouthCentral-01', 'South Central US', 'online', 90, 52, 45.8, 58.3),
('Pool-UKSouth-01', 'UK South', 'online', 70, 38, 38.2, 52.7),
('Pool-AsiaSoutheast-01', 'Southeast Asia', 'online', 80, 45, 51.4, 64.2),
('Pool-AustraliaEast-01', 'Australia East', 'online', 60, 22, 28.9, 35.1);
GO

-- Insert sessions
INSERT INTO sessions (user_id, host_pool, status, cpu_usage, memory_usage, duration) VALUES
(1, 'Pool-EastUS-01', 'active', 45.2, 68.5, 180),
(2, 'Pool-WestUS-01', 'active', 32.1, 55.3, 135),
(3, 'Pool-EastUS-01', 'idle', 15.5, 42.1, 270),
(4, 'Pool-CentralUS-01', 'active', 78.9, 82.4, 90),
(1, 'Pool-NorthEU-01', 'active', 52.3, 71.2, 200),
(2, 'Pool-CentralUS-01', 'disconnected', 8.1, 25.3, 45),
(6, 'Pool-EastUS-02', 'active', 58.3, 72.1, 145),
(7, 'Pool-SouthCentral-01', 'active', 42.7, 61.8, 220),
(8, 'Pool-UKSouth-01', 'active', 35.2, 48.3, 85),
(9, 'Pool-AsiaSoutheast-01', 'active', 68.9, 79.4, 165),
(10, 'Pool-AustraliaEast-01', 'idle', 12.3, 28.7, 95),
(11, 'Pool-EastUS-02', 'active', 71.2, 85.6, 310);
GO

-- Insert sample alerts
INSERT INTO alerts (severity, message, source, resolved) VALUES
('critical', 'High CPU usage detected on Pool-CentralUS-01', 'Pool-CentralUS-01', 0),
('warning', 'Memory usage above 80% on session 4', 'Session Monitor', 0),
('info', 'Scheduled maintenance for Pool-WestEU-01 starting soon', 'System', 0),
('warning', 'Unusual login pattern detected for user bob.wilson', 'Security', 0),
('warning', 'Network latency spike detected', 'Pool-AsiaSoutheast-01', 0),
('info', 'New user onboarded successfully', 'System', 0),
('critical', 'Disk space threshold exceeded', 'Pool-EastUS-02', 0),
('warning', 'Session timeout approaching for multiple users', 'Session Monitor', 0);
GO

-- Insert performance metrics for the last few hours
DECLARE @i INT = 0;
WHILE @i < 24
BEGIN
    INSERT INTO performance_metrics (session_id, cpu_usage, memory_usage, timestamp)
    VALUES 
        (1, 20 + (RAND() * 60), 30 + (RAND() * 50), DATEADD(HOUR, -@i, SYSDATETIME())),
        (2, 20 + (RAND() * 60), 30 + (RAND() * 50), DATEADD(HOUR, -@i, SYSDATETIME())),
        (4, 20 + (RAND() * 60), 30 + (RAND() * 50), DATEADD(HOUR, -@i, SYSDATETIME()));
    SET @i = @i + 1;
END;
GO

-- Create indexes for performance
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_metrics_timestamp ON performance_metrics(timestamp);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);
GO

PRINT 'Azure SQL Database setup completed successfully!';
PRINT 'Tables created: users, host_pools, sessions, performance_metrics, alerts';
GO
