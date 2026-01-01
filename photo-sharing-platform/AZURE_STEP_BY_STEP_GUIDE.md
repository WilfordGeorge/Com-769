# Azure Deployment - Complete Step by Step Guide for Beginners

This guide assumes you have a **brand new Windows PC** with nothing installed. Follow every step in order.

**Choose your deployment method:**
- **OPTION A:** Deploy directly from GitHub (Easier - fewer steps)
- **OPTION B:** Clone to your PC first, then deploy (More control)

---

# PART 1: INSTALL REQUIRED SOFTWARE

## Step 1.1: Install Azure CLI (Required for both options)

1. Go to: **https://aka.ms/installazurecliwindows**
2. The download will start automatically
3. Run the downloaded file (azure-cli-x.x.x.msi)
4. Check **"I accept the terms"**
5. Click **Install**
6. Click **Finish**

### Verify Azure CLI Installation:
Open Command Prompt (Press `Windows Key + R`, type `cmd`, press Enter):
```cmd
az --version
```
You should see: `azure-cli 2.x.x`

---

## Step 1.2: Install Git (Required for Option B only)

1. Go to: **https://git-scm.com/download/win**
2. Click **"Click here to download"** (64-bit version)
3. Run the downloaded file
4. Click **Next** on every screen (keep all defaults)
5. Click **Install**
6. Click **Finish**

### Verify Git Installation:
Open a **NEW** Command Prompt:
```cmd
git --version
```
You should see: `git version 2.x.x`

---

## Step 1.3: Install Node.js (Required for Option B only)

1. Go to: **https://nodejs.org**
2. Click the **LTS** version (green button on the left)
3. Run the downloaded file
4. Click **Next** on every screen
5. Check the box for **"Automatically install necessary tools"** if asked
6. Click **Install**
7. Click **Finish**

### Verify Node.js Installation:
Open a **NEW** Command Prompt:
```cmd
node --version
```
You should see: `v20.x.x` or `v22.x.x`

```cmd
npm --version
```
You should see: `10.x.x`

---

## Step 1.4: Install PostgreSQL (Required for Option B local testing only)

**Skip this step if using Option A or not testing locally.**

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
Open a **NEW** Command Prompt:
```cmd
psql --version
```
You should see: `psql (PostgreSQL) 17.x` or `16.x`

---

# ═══════════════════════════════════════════════════════════════════
# OPTION A: DEPLOY DIRECTLY FROM GITHUB (Easier)
# ═══════════════════════════════════════════════════════════════════

This method connects Azure directly to your GitHub repository. Azure will pull the code automatically.

**Requirements:** Only Azure CLI (Step 1.1)

---

## A.1: Login to Azure

Open Command Prompt:
```cmd
az login
```

Your browser will open. Sign in with your **school email**.

After login, you'll see your subscription information.

---

## A.2: Create Resource Group

```cmd
az group create --name photo-sharing-rg --location eastus
```

**Expected output:** `"provisioningState": "Succeeded"`

---

## A.3: Create PostgreSQL Database Server

**IMPORTANT:** Replace `YOURNAME` with your actual name (lowercase, no spaces)

```cmd
az postgres flexible-server create --resource-group photo-sharing-rg --name YOURNAME-photo-db --location eastus --admin-user photoadmin --admin-password "SecurePass123!" --sku-name Standard_B1ms --tier Burstable --storage-size 32 --version 15 --yes
```

Example: If your name is Musaab, use `musaab-photo-db`

**This takes 5-10 minutes.** Wait for it to complete.

---

## A.4: Configure Database Firewall

