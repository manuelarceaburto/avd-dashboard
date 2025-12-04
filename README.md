# AVD Dashboard - Cyberpunk Edition 🚀

A stunning Azure Virtual Desktop (AVD) monitoring dashboard with a cyberpunk aesthetic, built with Node.js and MySQL. Perfect for demonstrating Azure migration POCs with real-time metrics and fake data.

## ✨ Features

- **Cyberpunk UI Design** - Neon colors, glitch effects, and futuristic styling
- **Real-time Monitoring** - Live session tracking and performance metrics
- **MySQL Backend** - Full relational database with sample data
- **RESTful API** - Express.js backend with clean endpoints
- **Docker Ready** - Complete containerization for easy deployment
- **Responsive Design** - Works on desktop and mobile devices

## 🎨 Dashboard Components

- **Overview Stats** - Total sessions, active users, host pools
- **Performance Charts** - Real-time CPU, memory, and session tracking
- **Host Pool Status** - Monitor multiple Azure regions
- **Active Sessions** - User session details with status
- **System Alerts** - Critical, warning, and info notifications
- **User Activity** - Track login patterns and usage

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0
- **Container**: Docker & Docker Compose

## 📦 Installation

### Prerequisites

- Node.js 18+ or Docker
- MySQL 8.0 (if running without Docker)

### Option 1: Docker (Recommended)

```bash
# Clone or navigate to the project directory
cd AVD

# Start with Docker Compose
docker-compose up -d

# Access the dashboard
# Open http://localhost:3000 in your browser
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Set up MySQL database
# Run the init.sql script in your MySQL server

# Configure environment variables (optional)
# Create .env file with:
# DB_HOST=localhost
# DB_USER=avd_user
# DB_PASSWORD=avd_password
# DB_NAME=avd_dashboard

# Start the server
npm start
```

## 🚀 Quick Start

1. **Start the application**:
   ```bash
   docker-compose up -d
   ```

2. **Access the dashboard**:
   - Open your browser to `http://localhost:3000`
   - The dashboard will load with fake AVD data

3. **Explore the features**:
   - View real-time metrics and charts
   - Check host pool status across regions
   - Monitor active user sessions
   - Review system alerts

## 📊 API Endpoints

- `GET /api/overview` - Dashboard statistics
- `GET /api/sessions` - Active session list
- `GET /api/hostpools` - Host pool status
- `GET /api/metrics` - Performance metrics (24h)
- `GET /api/users` - User activity
- `GET /api/alerts` - System alerts
- `GET /api/health` - Health check

## 🗄️ Database Schema

The MySQL database includes:
- **users** - AVD user accounts
- **host_pools** - Azure host pool configurations
- **sessions** - Active and historical sessions
- **performance_metrics** - Time-series performance data
- **alerts** - System notifications

## 🎯 Use Cases

- **Azure Migration POC** - Demonstrate AVD monitoring capabilities
- **Customer Demos** - Showcase real-time dashboards
- **Training** - Learn Node.js + MySQL integration
- **Development** - Template for monitoring applications

## 🔧 Configuration

Environment variables (optional):

```env
DB_HOST=localhost
DB_USER=avd_user
DB_PASSWORD=avd_password
DB_NAME=avd_dashboard
PORT=3000
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build

# Reset database
docker-compose down -v
docker-compose up -d
```

## 📱 Screenshots

The dashboard features:
- Glowing neon typography with glitch effects
- Real-time updating metrics and charts
- Animated scanlines and cyber effects
- Pink/blue/purple cyberpunk color scheme
- Responsive grid layouts

## 🔐 Security Note

This is a **demonstration application** with fake data. For production use:
- Change all default passwords
- Implement authentication
- Use environment variables for secrets
- Enable HTTPS
- Add input validation
- Implement rate limiting

## 📝 License

MIT License - Feel free to use for your POCs and demos!

## 🤝 Contributing

This is a POC project, but suggestions are welcome!

## 💡 Tips

- The database auto-populates with fake data on first run
- Metrics refresh every 5-30 seconds
- Charts show the last 24 hours of data
- All timestamps are in local time

---

**Built for Azure Migration POCs** | **Powered by Node.js & MySQL** | **Styled with Cyberpunk** 🌆 Dashboard - Azure Migration POC

A dashboard application for Azure Virtual Desktop (AVD) monitoring with MySQL backend, designed for Azure migration proof of concept.

## Features

- Real-time AVD session monitoring
- Host pool performance metrics
- User session analytics
- Resource utilization tracking
- MySQL database backend

## Prerequisites

- Node.js (v16 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Database**
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`

3. **Initialize Database**
   ```bash
   npm run init-db
   ```

4. **Start the Application**
   ```bash
   npm start
   ```

5. **Access Dashboard**
   - Open browser to `http://localhost:3000`

## Database Schema

The application uses the following tables:
- `host_pools` - AVD host pool information
- `session_hosts` - Virtual machine session hosts
- `user_sessions` - Active and historical user sessions
- `performance_metrics` - System performance data

## Azure Migration Considerations

This POC demonstrates:
- MySQL database connectivity patterns
- RESTful API design for cloud migration
- Dashboard visualization for monitoring
- Data model suitable for Azure SQL Database migration

## API Endpoints

- `GET /api/hostpools` - List all host pools
- `GET /api/sessions` - List active sessions
- `GET /api/metrics` - Get performance metrics
- `GET /api/dashboard` - Get dashboard summary data
