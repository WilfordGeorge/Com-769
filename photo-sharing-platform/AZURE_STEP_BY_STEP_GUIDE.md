# Azure Deployment - Complete Step by Step Guide for Beginners

This guide assumes you have a **brand new Windows PC** with nothing installed. Follow every step in order.

---

# PART 1: INSTALL REQUIRED SOFTWARE

## Step 1.1: Install Git

1. Open your web browser
2. Go to: **https://git-scm.com/download/win**
3. Click **"Click here to download"** (64-bit version)
4. Run the downloaded file
5. Click **Next** on every screen (keep all defaults)
6. Click **Install**
7. Click **Finish**

### Verify Git Installation:
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Type this command and press Enter:
```cmd
git --version
```
4. You should see: `git version 2.x.x`

---

## Step 1.2: Install Node.js

1. Go to: **https://nodejs.org**
2. Click the **LTS** version (green button on the left)
3. Run the downloaded file
4. Click **Next** on every screen
5. Check the box for **"Automatically install necessary tools"** if asked
6. Click **Install**
7. Click **Finish**

### Verify Node.js Installation:
Open a **NEW** Command Prompt and run:
```cmd
node --version
```
You should see: `v20.x.x` or `v22.x.x`

```cmd
npm --version
```
You should see: `10.x.x`

---

## Step 1.3: Install PostgreSQL

1. Go to: **https://www.postgresql.org/download/windows/**
2. Click **"Download the installer"**
3. Download the latest version (PostgreSQL 16 or 17)
4. Run the downloaded file
5. Click **Next**
6. Keep the default installation folder, click **Next**
7. Select all components, click **Next**
8. Keep the default data directory, click **Next**
9. **IMPORTANT:** Set password to: `postgres` (remember this!)
10. Keep port as `5432`, click **Next**
11. Keep default locale, click **Next**
12. Click **Next**, then **Install**
13. Uncheck "Launch Stack Builder", click **Finish**

### Add PostgreSQL to System PATH:
1. Press `Windows Key + R`
2. Type `sysdm.cpl` and press Enter
3. Click **Advanced** tab
4. Click **Environment Variables**
5. Under "System variables", find **Path** and click **Edit**
6. Click **New**
7. Add: `C:\Program Files\PostgreSQL\17\bin` (or `16` if you installed version 16)
8. Click **OK** on all windows

### Verify PostgreSQL Installation:
Open a **NEW** Command Prompt and run:
```cmd
psql --version
```
You should see: `psql (PostgreSQL) 17.x` or `16.x`

---

## Step 1.4: Install Azure CLI

1. Go to: **https://aka.ms/installazurecliwindows**
2. The download will start automatically
3. Run the downloaded file (azure-cli-x.x.x.msi)
4. Check **"I accept the terms"**
5. Click **Install**
6. Click **Finish**

### Verify Azure CLI Installation:
Open a **NEW** Command Prompt and run:
```cmd
az --version
```
You should see: `azure-cli 2.x.x`

---

## Step 1.5: Install Visual Studio Code (Optional but Helpful)

1. Go to: **https://code.visualstudio.com/**
2. Click **"Download for Windows"**
3. Run the downloaded file
4. Click **Next** on every screen
5. Check **"Add to PATH"** option
6. Click **Install**
7. Click **Finish**

---

# PART 2: CLONE THE PROJECT

## Step 2.1: Create a Folder for Your Project

Open Command Prompt and run:
```cmd
cd C:\Users\%USERNAME%\Desktop

mkdir Projects

cd Projects
```

## Step 2.2: Clone the Repository

```cmd
git clone https://github.com/WilfordGeorge/Com-769.git
```

Wait for download to complete. You should see: `Cloning into 'Com-769'...`

## Step 2.3: Navigate to the Project

```cmd
cd Com-769\photo-sharing-platform
```

---

# PART 3: TEST LOCALLY FIRST (Optional but Recommended)

Before deploying to Azure, test on your PC to make sure everything works.

