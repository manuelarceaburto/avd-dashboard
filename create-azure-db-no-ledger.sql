-- Script to create Azure SQL Database WITHOUT Ledger
-- Run this in Azure SQL Server (master database) to create a new database

-- This must be run against the master database
USE master;
GO

-- Drop existing database if you want to recreate it
-- DROP DATABASE IF EXISTS avd_dashboard;
-- GO

-- Create database WITHOUT ledger
CREATE DATABASE avd_dashboard_migration
WITH (EDITION = 'Basic', LEDGER = OFF);
GO

-- Now use the new database
USE avd_dashboard_migration;
GO

-- Create all tables (they will NOT be ledger tables)
CREATE TABLE [dbo].[users] (
  [user_id] INT PRIMARY KEY IDENTITY(1,1),
  [username] NVARCHAR(100) NOT NULL UNIQUE,
  [email] NVARCHAR(255) NOT NULL,
  [status] NVARCHAR(20) DEFAULT 'active' CHECK ([status] IN ('active', 'inactive')),
  [last_login] DATETIME2,
  [created_at] DATETIME2 DEFAULT SYSDATETIME()
);
GO

CREATE TABLE [dbo].[host_pools] (
  [host_pool_id] INT PRIMARY KEY IDENTITY(1,1),
  [name] NVARCHAR(100) NOT NULL,
  [region] NVARCHAR(50) NOT NULL,
  [status] NVARCHAR(20) DEFAULT 'online' CHECK ([status] IN ('online', 'offline', 'maintenance')),
  [total_capacity] INT NOT NULL,
  [current_load] INT DEFAULT 0,
  [cpu_usage] DECIMAL(5,2) DEFAULT 0,
  [memory_usage] DECIMAL(5,2) DEFAULT 0,
  [last_updated] DATETIME2 DEFAULT SYSDATETIME(),
  [created_at] DATETIME2 DEFAULT SYSDATETIME()
);
GO

CREATE TABLE [dbo].[alerts] (
  [alert_id] INT PRIMARY KEY IDENTITY(1,1),
  [severity] NVARCHAR(20) NOT NULL CHECK ([severity] IN ('critical', 'warning', 'info')),
  [message] NVARCHAR(MAX) NOT NULL,
  [source] NVARCHAR(100),
  [resolved] BIT DEFAULT 0,
  [created_at] DATETIME2 DEFAULT SYSDATETIME()
);
GO

CREATE TABLE [dbo].[sessions] (
  [session_id] INT PRIMARY KEY IDENTITY(1,1),
  [user_id] INT NOT NULL,
  [host_pool] NVARCHAR(100) NOT NULL,
  [status] NVARCHAR(20) DEFAULT 'active' CHECK ([status] IN ('active', 'disconnected', 'idle')),
  [cpu_usage] DECIMAL(5,2) DEFAULT 0,
  [memory_usage] DECIMAL(5,2) DEFAULT 0,
  [duration] INT DEFAULT 0,
  [created_at] DATETIME2 DEFAULT SYSDATETIME(),
  FOREIGN KEY ([user_id]) REFERENCES [dbo].[users]([user_id])
);
GO

CREATE TABLE [dbo].[performance_metrics] (
  [metric_id] INT PRIMARY KEY IDENTITY(1,1),
  [session_id] INT,
  [cpu_usage] DECIMAL(5,2) NOT NULL,
  [memory_usage] DECIMAL(5,2) NOT NULL,
  [timestamp] DATETIME2 DEFAULT SYSDATETIME(),
  FOREIGN KEY ([session_id]) REFERENCES [dbo].[sessions]([session_id])
);
GO

-- Create indexes for performance
CREATE INDEX idx_sessions_user ON [dbo].[sessions]([user_id]);
CREATE INDEX idx_sessions_status ON [dbo].[sessions]([status]);
CREATE INDEX idx_metrics_timestamp ON [dbo].[performance_metrics]([timestamp]);
CREATE INDEX idx_alerts_resolved ON [dbo].[alerts]([resolved]);
GO

PRINT 'Database avd_dashboard_migration created successfully WITHOUT ledger!';
PRINT 'You can now use SSMA to migrate data to this database.';
GO
