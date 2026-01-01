# Option B: Clone to PC and Deploy Locally

This method gives you **full control** over the deployment. You clone the code to your PC, can test locally, then deploy to Azure.

---

## Requirements

- **Azure account** (school-provided or personal)
- **Azure CLI** installed
- **Git** installed
- **Node.js** installed
- **PostgreSQL** installed (for local testing)

**Time needed:** ~45 minutes

---

# PART 1: INSTALL REQUIRED SOFTWARE

## Step 1.1: Install Git

1. Go to: **https://git-scm.com/download/win**
2. Click **"Click here to download"** (64-bit version)
3. Run the downloaded file
4. Click **Next** on every screen (keep all defaults)
5. Click **Install**
6. Click **Finish**

### Verify Git Installation:

Open Command Prompt (Press `Windows Key + R`, type `cmd`, press Enter):
```cmd
git --version
```
You should see: `git version 2.x.x`

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

Open a **NEW** Command Prompt:
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

Open a **NEW** Command Prompt:
```cmd
az --version
```
You should see: `azure-cli 2.x.x`

---

# PART 2: CLONE THE PROJECT

## Step 2.1: Create Project Folder

Open Command Prompt:
```cmd
cd C:\Users\%USERNAME%\Desktop

mkdir Projects

cd Projects
```

---

## Step 2.2: Clone the Repository

```cmd
git clone https://github.com/WilfordGeorge/Com-769.git
```

Wait for download to complete. You should see: `Cloning into 'Com-769'...`

---

## Step 2.3: Navigate to Project

```cmd
cd Com-769\photo-sharing-platform
```

---

# PART 3: TEST LOCALLY (Recommended)

Before deploying to Azure, test on your PC to make sure everything works.

## Step 3.1: Start PostgreSQL Service

1. Press `Windows Key + R`
2. Type `services.msc` and press Enter
3. Find **"postgresql-x64-17"** (or 16)
4. Right-click and select **Start** (if not already running)

---

## Step 3.2: Create Local Database

Open Command Prompt:
```cmd
psql -U postgres -c "CREATE DATABASE photo_sharing_db;"
```
Enter password: `postgres`

---

## Step 3.3: Initialize Database Tables

```cmd
psql -U postgres -d photo_sharing_db -f database\init.sql
```
Enter password: `postgres`

You should see: `CREATE TABLE`, `CREATE INDEX`, `INSERT 0 4`

---

## Step 3.4: Setup Backend

```cmd
cd backend

copy .env.example .env

npm install
```

---

## Step 3.5: Setup Frontend

Open a **SECOND** Command Prompt window:
```cmd
cd C:\Users\%USERNAME%\Desktop\Projects\Com-769\photo-sharing-platform\frontend

npm install
```

---

## Step 3.6: Start the Application

**In the BACKEND Command Prompt:**
```cmd
npm run dev
```

You should see: `Server running on port: 5000`

**In the FRONTEND Command Prompt:**
```cmd
npm start
```

Wait for compilation. Browser should open automatically.

---

## Step 3.7: Test in Browser

Open: **http://localhost:3000**

Login with:
- **Email:** creator1@example.com
- **Password:** password123

If login works, you're ready for Azure deployment!

**Stop the servers** by pressing `Ctrl + C` in both Command Prompts.

---

# PART 4: LOGIN TO AZURE

## Step 4.1: Login

Open a **NEW** Command Prompt:
```cmd
az login
```

Your browser will open. Sign in with your **school email**.

---

## Step 4.2: Verify Subscription

```cmd
az account show --query name -o tsv
```

This shows your subscription name.

---

# PART 5: CREATE AZURE RESOURCES

**IMPORTANT:** Throughout this guide, replace `YOURNAME` with your actual name (lowercase, no spaces).

Example: If your name is Musaab, use `musaab`

---

## Step 5.1: Create Resource Group

```cmd
az group create --name photo-sharing-rg --location eastus
```

**Expected output:** `"provisioningState": "Succeeded"`

---

