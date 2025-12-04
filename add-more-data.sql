USE avd_dashboard;

-- Add more users
INSERT INTO users (username, email, status, last_login) VALUES
('mike.johnson', 'mike.johnson@company.com', 'active', NOW() - INTERVAL 10 MINUTE),
('sarah.williams', 'sarah.williams@company.com', 'active', NOW() - INTERVAL 25 MINUTE),
('david.lee', 'david.lee@company.com', 'active', NOW() - INTERVAL 45 MINUTE),
('emily.chen', 'emily.chen@company.com', 'active', NOW() - INTERVAL 1 HOUR),
('robert.taylor', 'robert.taylor@company.com', 'active', NOW() - INTERVAL 2 HOUR),
('lisa.anderson', 'lisa.anderson@company.com', 'active', NOW() - INTERVAL 3 HOUR);

-- Add more host pools for different regions
INSERT INTO host_pools (name, region, status, total_capacity, current_load, cpu_usage, memory_usage) VALUES
('Pool-EastUS-02', 'East US', 'online', 150, 95, 62.3, 78.5),
('Pool-SouthCentral-01', 'South Central US', 'online', 90, 52, 45.8, 58.3),
('Pool-UKSouth-01', 'UK South', 'online', 70, 38, 38.2, 52.7),
('Pool-AsiaSoutheast-01', 'Southeast Asia', 'online', 80, 45, 51.4, 64.2),
('Pool-AustraliaEast-01', 'Australia East', 'online', 60, 22, 28.9, 35.1);

-- Add more active sessions
INSERT INTO sessions (user_id, host_pool, status, cpu_usage, memory_usage, duration) VALUES
(5, 'Pool-EastUS-02', 'active', 58.3, 72.1, 145),
(6, 'Pool-SouthCentral-01', 'active', 42.7, 61.8, 220),
(7, 'Pool-UKSouth-01', 'active', 35.2, 48.3, 85),
(8, 'Pool-AsiaSoutheast-01', 'active', 68.9, 79.4, 165),
(9, 'Pool-AustraliaEast-01', 'idle', 12.3, 28.7, 95),
(10, 'Pool-EastUS-02', 'active', 71.2, 85.6, 310),
(1, 'Pool-SouthCentral-01', 'active', 48.5, 65.2, 125),
(2, 'Pool-UKSouth-01', 'disconnected', 5.2, 15.3, 45);

-- Add more alerts for variety
INSERT INTO alerts (severity, message, source, resolved) VALUES
('warning', 'Network latency spike detected', 'Pool-AsiaSoutheast-01', FALSE),
('info', 'New user onboarded successfully', 'System', FALSE),
('critical', 'Disk space threshold exceeded', 'Pool-EastUS-02', FALSE),
('warning', 'Session timeout approaching for multiple users', 'Session Monitor', FALSE),
('info', 'Backup completed successfully', 'System', TRUE),
('critical', 'Security scan detected potential threat', 'Security', FALSE);
