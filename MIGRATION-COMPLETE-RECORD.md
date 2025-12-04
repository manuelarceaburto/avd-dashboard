# AVD Dashboard - Complete Migration Journey

**Project:** Azure Virtual Desktop Dashboard Migration  
**Date:** December 4, 2025  
**Objective:** Migrate MySQL dashboard application to Azure (Database + Web App)

---

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Local Development Environment](#local-development-environment)
3. [Database Migration to Azure SQL](#database-migration-to-azure-sql)
4. [SSMA Migration](#ssma-migration)
5. [Web App Deployment Preparation](#web-app-deployment-preparation)
6. [Next Steps](#next-steps)

---

## 1. Initial Setup

### Project Structure
```
AVD/
├── server.js                 # Node.js Express server
├── package.json             # Dependencies and scripts
├── .env                     # Environment configuration
├── init.sql                 # MySQL database schema
├── simulator.js             # Data simulation script
├── add-data.js             # Additional data seeding
├── public/
│   ├── index.html          # Dashboard frontend
│   ├── app.js              # Frontend JavaScript
│   └── styles.css          # Cyberpunk theme CSS
└── README.md               # Project documentation
```

### Technology Stack
- **Backend:** Node.js 24.11.1, Express.js
- **Database:** MySQL 9.2.0 (local) → Azure SQL Database
- **Frontend:** Vanilla HTML/CSS/JavaScript, Chart.js
- **Theme:** Cyberpunk-style dashboard

---

## 2. Local Development Environment

### Step 2.1: Install Dependencies
```powershell
# Installed via Chocolatey
choco install mysql --version=8.0  # MySQL 9.2.0 was already installed
choco install nodejs               # Node.js 24.11.1

# Install npm packages
npm install
```

**Dependencies Installed:**
- express: ^4.18.2
- mysql2: ^3.6.5
- dotenv: ^16.3.1
- cors: ^2.8.5
- nodemon: ^3.0.2 (dev)

### Step 2.2: Database Configuration
**File:** `.env`
```env
# Local MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Vaness4@281186
DB_NAME=avd_dashboard
DB_PORT=3305

PORT=3000
```

### Step 2.3: Initialize Local Database
```powershell
# Created database schema with 5 tables
mysql -u root -e "SOURCE init.sql"
```

**Tables Created:**
1. **users** - 11 active users
2. **host_pools** - 10 Azure region pools
3. **sessions** - 12 active sessions
4. **alerts** - 8 system alerts
5. **performance_metrics** - 72+ time-series metrics

### Step 2.4: Fix Server Configuration
**Issue:** Server missing `dotenv` configuration  
**Solution:** Added to `server.js`:
```javascript
require('dotenv').config();
```

**Issue:** SQL query GROUP BY error (MySQL 9.2 strict mode)  
**Solution:** Fixed metrics query in `server.js`:
```javascript
// Changed from:
GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i')
ORDER BY timestamp DESC

// To:
GROUP BY DATE_FORMAT(timestamp, '%H:%i')
ORDER BY MAX(timestamp) DESC
```

### Step 2.5: Enhanced Data Population
**Created:** `add-data.js`
- Added 6 more users (total: 11)
- Added 5 more host pools (total: 10)
- Added 8 more sessions (total: 12)
- Added 4 more alerts (total: 8)

**Executed:**
```powershell
node add-data.js
```

### Step 2.6: Data Simulator
**Created:** `simulator.js`
- Updates session metrics every 5 seconds
- Updates host pool metrics every 10 seconds
- Adds performance metrics every 15 seconds
- Generates alerts every 30 seconds
- Simulates user activity every 20 seconds

**Fixed Issues:**
- Variable naming conflict (`pool` vs database `pool`)
- NaN values in fluctuate function
- Type conversion for duration field

**Started Simulator:**
```powershell
npm run simulate
```

### Step 2.7: Server Deployment
**Started Server:**
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start" -WindowStyle Minimized
```

**Dashboard URL:** http://localhost:3000

**Live Data:**
- 10 Host Pools across Azure regions
- 12 Active Sessions with real-time updates
- Performance charts with 24-hour metrics
- System alerts with severity levels

---

## 3. Database Migration to Azure SQL

### Step 3.1: Azure SQL Server Connection
**Server:** avddashboard.database.windows.net  
**Database:** avd_dashboard  
**Port:** 1433  
**User:** proadmin  
**Password:** Jocot3@281186

**Connection String:**
```
Server=tcp:avddashboard.database.windows.net,1433;Initial Catalog=avd_dashboard;Persist Security Info=False;User ID=proadmin;Password=Jocot3@281186;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### Step 3.2: Initial Schema Creation Attempt
**Created:** `azure-sql-setup.sql`
- Converted MySQL syntax to T-SQL
- Changed data types: TIMESTAMP → DATETIME2, VARCHAR → NVARCHAR, BOOLEAN → BIT
- Changed AUTO_INCREMENT → IDENTITY(1,1)
- Added GO statements for batch execution

**Issue:** sqlcmd not installed  
**Solution:** Used VS Code MSSQL extension instead

### Step 3.3: Connected via VS Code MSSQL Extension
**Connection ID:** Multiple connections created

**Successfully Created:**
- All 5 tables with proper T-SQL syntax
- Foreign key constraints
- Check constraints
- Performance indexes
- Sample data inserted (11 users, 10 host pools, 12 sessions, 8 alerts, 72 metrics)

---

## 4. SSMA Migration

### Step 4.1: Initial SSMA Attempt - FAILED
**Error:** "Truncate failed on table because it is not a supported operation on system-versioned tables"

**Root Cause:** Azure SQL Database was created with LEDGER = ON by default, making all tables UPDATABLE_LEDGER_TABLE

**Tables Status Check:**
```sql
SELECT name, ledger_type, ledger_type_desc 
FROM sys.tables 
WHERE schema_id = SCHEMA_ID('dbo');
```
**Result:** All tables showed `UPDATABLE_LEDGER_TABLE`

### Step 4.2: Ledger Table Investigation
**Findings:**
- Database created with LEDGER = ON at database level
- All tables automatically became ledger tables
- SSMA cannot TRUNCATE ledger tables before migration
- Cannot disable ledger on existing database
- Cannot create tables with LEDGER = OFF in ledger database

**Error Messages:**
```
"ObjectNotExistsInTarget"
"Truncate failed on table 'avd_dashboard.dbo.alerts' because it is not a supported operation on system-versioned tables."
"Target table [avd_dashboard].[dbo].[alerts] not found."
```

### Step 4.3: Solution - New Database Without Ledger
**Action:** User deleted old database and created new one

**Verified New Database:**
```sql
SELECT DATABASEPROPERTYEX(DB_NAME(), 'IsLedger') AS IsLedgerEnabled;
-- Result: NULL (no ledger enforcement)
```

### Step 4.4: Final Azure SQL Schema Creation
**Connection:** Connected to new `avd_dashboard` database

**Created Tables with Explicit Settings:**
```sql
CREATE TABLE [dbo].[users] (
  [user_id] INT PRIMARY KEY IDENTITY(1,1) NOT NULL,
  [username] NVARCHAR(100) NOT NULL UNIQUE,
  ...
);
-- Repeated for all 5 tables
```

**Created Indexes:**
```sql
CREATE INDEX idx_sessions_user ON [dbo].[sessions]([user_id]);
CREATE INDEX idx_sessions_status ON [dbo].[sessions]([status]);
CREATE INDEX idx_metrics_timestamp ON [dbo].[performance_metrics]([timestamp]);
CREATE INDEX idx_alerts_resolved ON [dbo].[alerts]([resolved]);
```

**Verified Non-Ledger Status:**
```sql
SELECT name, ledger_type, ledger_type_desc
FROM sys.tables
WHERE name IN ('users', 'host_pools', 'sessions', 'alerts', 'performance_metrics');
```
**Result:** All tables = `NON_LEDGER_TABLE` ✅

**Tested TRUNCATE:**
```sql
TRUNCATE TABLE [dbo].[performance_metrics];
TRUNCATE TABLE [dbo].[alerts];
-- SUCCESS! ✅
```

### Step 4.5: SSMA Configuration
**Ready for Migration:**
- ✅ Source: Local MySQL 9.2.0
- ✅ Target: Azure SQL Database (non-ledger)
- ✅ Tables: Empty and ready
- ✅ TRUNCATE: Working
- ✅ Schema: Identical structure

**Expected Migration:**
- users: 11 rows
- host_pools: 10 rows
- sessions: 37 rows (grew with simulator)
- alerts: 57 rows (grew with simulator)
- performance_metrics: 1,372 rows (grew with simulator)
- **Total: ~1,487 rows**

---

## 5. Web App Deployment Preparation

### Step 5.1: Updated Configuration Files

**Updated `.env` for Azure SQL:**
```env
# Database Configuration (Azure SQL)
DB_HOST=avddashboard.database.windows.net
DB_USER=proadmin
DB_PASSWORD=Jocot3@281186
DB_NAME=avd_dashboard
DB_PORT=1433

# Server Configuration
PORT=3000
```

**Updated `package.json`:**
```json
{
  "name": "avd-dashboard",
  "version": "1.0.0",
  "description": "Azure Virtual Desktop Dashboard with Azure SQL backend",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "keywords": ["avd", "azure", "dashboard", "sql"]
}
```

### Step 5.2: Created Deployment Files

**Created `.gitignore`:**
```
node_modules/
.env
*.log
.DS_Store
.vscode/
npm-debug.log*
```

**Created `web.config` (Windows App Service):**
- IIS configuration for Node.js
- Rewrite rules for Express routes
- Static content handling

**Created `startup.sh` (Linux App Service):**
```bash
node server.js
```

**Created `.deployment`:**
```
[config]
command = npm start
```

### Step 5.3: Documentation Created

**Files Created:**
1. `AZURE-DEPLOY-GUIDE.md` - Deployment methods overview
2. `DEPLOYMENT-CHECKLIST.md` - Step-by-step deployment guide
3. `SSMA-LEDGER-FIX.md` - SSMA ledger issue documentation
4. `azure-sql-setup.sql` - Complete Azure SQL schema script
5. `create-azure-db-no-ledger.sql` - Non-ledger database creation script

### Step 5.4: Deployment Tools Installed
- ✅ VS Code Azure App Service Extension
- ✅ Azure CLI (az cli)

---

## 6. Azure App Service Deployment

### Step 6.1: Login to Azure
```powershell
az login
```
**Result:** Successfully authenticated with Azure
- Selected Subscription: Visual Studio Enterprise Subscription (cb8ecd6f-2dbb-47ca-af59-3bf80f69024e)
- Tenant: Default Directory

### Step 6.2: Set Subscription Context
```powershell
az account set --subscription 40a2fdde-ae0a-4ac5-98cb-39d5347f1b49
```

### Step 6.3: Create App Service Plan
```powershell
az appservice plan create --name avd-dashboard-plan --resource-group Canada --sku B1 --is-linux
```
**Result:** ✅ Successfully created
- Name: avd-dashboard-plan
- Resource Group: Canada
- Region: Canada Central
- SKU: B1 (Basic)
- OS: Linux
- Status: Ready

### Step 6.4: Create Web App
```powershell
az webapp create --resource-group Canada --plan avd-dashboard-plan --name avd-dashboard-app --runtime "NODE:20-lts"
```
**Result:** ✅ Successfully created
- Name: avd-dashboard-app
- URL: https://avd-dashboard-app.azurewebsites.net
- Runtime: Node.js 20 LTS
- Status: Running
- Region: Canada Central

### Step 6.5: Configure Application Settings
```powershell
az webapp config appsettings set --resource-group Canada --name avd-dashboard-app --settings "DB_HOST=avddashboard.database.windows.net" "DB_USER=proadmin" "DB_PASSWORD=Jocot3@281186" "DB_NAME=avd_dashboard" "DB_PORT=1433" "NODE_ENV=production"
```
**Verified Settings:**
```powershell
az webapp config appsettings list --resource-group Canada --name avd-dashboard-app --output table
```
**Result:** ✅ All settings configured correctly
- DB_HOST: avddashboard.database.windows.net
- DB_USER: proadmin
- DB_PASSWORD: Jocot3@281186
- DB_NAME: avd_dashboard
- DB_PORT: 1433
- NODE_ENV: production

### Step 6.6: Configure SQL Server Firewall
```powershell
az sql server firewall-rule create --resource-group Canada --server avddashboard --name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```
**Result:** ✅ Firewall rule created
- Rule Name: AllowAzureServices
- Purpose: Allows Azure App Service to connect to Azure SQL Database
- IP Range: 0.0.0.0 to 0.0.0.0 (special range for Azure services)

### Step 6.7: Set Startup Command
```powershell
az webapp config set --resource-group Canada --name avd-dashboard-app --startup-file "node server.js"
```
**Result:** ✅ Startup command configured

### Step 6.8: Deploy Application Code
**Attempted Deployment Method 1 - az webapp up:**
```powershell
az webapp up --resource-group Canada --name avd-dashboard-app --runtime "NODE:20-lts"
```
**Result:** ❌ Build failed - checking deployment logs

**Attempted Deployment Method 2 - Zip Deployment:**
```powershell
# Create deployment package
Get-ChildItem -Path . -Exclude node_modules,.git,*.zip,deploy.zip,SSMAProjects | Compress-Archive -DestinationPath deploy.zip -Force

# Deploy zip file
az webapp deployment source config-zip --resource-group Canada --name avd-dashboard-app --src deploy.zip
```
**Result:** ❌ Build failed - troubleshooting in progress

**Enable Build Automation:**
```powershell
az webapp config appsettings set --resource-group Canada --name avd-dashboard-app --settings "SCM_DO_BUILD_DURING_DEPLOYMENT=true"
```

### Current Status: Troubleshooting Deployment
**Issue:** Build process is failing during deployment  
**Next Actions:**
1. Check deployment logs at: https://avd-dashboard-app.scm.azurewebsites.net/deployments
2. Verify build configuration
3. Consider alternative deployment methods (VS Code extension, GitHub Actions)

---

## 7. Next Steps

### Immediate Tasks
1. ⏳ Resolve deployment build errors
2. ⏳ Complete application deployment
3. ⏳ Test deployed application at https://avd-dashboard-app.azurewebsites.net

### Post-Deployment Validation
1. ✅ SQL Server firewall configured for Azure services
2. ⏳ Test database connectivity from App Service
3. ⏳ Verify all dashboard features work
4. ⏳ Check application logs
5. ⏳ Monitor performance metrics

### Optional Enhancements
1. Enable Application Insights (monitoring)
2. Set up custom domain
3. Configure SSL certificate (auto with Azure)
4. Set up GitHub Actions for CI/CD
5. Configure auto-scaling rules

---

## Summary of Achievements

✅ **Local Development Environment**
- MySQL database with 5 tables
- Node.js Express server
- Cyberpunk-themed dashboard
- Real-time data simulator
- 1,487+ rows of sample data

✅ **Azure SQL Migration**
- Database schema converted MySQL → T-SQL
- Resolved ledger table issues
- Created non-ledger tables
- Ready for SSMA migration

✅ **Azure App Service Infrastructure**
- App Service Plan created (B1 Basic, Linux)
- Web App created (avd-dashboard-app)
- Application settings configured
- SQL Server firewall rule added
- Startup command configured

🔄 **In Progress**
- SSMA data migration (ready to execute)
- Azure App Service deployment (troubleshooting build errors)

---

## Technical Specifications

**Local Environment:**
- OS: Windows
- Node.js: 24.11.1
- MySQL: 9.2.0
- Port: 3000

**Azure Environment:**
- Subscription ID: 40a2fdde-ae0a-4ac5-98cb-39d5347f1b49
- Resource Group: Canada
- Region: Canada Central
- SQL Server: avddashboard.database.windows.net
- Database: avd_dashboard (non-ledger)
- App Service Plan: avd-dashboard-plan (B1 Basic, Linux)
- Web App: avd-dashboard-app
- Web App URL: https://avd-dashboard-app.azurewebsites.net
- Runtime: Node.js 20 LTS
- Startup Command: node server.js

**Cost Estimates:**
- Azure SQL Basic: ~$5/month
- App Service B1: ~$13/month
- **Total: ~$18-20/month**

---

## Key Issues Resolved

1. ✅ Missing dotenv configuration
2. ✅ MySQL GROUP BY strict mode error
3. ✅ Simulator variable naming conflicts
4. ✅ NaN values in fluctuation calculations
5. ✅ Azure SQL ledger table blocking SSMA
6. ✅ Database recreation without ledger
7. ✅ Schema conversion MySQL → T-SQL

---

## Contacts & Resources

**Azure SQL Server:** avddashboard.database.windows.net  
**Dashboard (Local):** http://localhost:3000  
**Dashboard (Azure):** TBD after deployment  

**Documentation Files:**
- Project root: `c:\Users\Administrator\Documents\AVD\`
- SSMA Project: `c:\Users\Administrator\Documents\SSMAProjects\Migration\`

---

**Last Updated:** December 4, 2025 - 17:15 UTC  
**Status:** Azure Infrastructure Created - Troubleshooting Deployment  
**Current Issue:** Build process failing during zip deployment  
**Next Action:** Resolve deployment build errors and complete application deployment