## Step 3.1: Start PostgreSQL Service

1. Press `Windows Key + R`
2. Type `services.msc` and press Enter
3. Find **"postgresql-x64-17"** (or 16)
4. Right-click and select **Start** (if not already running)

## Step 3.2: Create Local Database

Open Command Prompt and run:
```cmd
psql -U postgres -c "CREATE DATABASE photo_sharing_db;"
```
Enter password: `postgres`

Then run:
```cmd
psql -U postgres -d photo_sharing_db -f database\init.sql
```
Enter password: `postgres`

## Step 3.3: Setup Backend

```cmd
cd backend

copy .env.example .env

npm install
```

## Step 3.4: Setup Frontend

Open a **SECOND** Command Prompt window:
```cmd
cd C:\Users\%USERNAME%\Desktop\Projects\Com-769\photo-sharing-platform\frontend

npm install
```

## Step 3.5: Start the Application

**In the BACKEND Command Prompt:**
```cmd
npm run dev
```

**In the FRONTEND Command Prompt:**
```cmd
npm start
```

## Step 3.6: Test in Browser

Open your browser and go to: **http://localhost:3000**

Login with:
- **Email:** creator1@example.com
- **Password:** password123

If it works, you're ready for Azure deployment!

---

# PART 4: DEPLOY TO AZURE

## Step 4.1: Login to Azure

Open a **NEW** Command Prompt:
```cmd
az login
```

Your browser will open. Sign in with your **school email**.

After login, you'll see your subscription information in the Command Prompt.