## Step 5.2: Create PostgreSQL Database Server

```cmd
az postgres flexible-server create --resource-group photo-sharing-rg --name YOURNAME-photo-db --location eastus --admin-user photoadmin --admin-password "SecurePass123!" --sku-name Standard_B1ms --tier Burstable --storage-size 32 --version 15 --yes
```

**This takes 5-10 minutes.** Wait for it to complete.

---

## Step 5.3: Configure Database Firewall

Allow Azure services:
```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name YOURNAME-photo-db --rule-name AllowAzure --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

Get your IP address:
```cmd
curl ifconfig.me
```

Add your IP (replace YOUR_IP with the IP you got):
```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name YOURNAME-photo-db --rule-name AllowMyIP --start-ip-address YOUR_IP --end-ip-address YOUR_IP
```

---

## Step 5.4: Create and Initialize Azure Database

Connect to Azure PostgreSQL:
```cmd
psql "host=YOURNAME-photo-db.postgres.database.azure.com port=5432 dbname=postgres user=photoadmin password=SecurePass123! sslmode=require"
```

Once connected (you'll see `postgres=>`), type:
```sql
CREATE DATABASE photo_sharing_db;
\q
```

Initialize tables:
```cmd
psql "host=YOURNAME-photo-db.postgres.database.azure.com port=5432 dbname=photo_sharing_db user=photoadmin password=SecurePass123! sslmode=require" -f database\init.sql
```

---

## Step 5.5: Create Storage Account

**IMPORTANT:** Storage name must be lowercase, no dashes, 3-24 characters

```cmd
az storage account create --name YOURNAMEphotostorage --resource-group photo-sharing-rg --location eastus --sku Standard_LRS
```

Example: `musaabphotostorage`

---

## Step 5.6: Create Storage Container

```cmd
az storage container create --name photos --account-name YOURNAMEphotostorage --public-access blob
```

---

## Step 5.7: Get Storage Connection String

```cmd
az storage account show-connection-string --name YOURNAMEphotostorage --resource-group photo-sharing-rg --query connectionString -o tsv
```

**COPY AND SAVE THIS OUTPUT!** You'll need it in Step 5.10.

---

## Step 5.8: Create App Service Plan

```cmd
az appservice plan create --name photo-sharing-plan --resource-group photo-sharing-rg --location eastus --is-linux --sku B1
```

---

## Step 5.9: Create Backend Web App

```cmd
az webapp create --resource-group photo-sharing-rg --plan photo-sharing-plan --name YOURNAME-photo-backend --runtime "NODE:18-lts"
```

---

## Step 5.10: Configure Backend Environment Variables

**IMPORTANT:** Replace ALL placeholders:
- `YOURNAME-photo-backend` → your backend name
- `YOURNAME-photo-db` → your database name
- `YOUR_CONNECTION_STRING` → connection string from Step 5.7

```cmd
az webapp config appsettings set --resource-group photo-sharing-rg --name YOURNAME-photo-backend --settings NODE_ENV=production PORT=8080 DB_HOST=YOURNAME-photo-db.postgres.database.azure.com DB_PORT=5432 DB_NAME=photo_sharing_db DB_USER=photoadmin DB_PASSWORD="SecurePass123!" DB_SSL=true JWT_SECRET="change-this-to-a-random-string-at-least-32-characters-long" JWT_EXPIRES_IN=24h AZURE_STORAGE_CONNECTION_STRING="YOUR_CONNECTION_STRING" AZURE_STORAGE_CONTAINER_NAME=photos MAX_FILE_SIZE=10485760 ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp
```

---

## Step 5.11: Enable CORS

```cmd
az webapp cors add --resource-group photo-sharing-rg --name YOURNAME-photo-backend --allowed-origins "*"
```

---

# PART 6: DEPLOY BACKEND

## Step 6.1: Navigate to Backend Folder

```cmd
cd C:\Users\%USERNAME%\Desktop\Projects\Com-769\photo-sharing-platform\backend
```

---

## Step 6.2: Install Production Dependencies

```cmd
npm install --production
```

---

## Step 6.3: Create ZIP File

```cmd
powershell Compress-Archive -Path * -DestinationPath backend.zip -Force
```

---

## Step 6.4: Deploy to Azure

```cmd
az webapp deployment source config-zip --resource-group photo-sharing-rg --name YOURNAME-photo-backend --src backend.zip
```

**This takes 2-5 minutes.**

---

## Step 6.5: Test Backend

Open your browser:
```
https://YOURNAME-photo-backend.azurewebsites.net/
```

You should see: `{"message":"Photo Sharing Platform API","version":"1.0.0"...}`

---

# PART 7: DEPLOY FRONTEND

## Step 7.1: Navigate to Frontend Folder

```cmd
cd C:\Users\%USERNAME%\Desktop\Projects\Com-769\photo-sharing-platform\frontend
```

---

## Step 7.2: Create Production Environment File

```cmd
echo REACT_APP_API_URL=https://YOURNAME-photo-backend.azurewebsites.net/api > .env.production
```

---

## Step 7.3: Install Dependencies

```cmd
npm install
```

---

## Step 7.4: Build for Production

```cmd
npm run build
```

**This takes 2-5 minutes.** A `build` folder will be created.

---

## Step 7.5: Create Static Web App

```cmd
az staticwebapp create --name YOURNAME-photo-frontend --resource-group photo-sharing-rg --location eastus2
```

---

## Step 7.6: Get Deployment Token

```cmd
az staticwebapp secrets list --name YOURNAME-photo-frontend --resource-group photo-sharing-rg --query "properties.apiKey" -o tsv
```

**COPY THIS TOKEN!** You'll need it in the next step.

---

## Step 7.7: Install SWA CLI

```cmd
npm install -g @azure/static-web-apps-cli
```

---

## Step 7.8: Deploy Frontend

```cmd
cd build

