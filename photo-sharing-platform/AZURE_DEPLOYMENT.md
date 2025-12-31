# Azure Deployment Guide

This guide provides step-by-step instructions for deploying the Photo Sharing Platform to Microsoft Azure.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Azure Cloud Platform                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌─────────────────┐               │
│  │              │         │                 │               │
│  │   Frontend   │────────>│  Azure Static   │               │
│  │   (React)    │         │   Web Apps      │               │
│  │              │         │                 │               │
│  └──────────────┘         └─────────────────┘               │
│         │                                                    │
│         │ HTTPS                                              │
│         ▼                                                    │
│  ┌──────────────┐         ┌─────────────────┐               │
│  │              │         │                 │               │
│  │   Backend    │────────>│  Azure App      │               │
│  │   REST API   │         │   Service       │               │
│  │              │         │                 │               │
│  └──────────────┘         └─────────────────┘               │
│         │                          │                         │
│         │                          │                         │
│         ▼                          ▼                         │
│  ┌──────────────┐         ┌─────────────────┐               │
│  │  PostgreSQL  │         │  Azure Blob     │               │
│  │   Database   │         │   Storage       │               │
│  │              │         │  (Photos)       │               │
│  └──────────────┘         └─────────────────┘               │
│         │                          │                         │
│         └──────────────────────────┘                         │
│                    │                                         │
│                    ▼                                         │
│         ┌─────────────────┐                                  │
│         │   Azure CDN     │                                  │
│         │  (Global Cache) │                                  │
│         └─────────────────┘                                  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Azure Account** with active subscription
2. **Azure CLI** installed
3. **Git** installed
4. **Node.js** installed locally
5. **Docker** (optional, for testing)

## Step 1: Setup Azure Resources

### 1.1 Login to Azure
```bash
az login
az account set --subscription "Your-Subscription-Name"
```

### 1.2 Create Resource Group
```bash
az group create \
  --name photo-sharing-rg \
  --location eastus
```

## Step 2: Database Setup

### 2.1 Create Azure Database for PostgreSQL
```bash
az postgres flexible-server create \
  --resource-group photo-sharing-rg \
  --name photo-sharing-db-server \
  --location eastus \
  --admin-user photoadmin \
  --admin-password 'YourStrongPassword123!' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 15
```

### 2.2 Configure Firewall Rules
```bash
# Allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group photo-sharing-rg \
  --name photo-sharing-db-server \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your IP (for initial setup)
az postgres flexible-server firewall-rule create \
  --resource-group photo-sharing-rg \
  --name photo-sharing-db-server \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

### 2.3 Create Database and Initialize Schema
```bash
# Connect to database
psql "host=photo-sharing-db-server.postgres.database.azure.com port=5432 dbname=postgres user=photoadmin password=YourStrongPassword123! sslmode=require"

# Create database
CREATE DATABASE photo_sharing_db;

# Exit and reconnect to new database
\c photo_sharing_db

# Run the init.sql script
\i database/init.sql
```

## Step 3: Storage Setup

### 3.1 Create Storage Account
```bash
az storage account create \
  --name photosharingstorage \
  --resource-group photo-sharing-rg \
  --location eastus \
  --sku Standard_LRS \
  --kind StorageV2
```

### 3.2 Create Blob Container
```bash
az storage container create \
  --name photos \
  --account-name photosharingstorage \
  --public-access blob
```

### 3.3 Get Storage Connection String
```bash
az storage account show-connection-string \
  --name photosharingstorage \
  --resource-group photo-sharing-rg
```

## Step 4: Backend Deployment (Azure App Service)

### 4.1 Create App Service Plan
```bash
az appservice plan create \
  --name photo-sharing-plan \
  --resource-group photo-sharing-rg \
  --location eastus \
  --is-linux \
  --sku B1
```

### 4.2 Create Web App
```bash
az webapp create \
  --resource-group photo-sharing-rg \
  --plan photo-sharing-plan \
  --name photo-sharing-backend \
  --runtime "NODE:18-lts"