**Write down your Subscription ID** (looks like: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

---

## Step 4.2: Set Your Subscription (If you have multiple)

```cmd
az account set --subscription "Your-Subscription-Name-or-ID"
```

---

## Step 4.3: Create Resource Group

```cmd
az group create --name photo-sharing-rg --location eastus
```

**Expected output:** `"provisioningState": "Succeeded"`

---

## Step 4.4: Create PostgreSQL Database Server

**IMPORTANT:** Replace `YOURNAME` with your actual name (lowercase, no spaces)

```cmd
az postgres flexible-server create --resource-group photo-sharing-rg --name YOURNAME-photo-db --location eastus --admin-user photoadmin --admin-password "SecurePass123!" --sku-name Standard_B1ms --tier Burstable --storage-size 32 --version 15 --yes
```

Example: If your name is Musaab, use `musaab-photo-db`

**This takes 5-10 minutes.** Wait for it to complete.

**Expected output:** Server details with `"state": "Ready"`

---

## Step 4.5: Configure Database Firewall

Allow Azure services:
```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name YOURNAME-photo-db --rule-name AllowAzure --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

Get your IP address (go to https://whatismyipaddress.com/ or run):
```cmd
curl ifconfig.me
```

Add your IP (replace YOUR_IP with the IP you got):
```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name YOURNAME-photo-db --rule-name AllowMyIP --start-ip-address YOUR_IP --end-ip-address YOUR_IP
```

---

## Step 4.6: Create the Database

```cmd
psql "host=YOURNAME-photo-db.postgres.database.azure.com port=5432 dbname=postgres user=photoadmin password=SecurePass123! sslmode=require"
```

Once connected (you'll see `postgres=>`), type:
```sql
CREATE DATABASE photo_sharing_db;
\q
```

---

## Step 4.7: Initialize Database Tables

```cmd
psql "host=YOURNAME-photo-db.postgres.database.azure.com port=5432 dbname=photo_sharing_db user=photoadmin password=SecurePass123! sslmode=require" -f database\init.sql
```

You should see multiple `CREATE TABLE`, `CREATE INDEX`, `INSERT 0 4` messages.

---

## Step 4.8: Create Storage Account

**IMPORTANT:** Storage name must be lowercase, no dashes, 3-24 characters

```cmd
az storage account create --name YOURNAMEphotostorage --resource-group photo-sharing-rg --location eastus --sku Standard_LRS
```

Example: `musaabphotostorage`

---

## Step 4.9: Create Storage Container

```cmd
az storage container create --name photos --account-name YOURNAMEphotostorage --public-access blob
```

---

## Step 4.10: Get Storage Connection String

```cmd
az storage account show-connection-string --name YOURNAMEphotostorage --resource-group photo-sharing-rg --query connectionString -o tsv
```

**COPY AND SAVE THIS OUTPUT!** You'll need it in Step 4.14.

It looks like: `DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net`

---

## Step 4.11: Create App Service Plan

```cmd
az appservice plan create --name photo-sharing-plan --resource-group photo-sharing-rg --location eastus --is-linux --sku B1
```

---

## Step 4.12: Create Backend Web App

```cmd
az webapp create --resource-group photo-sharing-rg --plan photo-sharing-plan --name YOURNAME-photo-backend --runtime "NODE:18-lts"
```

Example: `musaab-photo-backend`

---

## Step 4.13: Enable CORS on Backend

```cmd
az webapp cors add --resource-group photo-sharing-rg --name YOURNAME-photo-backend --allowed-origins "*"
```

---

## Step 4.14: Configure Backend Environment Variables

**IMPORTANT:** Replace ALL placeholders with your actual values:
- `YOURNAME-photo-backend` → your backend name from Step 4.12
- `YOURNAME-photo-db` → your database name from Step 4.4
- `YOUR_CONNECTION_STRING` → the connection string from Step 4.10

```cmd
az webapp config appsettings set --resource-group photo-sharing-rg --name YOURNAME-photo-backend --settings NODE_ENV=production PORT=8080 DB_HOST=YOURNAME-photo-db.postgres.database.azure.com DB_PORT=5432 DB_NAME=photo_sharing_db DB_USER=photoadmin DB_PASSWORD="SecurePass123!" DB_SSL=true JWT_SECRET="change-this-to-a-random-string-at-least-32-characters" JWT_EXPIRES_IN=24h AZURE_STORAGE_CONNECTION_STRING="YOUR_CONNECTION_STRING" AZURE_STORAGE_CONTAINER_NAME=photos MAX_FILE_SIZE=10485760 ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp
```

---

## Step 4.15: Deploy Backend Code

Navigate to backend folder:
```cmd
cd C:\Users\%USERNAME%\Desktop\Projects\Com-769\photo-sharing-platform\backend
```

Install production dependencies:
```cmd
npm install --production
```

Create ZIP file:
```cmd
powershell Compress-Archive -Path * -DestinationPath backend.zip -Force
```

Deploy to Azure:
```cmd
az webapp deployment source config-zip --resource-group photo-sharing-rg --name YOURNAME-photo-backend --src backend.zip
```

**This takes 2-5 minutes.**

---

## Step 4.16: Test Backend

Open your browser and go to:
```
https://YOURNAME-photo-backend.azurewebsites.net/
```

You should see: `{"message":"Photo Sharing Platform API","version":"1.0.0"...}`

---

## Step 4.17: Build Frontend for Production

Navigate to frontend folder:
```cmd
cd C:\Users\%USERNAME%\Desktop\Projects\Com-769\photo-sharing-platform\frontend
```

Create production environment file:
```cmd
echo REACT_APP_API_URL=https://YOURNAME-photo-backend.azurewebsites.net/api > .env.production
```

Install dependencies (if not already done):
```cmd
npm install
```

Build for production:
```cmd
npm run build
```

**This takes 2-5 minutes.** A `build` folder will be created.

---

## Step 4.18: Create Static Web App for Frontend

```cmd
az staticwebapp create --name YOURNAME-photo-frontend --resource-group photo-sharing-rg --location eastus2
```

---

## Step 4.19: Get Deployment Token

```cmd
az staticwebapp secrets list --name YOURNAME-photo-frontend --resource-group photo-sharing-rg --query "properties.apiKey" -o tsv
```

**COPY THIS TOKEN!** You'll need it for the next step.

---

## Step 4.20: Deploy Frontend

Install the Static Web Apps CLI:
```cmd
npm install -g @azure/static-web-apps-cli
```

Deploy:
```cmd
cd build

swa deploy . --deployment-token YOUR_DEPLOYMENT_TOKEN --env production
```

Replace `YOUR_DEPLOYMENT_TOKEN` with the token from Step 4.19.

---

## Step 4.21: Get Your Frontend URL

```cmd
az staticwebapp show --name YOURNAME-photo-frontend --resource-group photo-sharing-rg --query "defaultHostname" -o tsv
```

---

# PART 5: TEST YOUR LIVE APPLICATION

## Your URLs:

- **Frontend:** `https://YOURNAME-photo-frontend.azurestaticapps.net`
- **Backend API:** `https://YOURNAME-photo-backend.azurewebsites.net/api`

## Test Login:

1. Open your frontend URL in a browser
2. Click **Login**
3. Use demo credentials:
   - **Email:** creator1@example.com
   - **Password:** password123

## Test Features:

- Upload a photo (as creator)
- Browse photos (as consumer)
- Rate and comment on photos

---

# PART 6: TROUBLESHOOTING

## Problem: "az" is not recognized
**Solution:** Close Command Prompt, open a new one, and try again. If still not working, reinstall Azure CLI.

## Problem: "psql" is not recognized
**Solution:** Add PostgreSQL to PATH (see Step 1.3) and restart Command Prompt.

## Problem: Cannot connect to Azure database
**Solution:**
1. Check your IP address hasn't changed
2. Add new IP to firewall (Step 4.5)
3. Verify password is correct

## Problem: Backend returns errors
**Solution:** Check logs:
```cmd
az webapp log tail --name YOURNAME-photo-backend --resource-group photo-sharing-rg
```

## Problem: Frontend can't connect to backend
**Solution:**
1. Verify REACT_APP_API_URL is correct in .env.production
2. Rebuild frontend: `npm run build`
3. Redeploy frontend

## Problem: "Invalid credentials" when logging in
**Solution:** The password hashes need to be updated. Connect to your Azure database and run:
```sql
UPDATE users SET password_hash = '$2a$10$lsXOVtBTtfpSI0HkgNm/8.8g6KsxSkyFDm4yylVsMvs8/7XlolRYK' WHERE email LIKE '%@example.com';
```

---

# PART 7: COST AND CLEANUP

## Estimated Monthly Cost:

| Service | Cost |
|---------|------|
| PostgreSQL (Burstable B1ms) | ~$12/month |
| App Service (B1) | ~$13/month |
| Storage | ~$1/month |
| Static Web Apps | FREE |
| **Total** | **~$26/month** |

**Note:** School accounts often have free credits!

## To Delete Everything (Stop All Charges):

```cmd
az group delete --name photo-sharing-rg --yes --no-wait
```

This deletes ALL resources in the group.

---

# QUICK REFERENCE: Replace These Values

Throughout this guide, replace these placeholders:

| Placeholder | Example | Your Value |
|-------------|---------|------------|
| `YOURNAME-photo-db` | musaab-photo-db | _____________ |
| `YOURNAME-photo-backend` | musaab-photo-backend | _____________ |
| `YOURNAMEphotostorage` | musaabphotostorage | _____________ |
| `YOURNAME-photo-frontend` | musaab-photo-frontend | _____________ |
| `YOUR_IP` | 192.168.1.1 | _____________ |
| `YOUR_CONNECTION_STRING` | DefaultEndpoints... | _____________ |
| `YOUR_DEPLOYMENT_TOKEN` | abc123... | _____________ |

---

# SUCCESS CHECKLIST

- [ ] Git installed
- [ ] Node.js installed
- [ ] PostgreSQL installed
- [ ] Azure CLI installed
- [ ] Repository cloned
- [ ] Logged into Azure
- [ ] Resource group created
- [ ] Database server created
- [ ] Database initialized
- [ ] Storage account created
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Application tested and working!

---

**Congratulations! Your Photo Sharing Platform is now live on Azure!**