swa deploy . --deployment-token YOUR_DEPLOYMENT_TOKEN --env production
```

Replace `YOUR_DEPLOYMENT_TOKEN` with the token from Step 7.6.

---

## Step 7.9: Get Your Frontend URL

```cmd
az staticwebapp show --name YOURNAME-photo-frontend --resource-group photo-sharing-rg --query "defaultHostname" -o tsv
```

---

# PART 8: TEST YOUR APPLICATION

## Step 8.1: Open Your App

Open your browser and go to:
```
https://YOURNAME-photo-frontend.azurestaticapps.net
```

---

## Step 8.2: Test Login

1. Click **"Login"**
2. Enter demo credentials:
   - **Email:** `creator1@example.com`
   - **Password:** `password123`
3. Click **"Login"**

---

## Step 8.3: Test Features

**As a Creator:**
- Upload a photo
- Add title, caption, location
- View your uploaded photos

**As a Consumer:**
- Logout and login as `consumer1@example.com`
- Browse photos
- Rate photos (1-5 stars)
- Add comments

---

# PART 9: TROUBLESHOOTING

## Problem: "psql" is not recognized

**Solution:** Add PostgreSQL to PATH (see Step 1.3) and restart Command Prompt.

---

## Problem: Cannot connect to Azure database

**Solution:**
1. Check your IP address hasn't changed: `curl ifconfig.me`
2. Add new IP to firewall (Step 5.3)
3. Verify password is correct: `SecurePass123!`

---

## Problem: Backend returns errors

Check the logs:
```cmd
az webapp log tail --name YOURNAME-photo-backend --resource-group photo-sharing-rg
```

---

## Problem: Frontend can't connect to backend

**Solution:**
1. Verify REACT_APP_API_URL is correct in `.env.production`
2. Rebuild frontend: `npm run build`
3. Redeploy frontend (Steps 7.7-7.8)

---

## Problem: "Invalid credentials" when logging in

Connect to Azure database and run:
```cmd
psql "host=YOURNAME-photo-db.postgres.database.azure.com port=5432 dbname=photo_sharing_db user=photoadmin password=SecurePass123! sslmode=require"
```

Then run:
```sql
UPDATE users SET password_hash = '$2a$10$lsXOVtBTtfpSI0HkgNm/8.8g6KsxSkyFDm4yylVsMvs8/7XlolRYK' WHERE email LIKE '%@example.com';
\q
```

---

## Problem: ZIP deployment failed

**Solution:**
1. Make sure you're in the `backend` folder
2. Delete old zip: `del backend.zip`
3. Recreate: `powershell Compress-Archive -Path * -DestinationPath backend.zip -Force`
4. Redeploy

---

# PART 10: YOUR URLS AND CREDENTIALS

## Your Application URLs:

| Service | URL |
|---------|-----|
| **Frontend** | `https://YOURNAME-photo-frontend.azurestaticapps.net` |
| **Backend API** | `https://YOURNAME-photo-backend.azurewebsites.net/api` |
| **Local Frontend** | `http://localhost:3000` |
| **Local Backend** | `http://localhost:5000` |