```

### 4.3 Configure Environment Variables
```bash
az webapp config appsettings set \
  --resource-group photo-sharing-rg \
  --name photo-sharing-backend \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DB_HOST=photo-sharing-db-server.postgres.database.azure.com \
    DB_PORT=5432 \
    DB_NAME=photo_sharing_db \
    DB_USER=photoadmin \
    DB_PASSWORD='YourStrongPassword123!' \
    JWT_SECRET='your-production-jwt-secret-change-this' \
    JWT_EXPIRES_IN=24h \
    AZURE_STORAGE_CONNECTION_STRING='your-connection-string' \
    AZURE_STORAGE_CONTAINER_NAME=photos \
    MAX_FILE_SIZE=10485760 \
    ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp
```

### 4.4 Deploy Backend Code

**Option 1: Git Deployment**
```bash
cd backend

# Initialize git (if not already)
git init
git add .
git commit -m "Initial backend commit"

# Get deployment credentials
az webapp deployment source config-local-git \
  --name photo-sharing-backend \
  --resource-group photo-sharing-rg

# Add Azure remote
git remote add azure <deployment-url>

# Push to Azure
git push azure main
```

**Option 2: ZIP Deployment**
```bash
cd backend

# Create production package
npm install --production
zip -r backend.zip .

# Deploy
az webapp deployment source config-zip \
  --resource-group photo-sharing-rg \
  --name photo-sharing-backend \
  --src backend.zip
```

### 4.5 Enable CORS
```bash
az webapp cors add \
  --resource-group photo-sharing-rg \
  --name photo-sharing-backend \
  --allowed-origins '*'
```

## Step 5: Frontend Deployment (Azure Static Web Apps)

### 5.1 Build Frontend
```bash
cd frontend

# Update API URL in .env
echo "REACT_APP_API_URL=https://photo-sharing-backend.azurewebsites.net/api" > .env.production

# Build
npm run build
```

### 5.2 Create Static Web App
```bash
az staticwebapp create \
  --name photo-sharing-frontend \
  --resource-group photo-sharing-rg \
  --location eastus2
```

### 5.3 Deploy Frontend

**Option 1: Using Azure CLI**
```bash
az staticwebapp deploy \
  --name photo-sharing-frontend \
  --resource-group photo-sharing-rg \
  --source ./build
```

**Option 2: Using GitHub Actions** (Recommended)
1. Push code to GitHub
2. Connect Static Web App to GitHub repository
3. Azure will auto-generate GitHub Actions workflow
4. Commits will auto-deploy

## Step 6: CDN Setup (Optional but Recommended)

### 6.1 Create CDN Profile
```bash
az cdn profile create \
  --name photo-sharing-cdn \
  --resource-group photo-sharing-rg \
  --sku Standard_Microsoft
```

### 6.2 Create CDN Endpoint for Blob Storage
```bash
az cdn endpoint create \
  --name photo-sharing-photos \
  --profile-name photo-sharing-cdn \
  --resource-group photo-sharing-rg \
  --origin photosharingstorage.blob.core.windows.net \
  --origin-host-header photosharingstorage.blob.core.windows.net
```

## Step 7: Redis Cache (Optional)

### 7.1 Create Redis Cache
```bash
az redis create \
  --resource-group photo-sharing-rg \
  --name photo-sharing-cache \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

### 7.2 Get Redis Connection String
```bash
az redis show \
  --resource-group photo-sharing-rg \
  --name photo-sharing-cache
```

### 7.3 Update Backend with Redis
Add to backend environment variables:
```bash
REDIS_HOST=photo-sharing-cache.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=your-redis-key
REDIS_TLS=true
```

## Step 8: Monitoring (Application Insights)

### 8.1 Create Application Insights
```bash
az monitor app-insights component create \
  --app photo-sharing-insights \
  --location eastus \
  --resource-group photo-sharing-rg
```

### 8.2 Get Instrumentation Key
```bash
az monitor app-insights component show \
  --app photo-sharing-insights \
  --resource-group photo-sharing-rg \
  --query instrumentationKey
```