Allow Azure services:
```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name YOURNAME-photo-db --rule-name AllowAzure --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

Allow all IPs temporarily (for setup):
```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name YOURNAME-photo-db --rule-name AllowAll --start-ip-address 0.0.0.0 --end-ip-address 255.255.255.255
```

---

## A.5: Initialize Database Using Azure Portal

1. Go to **https://portal.azure.com**
2. Search for **"YOURNAME-photo-db"** in the search bar
3. Click on your PostgreSQL server
4. In the left menu, click **"Databases"**
5. Click **"+ Add"**
6. Name: `photo_sharing_db`
7. Click **"Save"**

Now we need to run the init.sql script. You have two options:

### Option A.5.1: Use Azure Cloud Shell (Easiest)

1. In Azure Portal, click the **Cloud Shell** icon (top right, looks like `>_`)
2. Select **Bash**
3. Run these commands:

```bash
# Download the init.sql file
curl -O https://raw.githubusercontent.com/WilfordGeorge/Com-769/claude/setup-local-testing-84TB3/photo-sharing-platform/database/init.sql

# Connect to your database and run the script
psql "host=YOURNAME-photo-db.postgres.database.azure.com port=5432 dbname=photo_sharing_db user=photoadmin password=SecurePass123! sslmode=require" -f init.sql
```

### Option A.5.2: Use Azure Portal Query Editor

1. In your PostgreSQL server page, click **"Query editor (preview)"** in left menu
2. Login with:
   - Username: `photoadmin`
   - Password: `SecurePass123!`
3. Copy the contents from: https://github.com/WilfordGeorge/Com-769/blob/claude/setup-local-testing-84TB3/photo-sharing-platform/database/init.sql
4. Paste into the query editor
5. Click **"Run"**

---

## A.6: Create Storage Account

**IMPORTANT:** Storage name must be lowercase, no dashes, 3-24 characters

```cmd
az storage account create --name YOURNAMEphotostorage --resource-group photo-sharing-rg --location eastus --sku Standard_LRS
```

Example: `musaabphotostorage`

---

## A.7: Create Storage Container

```cmd
az storage container create --name photos --account-name YOURNAMEphotostorage --public-access blob
```

---

## A.8: Get Storage Connection String

```cmd
az storage account show-connection-string --name YOURNAMEphotostorage --resource-group photo-sharing-rg --query connectionString -o tsv
```

**COPY AND SAVE THIS OUTPUT!** You'll need it soon.

---

## A.9: Create App Service Plan

```cmd
az appservice plan create --name photo-sharing-plan --resource-group photo-sharing-rg --location eastus --is-linux --sku B1
```

---

## A.10: Create Backend Web App

```cmd
az webapp create --resource-group photo-sharing-rg --plan photo-sharing-plan --name YOURNAME-photo-backend --runtime "NODE:18-lts"
```

---

## A.11: Configure Backend Environment Variables

**IMPORTANT:** Replace ALL placeholders:
- `YOURNAME-photo-backend` → your backend name
- `YOURNAME-photo-db` → your database name
- `YOUR_CONNECTION_STRING` → connection string from A.8

```cmd
az webapp config appsettings set --resource-group photo-sharing-rg --name YOURNAME-photo-backend --settings NODE_ENV=production PORT=8080 DB_HOST=YOURNAME-photo-db.postgres.database.azure.com DB_PORT=5432 DB_NAME=photo_sharing_db DB_USER=photoadmin DB_PASSWORD="SecurePass123!" DB_SSL=true JWT_SECRET="change-this-to-a-random-string-at-least-32-characters" JWT_EXPIRES_IN=24h AZURE_STORAGE_CONNECTION_STRING="YOUR_CONNECTION_STRING" AZURE_STORAGE_CONTAINER_NAME=photos MAX_FILE_SIZE=10485760 ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp
```

---

## A.12: Enable CORS on Backend

```cmd
az webapp cors add --resource-group photo-sharing-rg --name YOURNAME-photo-backend --allowed-origins "*"
```

---

## A.13: Deploy Backend from GitHub

```cmd
az webapp deployment source config --name YOURNAME-photo-backend --resource-group photo-sharing-rg --repo-url https://github.com/WilfordGeorge/Com-769 --branch claude/setup-local-testing-84TB3 --manual-integration
```

Configure the startup command to point to the backend folder:
```cmd
az webapp config set --resource-group photo-sharing-rg --name YOURNAME-photo-backend --startup-file "cd photo-sharing-platform/backend && npm install && npm start"
```

---

## A.14: Test Backend

Wait 2-3 minutes, then open your browser:
```
https://YOURNAME-photo-backend.azurewebsites.net/
```

You should see: `{"message":"Photo Sharing Platform API","version":"1.0.0"...}`

---

## A.15: Deploy Frontend via Azure Portal

1. Go to **https://portal.azure.com**
2. Search for **"Static Web Apps"**
3. Click **"+ Create"**
4. Fill in:
   - **Subscription:** Your school subscription
   - **Resource Group:** `photo-sharing-rg`
   - **Name:** `YOURNAME-photo-frontend`
   - **Plan type:** Free
   - **Region:** East US 2
   - **Source:** GitHub
5. Click **"Sign in with GitHub"** and authorize
6. Select:
   - **Organization:** WilfordGeorge (or your fork)
   - **Repository:** Com-769
   - **Branch:** claude/setup-local-testing-84TB3
7. **Build Details:**
   - **Build Presets:** React
   - **App location:** `/photo-sharing-platform/frontend`
   - **Api location:** (leave empty)
   - **Output location:** `build`
8. Click **"Review + create"**
9. Click **"Create"**

**This takes 3-5 minutes** to deploy.

---

## A.16: Configure Frontend Environment Variable

1. Go to your Static Web App in Azure Portal
2. Click **"Environment variables"** in left menu
3. Click **"+ Add"**
4. Add:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://YOURNAME-photo-backend.azurewebsites.net/api`
5. Click **"Save"**

