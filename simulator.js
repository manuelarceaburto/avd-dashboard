require('dotenv').config();
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'avd_dashboard'
};

let pool;

async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✓ Connected to MySQL database');
    console.log('🎮 Starting AVD Dashboard Simulator...\n');
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    process.exit(1);
  }
}

// Generate random value with slight variation
function fluctuate(base, variance = 10) {
  const baseValue = parseFloat(base) || 50; // Default to 50 if NaN
  const newValue = baseValue + (Math.random() - 0.5) * variance * 2;
  return Math.max(0, Math.min(100, newValue));
}

// Update session metrics with realistic fluctuations
async function updateSessions() {
  try {
    const [sessions] = await pool.query('SELECT session_id, cpu_usage, memory_usage, duration FROM sessions WHERE status = "active"');
    
    for (const session of sessions) {
      const newCpu = fluctuate(session.cpu_usage, 15);
      const newMemory = fluctuate(session.memory_usage, 8);
      const newDuration = parseInt(session.duration) + 1; // Increment by 1 minute
      
      await pool.query(
        'UPDATE sessions SET cpu_usage = ?, memory_usage = ?, duration = ? WHERE session_id = ?',
        [newCpu, newMemory, newDuration, session.session_id]
      );
    }
    
    console.log(`📊 Updated ${sessions.length} active sessions`);
  } catch (error) {
    console.error('Error updating sessions:', error.message);
  }
}

// Update host pool metrics
async function updateHostPools() {
  try {
    const [hostPools] = await pool.query('SELECT host_pool_id, cpu_usage, memory_usage, current_load, total_capacity FROM host_pools WHERE status = "online"');
    
    for (const hostPool of hostPools) {
      const newCpu = fluctuate(hostPool.cpu_usage, 12);
      const newMemory = fluctuate(hostPool.memory_usage, 10);
      const loadChange = Math.floor((Math.random() - 0.5) * 10);
      const newLoad = Math.max(0, Math.min(hostPool.total_capacity, hostPool.current_load + loadChange));
      
      await pool.query(
        'UPDATE host_pools SET cpu_usage = ?, memory_usage = ?, current_load = ? WHERE host_pool_id = ?',
        [newCpu, newMemory, newLoad, hostPool.host_pool_id]
      );
    }
    
    console.log(`🖥️  Updated ${hostPools.length} host pools`);
  } catch (error) {
    console.error('Error updating host pools:', error.message);
  }
}

// Add performance metrics
async function addPerformanceMetrics() {
  try {
    const [sessions] = await pool.query('SELECT session_id, cpu_usage, memory_usage FROM sessions WHERE status = "active" LIMIT 3');
    
    for (const session of sessions) {
      await pool.query(
        'INSERT INTO performance_metrics (session_id, cpu_usage, memory_usage) VALUES (?, ?, ?)',
        [session.session_id, session.cpu_usage, session.memory_usage]
      );
    }
    
    // Clean old metrics (keep only last 24 hours)
    await pool.query('DELETE FROM performance_metrics WHERE timestamp < DATE_SUB(NOW(), INTERVAL 24 HOUR)');
    
    console.log(`📈 Added ${sessions.length} performance metrics`);
  } catch (error) {
    console.error('Error adding metrics:', error.message);
  }
}

// Randomly create new alerts
async function generateAlerts() {
  try {
    const alertTypes = [
      { severity: 'critical', messages: ['High CPU usage detected', 'Memory threshold exceeded', 'Session limit reached'] },
      { severity: 'warning', messages: ['Unusual login pattern', 'Performance degradation', 'Capacity warning'] },
      { severity: 'info', messages: ['Scheduled maintenance', 'System update available', 'Backup completed'] }
    ];
    
    // 20% chance to create a new alert
    if (Math.random() < 0.2) {
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const message = type.messages[Math.floor(Math.random() * type.messages.length)];
      
      const [hostPools] = await pool.query('SELECT name FROM host_pools ORDER BY RAND() LIMIT 1');
      const source = hostPools[0]?.name || 'System';
      
      await pool.query(
        'INSERT INTO alerts (severity, message, source) VALUES (?, ?, ?)',
        [type.severity, `${message} on ${source}`, source]
      );
      
      console.log(`⚠️  Generated ${type.severity} alert`);
    }
    
    // Randomly resolve old alerts (30% chance)
    if (Math.random() < 0.3) {
      await pool.query(
        'UPDATE alerts SET resolved = TRUE WHERE resolved = FALSE AND created_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE) ORDER BY RAND() LIMIT 1'
      );
    }
  } catch (error) {
    console.error('Error generating alerts:', error.message);
  }
}

// Simulate user activity (login/logout)
async function simulateUserActivity() {
  try {
    // 10% chance to create a new session
    if (Math.random() < 0.1) {
      const [users] = await pool.query('SELECT user_id FROM users WHERE status = "active" ORDER BY RAND() LIMIT 1');
      const [hostPools] = await pool.query('SELECT name FROM host_pools WHERE status = "online" ORDER BY RAND() LIMIT 1');
      
      if (users.length > 0 && hostPools.length > 0) {
        const cpuUsage = 20 + Math.random() * 50;
        const memoryUsage = 30 + Math.random() * 40;
        
        await pool.query(
          'INSERT INTO sessions (user_id, host_pool, status, cpu_usage, memory_usage, duration) VALUES (?, ?, "active", ?, ?, 0)',
          [users[0].user_id, hostPools[0].name, cpuUsage, memoryUsage]
        );
        
        console.log(`👤 New session created for user ${users[0].user_id}`);
      }
    }
    
    // 5% chance to disconnect a session
    if (Math.random() < 0.05) {
      await pool.query(
        'UPDATE sessions SET status = "disconnected" WHERE status = "active" ORDER BY RAND() LIMIT 1'
      );
    }
  } catch (error) {
    console.error('Error simulating user activity:', error.message);
  }
}

// Main simulation loop
async function runSimulation() {
  await initDatabase();
  
  console.log('🔄 Simulation running... (Press Ctrl+C to stop)\n');
  
  // Run immediately
  await updateSessions();
  await updateHostPools();
  await addPerformanceMetrics();
  
  // Update sessions every 5 seconds
  setInterval(async () => {
    await updateSessions();
  }, 5000);
  
  // Update host pools every 10 seconds
  setInterval(async () => {
    await updateHostPools();
  }, 10000);
  
  // Add performance metrics every 15 seconds
  setInterval(async () => {
    await addPerformanceMetrics();
  }, 15000);
  
  // Generate alerts every 30 seconds
  setInterval(async () => {
    await generateAlerts();
  }, 30000);
  
  // Simulate user activity every 20 seconds
  setInterval(async () => {
    await simulateUserActivity();
  }, 20000);
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Stopping simulator...');
  if (pool) {
    await pool.end();
  }
  process.exit(0);
});

// Start simulation
runSimulation();
