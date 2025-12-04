require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'avd_user',
  password: process.env.DB_PASSWORD || 'avd_password',
  database: process.env.DB_NAME || 'avd_dashboard'
};

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: pool ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database connection pool
let pool;

async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    // Test the connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✓ Connected to database successfully');
    console.log(`✓ Database: ${dbConfig.database} on ${dbConfig.host}:${dbConfig.port}`);
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    console.error('✗ App will continue but database features will not work');
    // Don't exit - allow app to start even if DB is not ready
    pool = null;
  }
}

// API Routes

// Get dashboard overview
app.get('/api/overview', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_sessions,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_sessions,
        AVG(cpu_usage) as avg_cpu,
        AVG(memory_usage) as avg_memory
      FROM sessions
      WHERE DATE(created_at) = CURDATE()
    `);
    
    const [totalUsers] = await pool.query('SELECT COUNT(*) as count FROM users WHERE status = "active"');
    const [totalHosts] = await pool.query('SELECT COUNT(*) as count FROM host_pools WHERE status = "online"');
    
    res.json({
      totalSessions: stats[0].total_sessions || 0,
      activeSessions: stats[0].active_sessions || 0,
      avgCpu: parseFloat(stats[0].avg_cpu || 0).toFixed(2),
      avgMemory: parseFloat(stats[0].avg_memory || 0).toFixed(2),
      totalUsers: totalUsers[0].count || 0,
      totalHosts: totalHosts[0].count || 0
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Failed to fetch overview data' });
  }
});

// Get active sessions
app.get('/api/sessions', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const [sessions] = await pool.query(`
      SELECT 
        s.session_id,
        s.user_id,
        u.username,
        s.host_pool,
        s.status,
        s.cpu_usage,
        s.memory_usage,
        s.duration,
        s.created_at
      FROM sessions s
      JOIN users u ON s.user_id = u.user_id
      ORDER BY s.created_at DESC
      LIMIT 50
    `);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get host pool status
app.get('/api/hostpools', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const [hostPools] = await pool.query(`
      SELECT 
        host_pool_id,
        name,
        region,
        status,
        total_capacity,
        current_load,
        cpu_usage,
        memory_usage,
        last_updated
      FROM host_pools
      ORDER BY name
    `);
    res.json(hostPools);
  } catch (error) {
    console.error('Error fetching host pools:', error);
    res.status(500).json({ error: 'Failed to fetch host pools' });
  }
});

// Get performance metrics (last 24 hours)
app.get('/api/metrics', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const [metrics] = await pool.query(`
      SELECT 
        DATE_FORMAT(timestamp, '%H:%i') as time,
        AVG(cpu_usage) as cpu,
        AVG(memory_usage) as memory,
        COUNT(DISTINCT session_id) as sessions
      FROM performance_metrics
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY DATE_FORMAT(timestamp, '%H:%i')
      ORDER BY MAX(timestamp) DESC
      LIMIT 48
    `);
    res.json(metrics.reverse());
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get user activity
app.get('/api/users', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const [users] = await pool.query(`
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.status,
        u.last_login,
        COUNT(s.session_id) as total_sessions
      FROM users u
      LEFT JOIN sessions s ON u.user_id = s.user_id
      GROUP BY u.user_id
      ORDER BY u.last_login DESC
      LIMIT 50
    `);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get alerts
app.get('/api/alerts', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    const [alerts] = await pool.query(`
      SELECT 
        alert_id,
        severity,
        message,
        source,
        created_at,
        resolved
      FROM alerts
      WHERE resolved = FALSE
      ORDER BY created_at DESC
      LIMIT 20
    `);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 AVD Dashboard running on http://localhost:${PORT}`);
    console.log(`📊 Cyberpunk theme enabled`);
  });
}

startServer();
