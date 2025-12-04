# Azure Web App Deployment Checklist

## ✅ Pre-Deployment Complete
- [x] Azure SQL Database created and migrated
- [x] Tables created (non-ledger)
- [x] SSMA migration successful
- [x] package.json configured with engines
- [x] .gitignore created
- [x] web.config created (for Windows App Service)
- [x] startup.sh created (for Linux App Service)

## 📋 Quick Deployment Steps

### Using VS Code (Recommended)

1. **Install Azure App Service Extension**
   ```
   Press Ctrl+Shift+X
   Search: "Azure App Service"
   Click Install
   ```

2. **Sign in to Azure**
   ```
   Press Ctrl+Shift+P
   Type: "Azure: Sign In"
   Follow prompts
   ```

3. **Deploy**
   ```
   Right-click on AVD folder
   Select "Deploy to Web App..."
   Choose: Create new Web App (Advanced)
   
   Settings:
   - Name: avd-dashboard-[yourname]
   - Runtime: Node 18 LTS
   - OS: Linux (recommended) or Windows
   - Region: East US (or same as your SQL)
   - App Service Plan: Create new (B1 Basic)
   ```

4. **Configure App Settings** (After deployment)
   ```
   In VS Code Azure Extension:
   - Expand your subscription
   - Find your web app
   - Right-click → Application Settings
   - Add these settings:
   
   DB_HOST = avddashboard.database.windows.net
   DB_USER = proadmin
   DB_PASSWORD = Jocot3@281186
   DB_NAME = avd_dashboard
   DB_PORT = 1433
   NODE_ENV = production
   ```

5. **Browse Your Site**
   ```
   Right-click web app → Browse Website
   URL: https://avd-dashboard-[yourname].azurewebsites.net
   ```

## 🔧 Azure Portal Method (Alternative)

1. Go to https://portal.azure.com
2. Create Resource → Web App
3. Configure:
   - Resource Group: Create new or use existing
   - Name: avd-dashboard-[unique]
   - Publish: Code
   - Runtime: Node 18 LTS
   - Region: Same as SQL database
   - Pricing: B1 Basic ($13/mo) or F1 Free
4. Review + Create
5. Go to Deployment Center → Choose deployment method
6. Configure Application Settings (Configuration → Application settings)

## 🌐 After Deployment

### Test Your App
- Visit: https://[your-app-name].azurewebsites.net
- Check all pages load
- Verify data shows from Azure SQL

### Enable Continuous Deployment (Optional)
- Push code to GitHub
- Configure GitHub Actions in Deployment Center
- Auto-deploy on every push

### Monitor & Scale
- Go to "App Service logs" to enable logging
- "Scale up" to change pricing tier
- "Scale out" to add instances (Standard tier+)

## 🔒 Security Best Practices

1. **Remove .env file from deployment**
   - It's in .gitignore (good!)
   - Use Azure App Settings instead

2. **Enable HTTPS only**
   - TLS/SSL settings → HTTPS Only: On

3. **Configure firewall** (Azure SQL)
   - Add your App Service's outbound IP addresses
   - Or enable "Allow Azure services"

## 💡 Troubleshooting

If app doesn't start:
1. Check App Service logs (Log stream)
2. Verify Node version matches package.json
3. Check Application Settings are correct
4. Test database connection from Azure

## 📊 Cost Estimate

- App Service B1: ~$13/month
- Azure SQL Basic: ~$5/month
- **Total: ~$18-20/month**

Free tier available for testing (limited resources)
