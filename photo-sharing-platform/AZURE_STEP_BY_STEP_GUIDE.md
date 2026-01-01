# Azure Deployment - Step by Step Guide for Beginners

This guide provides two methods to deploy your Photo Sharing Platform to Azure.

---

## Prerequisites

Before starting, make sure you have:
- Azure account (school-provided or personal)
- Access to a computer with Azure CLI installed

---

## OPTION A: Deploy Directly from GitHub (Easier)

This method connects your GitHub repository directly to Azure. Azure will automatically pull your code.

### Step 1: Install Azure CLI

1. Go to: https://aka.ms/installazurecliwindows
2. Download and install
3. Restart your computer

### Step 2: Open Command Prompt and Login to Azure

```cmd
az login
```

Your browser will open. Sign in with your school email.

After login, you'll see your subscription info. Note your **Subscription ID**.

### Step 3: Create Resource Group

```cmd
az group create --name photo-sharing-rg --location eastus
```

**Expected output:** `"provisioningState": "Succeeded"`

### Step 4: Create PostgreSQL Database

```cmd
az postgres flexible-server create --resource-group photo-sharing-rg --name yourname-photo-db --location eastus --admin-user photoadmin --admin-password "YourPassword123!" --sku-name Standard_B1ms --tier Burstable --storage-size 32 --version 15 --yes
```

**IMPORTANT:** Replace `yourname-photo-db` with a unique name (use your name, e.g., `musaab-photo-db`)

**Expected output:** Server details with `"state": "Ready"`

### Step 5: Allow Azure Services to Access Database

