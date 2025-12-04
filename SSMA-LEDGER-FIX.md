# Fix for SSMA Migration Error with Ledger Tables

## Problem
Your Azure SQL Database `avd_dashboard` was created with LEDGER = ON, which makes all tables ledger-enabled. SSMA cannot TRUNCATE ledger tables, causing migration to fail.

## Solution Options

### Option 1: Create New Database WITHOUT Ledger (Recommended)

1. **In Azure Portal**, go to SQL databases
2. Click "+ Create"
3. Name it: `avd_dashboard_no_ledger`
4. Under "Additional settings" → "Ledger" → Select **OFF**
5. Create the database

6. **In SSMA**:
   - Connect to the new database `avd_dashboard_no_ledger`
   - Convert schema (this will create tables)
   - Migrate data (should work without truncate errors)

### Option 2: Configure SSMA for Ledger Tables

1. In SSMA, go to **Tools → Project Settings → Migration**

2. Change these settings:
   - **Data Migration Engine**: Change to "Server side data migration engine"
   - **Truncate target table before migration**: Set to **FALSE** or **DISABLED**
   - **Replace invalid characters**: Keep default

3. Try migration again

### Option 3: Manual Data Migration Script

Since your current database has ledger enabled and only 1,487 total rows, you can use this approach:

1. Keep the current `avd_dashboard` database
2. The tables are already created (just empty)
3. Run SSMA with "Truncate" disabled
4. SSMA will INSERT data without truncating

### To Disable Truncate in SSMA:

1. Open your SSMA project
2. Go to: **Tools → Project Settings → Migration**
3. Find **"Truncate target table before migration"** 
4. Set it to **No/False/Disabled**
5. Save settings
6. Run migration again

## Current Database Status

- **Database**: avd_dashboard  
- **Server**: avddashboard.database.windows.net
- **Ledger**: ON (all tables are ledger tables)
- **Tables**: Created and ready (currently empty)
- **Schema**: dbo (correct)

## Expected Rows to Migrate

- users: 11 rows
- host_pools: 10 rows
- sessions: 37 rows  
- alerts: 57 rows
- performance_metrics: 1,372 rows

**Total**: 1,487 rows

## After Migration Success

Update your Node.js `.env` file to use Azure SQL:
```
DB_HOST=avddashboard.database.windows.net
DB_PORT=1433
DB_USER=proadmin
DB_PASSWORD=Jocot3@281186
DB_NAME=avd_dashboard
```

Install mssql driver:
```
npm install mssql
```

The application will need minor code changes to use mssql instead of mysql2.
