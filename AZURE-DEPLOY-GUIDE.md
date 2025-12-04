# Deploy AVD Dashboard to Azure App Service

## Prerequisites
✅ Azure subscription (you have this)
✅ Node.js app (you have this)
✅ Azure SQL Database (just migrated!)

## Deployment Methods

### Method 1: VS Code Extension (Easiest)

1. **Install Extension**
   - In VS Code, go to Extensions (Ctrl+Shift+X)
   - Search for "Azure App Service"
   - Install it

2. **Deploy**
   - Right-click on your project folder in VS Code
   - Select "Deploy to Web App..."
   - Sign in to Azure
   - Create new Web App or select existing
   - Follow prompts

### Method 2: Azure Portal (Manual)

1. Go to Azure Portal (portal.azure.com)
2. Create → Web App
   - Name: `avd-dashboard` (or your choice)
   - Runtime: Node 18 LTS
   - Region: Same as your SQL database
   - Pricing: B1 Basic (or Free F1 for testing)
3. After creation, go to Deployment Center
4. Choose deployment method (GitHub, Local Git, etc.)

### Method 3: GitHub Actions (CI/CD)

If you push to GitHub, Azure can auto-deploy on every commit.

## Configuration Needed

After deployment, configure these App Settings in Azure:

```
DB_HOST=avddashboard.database.windows.net
DB_PORT=1433
DB_USER=proadmin
DB_PASSWORD=Jocot3@281186
DB_NAME=avd_dashboard
PORT=8080
NODE_ENV=production
```

## Files to Prepare

Your app needs these files for Azure deployment:
- ✅ package.json (you have this)
- ⚠️  .deployment (optional - tells Azure what to deploy)
- ⚠️  web.config (optional - for Windows App Service)
- ⚠️  startup command in Azure config

## Estimated Cost

- **Free Tier (F1)**: $0/month (limited, good for testing)
- **Basic B1**: ~$13/month (production-ready)
- **Standard S1**: ~$70/month (auto-scale, better performance)

Your SQL database + Basic App Service = ~$20-30/month total

## URLs After Deployment

- Your app: `https://avd-dashboard.azurewebsites.net`
- Custom domain: Available in Basic tier and above
- SSL: Free (automatically provided)