```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name yourname-photo-db --rule-name AllowAzure --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

### Step 6: Create the Database and Tables

```cmd
az postgres flexible-server execute --name yourname-photo-db --admin-user photoadmin --admin-password "YourPassword123!" --database-name postgres --querytext "CREATE DATABASE photo_sharing_db;"
```

Then connect and run the init script. First, find your IP:
```cmd
curl ifconfig.me
```

Add your IP to firewall:
```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name yourname-photo-db --rule-name AllowMyIP --start-ip-address YOUR_IP --end-ip-address YOUR_IP
```

Then connect using psql (or Azure Portal Query Editor):
```cmd
psql "host=yourname-photo-db.postgres.database.azure.com port=5432 dbname=photo_sharing_db user=photoadmin password=YourPassword123! sslmode=require"
```

Once connected, copy and paste the contents of `database/init.sql` file.

### Step 7: Create Storage Account

```cmd
az storage account create --name yourstorageaccount --resource-group photo-sharing-rg --location eastus --sku Standard_LRS
```

**IMPORTANT:** Storage name must be lowercase, no dashes, 3-24 characters (e.g., `musaabphotostorage`)

### Step 8: Create Storage Container

```cmd
az storage container create --name photos --account-name yourstorageaccount --public-access blob
```

### Step 9: Get Storage Connection String

```cmd
az storage account show-connection-string --name yourstorageaccount --resource-group photo-sharing-rg --query connectionString -o tsv
```

**SAVE THIS OUTPUT** - you'll need it for Step 12.

### Step 10: Create App Service Plan

```cmd
az appservice plan create --name photo-sharing-plan --resource-group photo-sharing-rg --location eastus --is-linux --sku B1
```

### Step 11: Create Web App for Backend

```cmd
az webapp create --resource-group photo-sharing-rg --plan photo-sharing-plan --name yourname-photo-backend --runtime "NODE:18-lts"
```

**IMPORTANT:** Replace `yourname-photo-backend` with a unique name (e.g., `musaab-photo-backend`)

### Step 12: Configure Backend Environment Variables

```cmd
az webapp config appsettings set --resource-group photo-sharing-rg --name yourname-photo-backend --settings NODE_ENV=production PORT=8080 DB_HOST=yourname-photo-db.postgres.database.azure.com DB_PORT=5432 DB_NAME=photo_sharing_db DB_USER=photoadmin DB_PASSWORD="YourPassword123!" DB_SSL=true JWT_SECRET="your-super-secret-key-change-this-to-something-random" JWT_EXPIRES_IN=24h AZURE_STORAGE_CONNECTION_STRING="your-connection-string-from-step-9" AZURE_STORAGE_CONTAINER_NAME=photos MAX_FILE_SIZE=10485760 ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp
```

**IMPORTANT:** Replace:
- `yourname-photo-backend` with your backend name from Step 11
- `yourname-photo-db` with your database name from Step 4
- `your-connection-string-from-step-9` with the actual connection string

### Step 13: Deploy Backend from GitHub

```cmd
az webapp deployment source config --name yourname-photo-backend --resource-group photo-sharing-rg --repo-url https://github.com/WilfordGeorge/Com-769 --branch claude/setup-local-testing-84TB3 --manual-integration
```

Set the deployment to use the backend folder:
```cmd
az webapp config appsettings set --resource-group photo-sharing-rg --name yourname-photo-backend --settings PROJECT="photo-sharing-platform/backend"
```

### Step 14: Create Static Web App for Frontend

1. Go to Azure Portal: https://portal.azure.com
2. Search for "Static Web Apps"
3. Click "+ Create"
4. Fill in:
   - **Subscription:** Your school subscription
   - **Resource Group:** photo-sharing-rg
   - **Name:** yourname-photo-frontend
   - **Plan type:** Free
   - **Region:** East US 2
   - **Source:** GitHub
5. Sign in to GitHub and authorize
6. Select:
   - **Organization:** WilfordGeorge
   - **Repository:** Com-769
   - **Branch:** claude/setup-local-testing-84TB3
7. Build Details:
   - **Build Presets:** React
   - **App location:** /photo-sharing-platform/frontend
   - **Output location:** build
8. Click "Review + create" then "Create"

### Step 15: Configure Frontend API URL

After the Static Web App is created:

1. Go to your Static Web App in Azure Portal
2. Click "Configuration" in the left menu
3. Add Application Setting:
   - **Name:** REACT_APP_API_URL
   - **Value:** https://yourname-photo-backend.azurewebsites.net/api
4. Click "Save"

### Step 16: Test Your Deployment

- **Frontend:** https://yourname-photo-frontend.azurestaticapps.net
- **Backend API:** https://yourname-photo-backend.azurewebsites.net/api

---

## OPTION B: Clone to Azure-Enabled PC and Deploy

If you prefer to deploy from your local machine (the PC with Azure access).

### Step 1: Install Required Software

On your Azure-enabled PC, install:

1. **Git:** https://git-scm.com/download/win
2. **Node.js:** https://nodejs.org (LTS version)
3. **Azure CLI:** https://aka.ms/installazurecliwindows
4. **PostgreSQL:** https://www.postgresql.org/download/windows/

### Step 2: Clone the Repository

Open Command Prompt:

```cmd
cd C:\Users\YourUsername\Desktop

git clone https://github.com/WilfordGeorge/Com-769.git

cd Com-769\photo-sharing-platform
```

### Step 3: Login to Azure

```cmd
az login
```

Sign in with your school account.

### Step 4: Create All Azure Resources

Run these commands one by one:

```cmd
az group create --name photo-sharing-rg --location eastus
```

```cmd
az postgres flexible-server create --resource-group photo-sharing-rg --name yourname-photo-db --location eastus --admin-user photoadmin --admin-password "YourPassword123!" --sku-name Standard_B1ms --tier Burstable --storage-size 32 --version 15 --yes
```

```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name yourname-photo-db --rule-name AllowAzure --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

```cmd
az storage account create --name yourstorageaccount --resource-group photo-sharing-rg --location eastus --sku Standard_LRS
```

```cmd
az storage container create --name photos --account-name yourstorageaccount --public-access blob
```

```cmd
az appservice plan create --name photo-sharing-plan --resource-group photo-sharing-rg --location eastus --is-linux --sku B1
```

```cmd
az webapp create --resource-group photo-sharing-rg --plan photo-sharing-plan --name yourname-photo-backend --runtime "NODE:18-lts"
```

### Step 5: Initialize the Database

Get your IP address:
```cmd
curl ifconfig.me
```

Add your IP to firewall:
```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name yourname-photo-db --rule-name AllowMyIP --start-ip-address YOUR_IP_HERE --end-ip-address YOUR_IP_HERE
```