## Demo Accounts:

| Role | Email | Password |
|------|-------|----------|
| Creator | creator1@example.com | password123 |
| Creator | creator2@example.com | password123 |
| Consumer | consumer1@example.com | password123 |
| Consumer | consumer2@example.com | password123 |

## Azure Resources Created:

| Resource | Name |
|----------|------|
| Resource Group | photo-sharing-rg |
| PostgreSQL Server | YOURNAME-photo-db |
| Database | photo_sharing_db |
| Storage Account | YOURNAMEphotostorage |
| App Service Plan | photo-sharing-plan |
| Backend Web App | YOURNAME-photo-backend |
| Static Web App | YOURNAME-photo-frontend |

---

# PART 11: COST AND CLEANUP

## Estimated Monthly Cost:

| Service | Cost |
|---------|------|
| PostgreSQL (Burstable B1ms) | ~$12/month |
| App Service (B1) | ~$13/month |
| Storage | ~$1/month |
| Static Web Apps | FREE |
| **Total** | **~$26/month** |

**Note:** School accounts often have free credits that cover this!

---

## To Delete Everything (Stop All Charges):

When you're done with the project:

```cmd
az group delete --name photo-sharing-rg --yes --no-wait
```

This deletes ALL resources in the group and stops all charges.

---

# SUCCESS CHECKLIST

## Local Setup:
- [ ] Git installed
- [ ] Node.js installed
- [ ] PostgreSQL installed
- [ ] Azure CLI installed
- [ ] Repository cloned
- [ ] Local database created
- [ ] Local testing passed

## Azure Deployment:
- [ ] Logged into Azure (`az login`)
- [ ] Resource group created
- [ ] PostgreSQL server created
- [ ] Database firewall configured
- [ ] Azure database created and initialized
- [ ] Storage account created
- [ ] Storage container created
- [ ] App Service plan created
- [ ] Backend web app created
- [ ] Backend environment variables set
- [ ] Backend deployed via ZIP
- [ ] Backend tested
- [ ] Frontend built
- [ ] Static Web App created
- [ ] Frontend deployed via SWA CLI
- [ ] Login tested successfully
- [ ] Photo upload tested (as creator)
- [ ] Photo browsing tested (as consumer)

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

# RE-DEPLOYING AFTER CHANGES

If you make changes to the code and need to redeploy:

## Redeploy Backend:

```cmd
cd C:\Users\%USERNAME%\Desktop\Projects\Com-769\photo-sharing-platform\backend
del backend.zip
npm install --production
powershell Compress-Archive -Path * -DestinationPath backend.zip -Force
az webapp deployment source config-zip --resource-group photo-sharing-rg --name YOURNAME-photo-backend --src backend.zip
```

## Redeploy Frontend:

```cmd
cd C:\Users\%USERNAME%\Desktop\Projects\Com-769\photo-sharing-platform\frontend
npm run build
cd build
swa deploy . --deployment-token YOUR_DEPLOYMENT_TOKEN --env production
```

---

**Congratulations! Your Photo Sharing Platform is now live on Azure!**
