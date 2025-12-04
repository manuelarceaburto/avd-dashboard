require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'avd_dashboard'
};

async function addMoreData() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database\n');

    // Add more users
    console.log('Adding more users...');
    await connection.query(`
      INSERT INTO users (username, email, status, last_login) VALUES
      ('mike.johnson', 'mike.johnson@company.com', 'active', NOW() - INTERVAL 10 MINUTE),
      ('sarah.williams', 'sarah.williams@company.com', 'active', NOW() - INTERVAL 25 MINUTE),
      ('david.lee', 'david.lee@company.com', 'active', NOW() - INTERVAL 45 MINUTE),
      ('emily.chen', 'emily.chen@company.com', 'active', NOW() - INTERVAL 1 HOUR),
      ('robert.taylor', 'robert.taylor@company.com', 'active', NOW() - INTERVAL 2 HOUR),
      ('lisa.anderson', 'lisa.anderson@company.com', 'active', NOW() - INTERVAL 3 HOUR)
    `);
    console.log('✓ Added 6 more users');

    // Add more host pools
    console.log('Adding more host pools...');
    await connection.query(`
      INSERT INTO host_pools (name, region, status, total_capacity, current_load, cpu_usage, memory_usage) VALUES
      ('Pool-EastUS-02', 'East US', 'online', 150, 95, 62.3, 78.5),
      ('Pool-SouthCentral-01', 'South Central US', 'online', 90, 52, 45.8, 58.3),
      ('Pool-UKSouth-01', 'UK South', 'online', 70, 38, 38.2, 52.7),
      ('Pool-AsiaSoutheast-01', 'Southeast Asia', 'online', 80, 45, 51.4, 64.2),
      ('Pool-AustraliaEast-01', 'Australia East', 'online', 60, 22, 28.9, 35.1)
    `);
    console.log('✓ Added 5 more host pools');

    // Add more sessions
    console.log('Adding more sessions...');
    await connection.query(`
      INSERT INTO sessions (user_id, host_pool, status, cpu_usage, memory_usage, duration) VALUES
      (6, 'Pool-EastUS-02', 'active', 58.3, 72.1, 145),
      (7, 'Pool-SouthCentral-01', 'active', 42.7, 61.8, 220),
      (8, 'Pool-UKSouth-01', 'active', 35.2, 48.3, 85),
      (9, 'Pool-AsiaSoutheast-01', 'active', 68.9, 79.4, 165),
      (10, 'Pool-AustraliaEast-01', 'idle', 12.3, 28.7, 95),
      (11, 'Pool-EastUS-02', 'active', 71.2, 85.6, 310),
      (1, 'Pool-SouthCentral-01', 'active', 48.5, 65.2, 125),
      (2, 'Pool-UKSouth-01', 'disconnected', 5.2, 15.3, 45)
    `);
    console.log('✓ Added 8 more sessions');

    // Add more alerts
    console.log('Adding more alerts...');
    await connection.query(`
      INSERT INTO alerts (severity, message, source, resolved) VALUES
      ('warning', 'Network latency spike detected', 'Pool-AsiaSoutheast-01', FALSE),
      ('info', 'New user onboarded successfully', 'System', FALSE),
      ('critical', 'Disk space threshold exceeded', 'Pool-EastUS-02', FALSE),
      ('warning', 'Session timeout approaching for multiple users', 'Session Monitor', FALSE)
    `);
    console.log('✓ Added 4 more alerts');

    console.log('\n🎉 Successfully added more data to the database!');
    console.log('📊 New totals:');
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users WHERE status = "active"');
    const [hostPools] = await connection.query('SELECT COUNT(*) as count FROM host_pools');
    const [sessions] = await connection.query('SELECT COUNT(*) as count FROM sessions WHERE status IN ("active", "idle")');
    const [alerts] = await connection.query('SELECT COUNT(*) as count FROM alerts WHERE resolved = FALSE');
    
    console.log(`   - Active Users: ${users[0].count}`);
    console.log(`   - Host Pools: ${hostPools[0].count}`);
    console.log(`   - Active/Idle Sessions: ${sessions[0].count}`);
    console.log(`   - Unresolved Alerts: ${alerts[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addMoreData();