---

## A.17: Get Your Frontend URL

1. Go to your Static Web App in Azure Portal
2. The URL is shown on the **Overview** page
3. It looks like: `https://xxxx-xxxx-xxxx.azurestaticapps.net`

---

## A.18: Test Your Application

1. Open your frontend URL
2. Click **Login**
3. Use demo credentials:
   - **Email:** creator1@example.com
   - **Password:** password123

**Skip to PART 5 to continue testing!**

---

# ═══════════════════════════════════════════════════════════════════
# OPTION B: CLONE TO PC AND DEPLOY (More Control)
# ═══════════════════════════════════════════════════════════════════

This method clones the code to your PC first, then deploys. Gives you more control and allows local testing.

**Requirements:** Azure CLI, Git, Node.js (Steps 1.1-1.3)

---

## B.1: Create Project Folder

Open Command Prompt:
```cmd
cd C:\Users\%USERNAME%\Desktop

mkdir Projects

cd Projects
```

---

## B.2: Clone the Repository

```cmd
git clone https://github.com/WilfordGeorge/Com-769.git
```

Wait for download to complete.

```cmd
cd Com-769\photo-sharing-platform
```

---

## B.3: Test Locally First (Optional but Recommended)

### Start PostgreSQL Service:
1. Press `Windows Key + R`
2. Type `services.msc` and press Enter
3. Find **"postgresql-x64-17"** (or 16)
4. Right-click and select **Start**

### Create Local Database:
```cmd
psql -U postgres -c "CREATE DATABASE photo_sharing_db;"
```
Enter password: `postgres`

```cmd
psql -U postgres -d photo_sharing_db -f database\init.sql
```
Enter password: `postgres`

### Setup Backend:
```cmd
cd backend
copy .env.example .env
npm install
```

### Setup Frontend (in a NEW Command Prompt):
```cmd
cd C:\Users\%USERNAME%\Desktop\Projects\Com-769\photo-sharing-platform\frontend
npm install
```

### Start the Application:

**Backend Command Prompt:**
```cmd
npm run dev
```

**Frontend Command Prompt:**
```cmd
npm start
```

### Test:
Open browser: **http://localhost:3000**

Login with:
- Email: creator1@example.com
- Password: password123