Connect and create database:
```cmd
"C:\Program Files\PostgreSQL\17\bin\psql" "host=yourname-photo-db.postgres.database.azure.com port=5432 dbname=postgres user=photoadmin password=YourPassword123! sslmode=require"
```

Once connected:
```sql
CREATE DATABASE photo_sharing_db;
\q
```

Load the schema:
```cmd
"C:\Program Files\PostgreSQL\17\bin\psql" "host=yourname-photo-db.postgres.database.azure.com port=5432 dbname=photo_sharing_db user=photoadmin password=YourPassword123! sslmode=require" -f database\init.sql
```

### Step 6: Get Storage Connection String

```cmd
az storage account show-connection-string --name yourstorageaccount --resource-group photo-sharing-rg --query connectionString -o tsv
```

Save this output!

### Step 7: Configure Backend Environment

```cmd
az webapp config appsettings set --resource-group photo-sharing-rg --name yourname-photo-backend --settings NODE_ENV=production PORT=8080 DB_HOST=yourname-photo-db.postgres.database.azure.com DB_PORT=5432 DB_NAME=photo_sharing_db DB_USER=photoadmin DB_PASSWORD="YourPassword123!" DB_SSL=true JWT_SECRET="your-super-secret-key-change-this" JWT_EXPIRES_IN=24h AZURE_STORAGE_CONNECTION_STRING="paste-your-connection-string-here" AZURE_STORAGE_CONTAINER_NAME=photos MAX_FILE_SIZE=10485760 ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp
```

### Step 8: Deploy Backend via ZIP

```cmd
cd backend

npm install --production

powershell Compress-Archive -Path * -DestinationPath backend.zip -Force

az webapp deployment source config-zip --resource-group photo-sharing-rg --name yourname-photo-backend --src backend.zip
```

### Step 9: Enable CORS on Backend

```cmd
az webapp cors add --resource-group photo-sharing-rg --name yourname-photo-backend --allowed-origins "*"
```

### Step 10: Build and Deploy Frontend

```cmd
cd ..\frontend

echo REACT_APP_API_URL=https://yourname-photo-backend.azurewebsites.net/api > .env.production

npm install

npm run build
```

### Step 11: Create Static Web App and Deploy

```cmd
az staticwebapp create --name yourname-photo-frontend --resource-group photo-sharing-rg --location eastus2

az staticwebapp deploy --name yourname-photo-frontend --resource-group photo-sharing-rg --source build --env production
```

### Step 12: Test Your Deployment

- **Frontend:** https://yourname-photo-frontend.azurestaticapps.net
- **Backend API:** https://yourname-photo-backend.azurewebsites.net/api

---

## Demo Accounts

After running the `init.sql` script, you'll have these demo accounts:

| Type | Email | Password |
|------|-------|----------|
| Creator | creator1@example.com | password123 |
| Creator | creator2@example.com | password123 |
| Consumer | consumer1@example.com | password123 |
| Consumer | consumer2@example.com | password123 |

---

## Estimated Monthly Cost

| Service | Cost |
|---------|------|
| PostgreSQL (Burstable B1ms) | ~$12/month |
| App Service (B1) | ~$13/month |
| Storage | ~$1/month |
| Static Web Apps | FREE |
| **Total** | **~$26/month** |

School accounts often have free credits that cover this!

---

## Troubleshooting

### "Resource name already exists"
- Add your name or random numbers to make names unique
- Example: `musaab-photo-backend-123`

### "Permission denied"
- Make sure you're logged in: `az login`
- Check your subscription: `az account show`

### Backend not working
```cmd
az webapp log tail --name yourname-photo-backend --resource-group photo-sharing-rg
```

### Database connection failed
- Check firewall rules include your IP
- Verify password is correct
- Ensure SSL mode is enabled

---

## Cleanup (Delete Everything)

To remove all Azure resources and stop charges:

```cmd
az group delete --name photo-sharing-rg --yes --no-wait
```

---

## Need Help?

- Azure Documentation: https://docs.microsoft.com/azure
- GitHub Repository: https://github.com/WilfordGeorge/Com-769