### 8.3 Configure Backend
Add to environment variables:
```bash
APPINSIGHTS_INSTRUMENTATIONKEY=your-instrumentation-key
```

## Step 9: Custom Domain and SSL (Optional)

### 9.1 Add Custom Domain to Static Web App
```bash
az staticwebapp hostname set \
  --name photo-sharing-frontend \
  --resource-group photo-sharing-rg \
  --hostname www.yourdomain.com
```

### 9.2 Add Custom Domain to App Service
```bash
az webapp config hostname add \
  --resource-group photo-sharing-rg \
  --webapp-name photo-sharing-backend \
  --hostname api.yourdomain.com
```

### 9.3 Enable SSL
Azure automatically provides free SSL certificates for custom domains.

## Step 10: Scaling Configuration

### 10.1 Configure Auto-scaling for App Service
```bash
az monitor autoscale create \
  --resource-group photo-sharing-rg \
  --resource photo-sharing-backend \
  --resource-type Microsoft.Web/serverparms \
  --name autoscale-backend \
  --min-count 1 \
  --max-count 5 \
  --count 2
```

### 10.2 Add Scaling Rules
```bash
# Scale out when CPU > 70%
az monitor autoscale rule create \
  --resource-group photo-sharing-rg \
  --autoscale-name autoscale-backend \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1

# Scale in when CPU < 30%
az monitor autoscale rule create \
  --resource-group photo-sharing-rg \
  --autoscale-name autoscale-backend \
  --condition "Percentage CPU < 30 avg 5m" \
  --scale in 1
```

## Testing Deployment

### 1. Test Backend API
```bash
curl https://photo-sharing-backend.azurewebsites.net/api/health
```

### 2. Test Frontend
Open browser: `https://photo-sharing-frontend.azurestaticapps.net`

### 3. Test Full Flow
1. Register a new user
2. Upload a photo
3. Browse photos
4. Add comments and ratings

## Cost Optimization

### Free Tier Options
- **App Service**: B1 Basic tier (~$13/month)
- **PostgreSQL**: Burstable B1ms (~$12/month)
- **Storage**: Pay-as-you-go (minimal for testing)
- **Static Web Apps**: Free tier available

### Estimated Monthly Cost
- **Development/Testing**: $25-50/month
- **Production**: $100-300/month (with auto-scaling)

### Cost Saving Tips
1. Use Burstable/Basic tiers for development
2. Stop resources when not in use
3. Use Azure Free Credits for students
4. Enable auto-shutdown for non-production
5. Use reserved instances for production

## Monitoring and Maintenance

### View Logs
```bash
# Backend logs
az webapp log tail \
  --resource-group photo-sharing-rg \
  --name photo-sharing-backend

# Database logs
az postgres flexible-server server-logs list \
  --resource-group photo-sharing-rg \
  --server-name photo-sharing-db-server
```

### Performance Metrics
Access via Azure Portal:
- Application Insights Dashboard
- App Service Metrics
- Database Performance Insights

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
az webapp log show --name photo-sharing-backend --resource-group photo-sharing-rg

# Restart app
az webapp restart --name photo-sharing-backend --resource-group photo-sharing-rg
```

### Database Connection Issues
- Verify firewall rules
- Check connection string
- Ensure SSL mode is enabled

### Storage Access Issues
- Verify container permissions
- Check connection string
- Ensure CORS is configured

## Security Best Practices

1. **Secrets Management**: Use Azure Key Vault
2. **Authentication**: Integrate Azure AD B2C
3. **Network Security**: Configure NSGs
4. **SSL/TLS**: Enable HTTPS only
5. **Database**: Enable SSL, use strong passwords
6. **Monitoring**: Enable threat detection

## Cleanup Resources

To delete all Azure resources:
```bash
az group delete --name photo-sharing-rg --yes --no-wait
```

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [Azure Database for PostgreSQL](https://docs.microsoft.com/azure/postgresql/)
- [Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/)
- [Azure CDN](https://docs.microsoft.com/azure/cdn/)

## Support

For Azure-specific issues:
- Azure Support Portal
- Azure Documentation
- Stack Overflow (tag: azure)