---

## B.4: Login to Azure

Open a **NEW** Command Prompt:
```cmd
az login
```

Sign in with your **school email**.

---

## B.5: Create Resource Group

```cmd
az group create --name photo-sharing-rg --location eastus
```

---

## B.6: Create PostgreSQL Database Server

```cmd
az postgres flexible-server create --resource-group photo-sharing-rg --name YOURNAME-photo-db --location eastus --admin-user photoadmin --admin-password "SecurePass123!" --sku-name Standard_B1ms --tier Burstable --storage-size 32 --version 15 --yes
```

**This takes 5-10 minutes.**

---

## B.7: Configure Database Firewall

```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name YOURNAME-photo-db --rule-name AllowAzure --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

Get your IP:
```cmd
curl ifconfig.me
```

Add your IP:
```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name YOURNAME-photo-db --rule-name AllowMyIP --start-ip-address YOUR_IP --end-ip-address YOUR_IP
```

---

## B.8: Create and Initialize Database

Connect to create database:
```cmd
psql "host=YOURNAME-photo-db.postgres.database.azure.com port=5432 dbname=postgres user=photoadmin password=SecurePass123! sslmode=require"
```

Once connected:
```sql
CREATE DATABASE photo_sharing_db;
\q
```

Initialize tables:
```cmd
psql "host=YOURNAME-photo-db.postgres.database.azure.com port=5432 dbname=photo_sharing_db user=photoadmin password=SecurePass123! sslmode=require" -f database\init.sql
```

---

## B.9: Create Storage Account

```cmd
az storage account create --name YOURNAMEphotostorage --resource-group photo-sharing-rg --location eastus --sku Standard_LRS
```

---

## B.10: Create Storage Container

```cmd
az storage container create --name photos --account-name YOURNAMEphotostorage --public-access blob
```

---

## B.11: Get Storage Connection String

```cmd
az storage account show-connection-string --name YOURNAMEphotostorage --resource-group photo-sharing-rg --query connectionString -o tsv
```

**SAVE THIS OUTPUT!**

---

## B.12: Create App Service Plan and Backend

```cmd
az appservice plan create --name photo-sharing-plan --resource-group photo-sharing-rg --location eastus --is-linux --sku B1
```

```cmd
az webapp create --resource-group photo-sharing-rg --plan photo-sharing-plan --name YOURNAME-photo-backend --runtime "NODE:18-lts"
```

---

## B.13: Configure Backend Environment

```cmd
az webapp config appsettings set --resource-group photo-sharing-rg --name YOURNAME-photo-backend --settings NODE_ENV=production PORT=8080 DB_HOST=YOURNAME-photo-db.postgres.database.azure.com DB_PORT=5432 DB_NAME=photo_sharing_db DB_USER=photoadmin DB_PASSWORD="SecurePass123!" DB_SSL=true JWT_SECRET="change-this-to-a-random-string-at-least-32-characters" JWT_EXPIRES_IN=24h AZURE_STORAGE_CONNECTION_STRING="YOUR_CONNECTION_STRING" AZURE_STORAGE_CONTAINER_NAME=photos MAX_FILE_SIZE=10485760 ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp
```

---

## B.14: Enable CORS

```cmd
az webapp cors add --resource-group photo-sharing-rg --name YOURNAME-photo-backend --allowed-origins "*"
```

---

## B.15: Deploy Backend

Navigate to backend folder:
```cmd
cd C:\Users\%USERNAME%\Desktop\Projects\Com-769\photo-sharing-platform\backend
```

Install and zip:
```cmd
npm install --production
powershell Compress-Archive -Path * -DestinationPath backend.zip -Force
```

Deploy:
```cmd
az webapp deployment source config-zip --resource-group photo-sharing-rg --name YOURNAME-photo-backend --src backend.zip
```

---

## B.16: Test Backend

Open browser:
```
https://YOURNAME-photo-backend.azurewebsites.net/
```

---

## B.17: Build Frontend

```cmd
cd C:\Users\%USERNAME%\Desktop\Projects\Com-769\photo-sharing-platform\frontend
```

Create production config:
```cmd
echo REACT_APP_API_URL=https://YOURNAME-photo-backend.azurewebsites.net/api > .env.production
```

Build:
```cmd
npm install
npm run build
```

---

## B.18: Create and Deploy Frontend

```cmd
az staticwebapp create --name YOURNAME-photo-frontend --resource-group photo-sharing-rg --location eastus2
```

Get deployment token:
```cmd
az staticwebapp secrets list --name YOURNAME-photo-frontend --resource-group photo-sharing-rg --query "properties.apiKey" -o tsv
```

Install SWA CLI and deploy:
```cmd
npm install -g @azure/static-web-apps-cli
cd build
swa deploy . --deployment-token YOUR_DEPLOYMENT_TOKEN --env production
```

---

## B.19: Get Frontend URL

```cmd
az staticwebapp show --name YOURNAME-photo-frontend --resource-group photo-sharing-rg --query "defaultHostname" -o tsv
```

---

# ═══════════════════════════════════════════════════════════════════
# PART 5: TEST YOUR LIVE APPLICATION
# ═══════════════════════════════════════════════════════════════════

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
**Solution:** Close Command Prompt, open a new one. If still not working, reinstall Azure CLI.

## Problem: "psql" is not recognized
**Solution:** Add PostgreSQL to PATH (Step 1.4) and restart Command Prompt.

## Problem: Cannot connect to Azure database
**Solution:**
1. Check your IP address hasn't changed
2. Add new IP to firewall
3. Verify password is correct

## Problem: Backend returns errors
**Solution:** Check logs:
```cmd
az webapp log tail --name YOURNAME-photo-backend --resource-group photo-sharing-rg
```

## Problem: Frontend can't connect to backend
**Solution:**
1. Verify REACT_APP_API_URL is correct
2. Check CORS is enabled on backend
3. Rebuild and redeploy frontend

## Problem: "Invalid credentials" when logging in
**Solution:** Connect to Azure database and run:
```sql
UPDATE users SET password_hash = '$2a$10$lsXOVtBTtfpSI0HkgNm/8.8g6KsxSkyFDm4yylVsMvs8/7XlolRYK' WHERE email LIKE '%@example.com';
```

## Problem: Static Web App build fails
**Solution:**
1. Check that App location is `/photo-sharing-platform/frontend`
2. Check that Output location is `build`
3. View deployment logs in Azure Portal

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

---

# QUICK REFERENCE: Replace These Values

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

## Option A (GitHub Deploy):
- [ ] Azure CLI installed
- [ ] Logged into Azure
- [ ] Resource group created
- [ ] Database server created
- [ ] Database initialized (via Cloud Shell or Portal)
- [ ] Storage account created
- [ ] Backend deployed from GitHub
- [ ] Frontend deployed via Static Web Apps
- [ ] Application tested and working!

## Option B (Local Deploy):
- [ ] All software installed (Azure CLI, Git, Node.js, PostgreSQL)
- [ ] Repository cloned
- [ ] Local testing passed
- [ ] Logged into Azure
- [ ] All Azure resources created
- [ ] Backend deployed via ZIP
- [ ] Frontend deployed via SWA CLI
- [ ] Application tested and working!

---

# COMPARISON: OPTION A vs OPTION B

| Feature | Option A (GitHub) | Option B (Local) |
|---------|-------------------|------------------|
| **Difficulty** | Easier | More steps |
| **Software needed** | Only Azure CLI | Azure CLI + Git + Node.js |
| **Local testing** | No | Yes |
| **Deploy method** | Azure pulls from GitHub | You upload ZIP files |
| **Best for** | Quick deployment | Full control |
| **Time** | ~30 minutes | ~45 minutes |

---

**Congratulations! Your Photo Sharing Platform is now live on Azure!**
