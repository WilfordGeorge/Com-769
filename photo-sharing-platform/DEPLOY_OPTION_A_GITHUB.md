# Option A: Deploy Directly from GitHub

This is the **easiest deployment method**. Azure pulls your code directly from GitHub - no need to clone or build locally.

---

## Requirements

- **Azure account** (school-provided or personal)
- **Azure CLI** installed on your PC

**Time needed:** ~30 minutes

---

# PART 1: INSTALL AZURE CLI

## Step 1.1: Download and Install

1. Go to: **https://aka.ms/installazurecliwindows**
2. The download will start automatically
3. Run the downloaded file (azure-cli-x.x.x.msi)
4. Check **"I accept the terms"**
5. Click **Install**
6. Click **Finish**

## Step 1.2: Verify Installation

Open Command Prompt (Press `Windows Key + R`, type `cmd`, press Enter):

```cmd
az --version
```

You should see: `azure-cli 2.x.x`

**If you see an error**, close Command Prompt and open a new one.

---

# PART 2: LOGIN TO AZURE

## Step 2.1: Login

Open Command Prompt and run:

```cmd
az login
```

Your browser will open. Sign in with your **school email**.

After login, you'll see your subscription information in the Command Prompt.

## Step 2.2: Verify Subscription

```cmd
az account show --query name -o tsv
```

This shows your subscription name. Make sure it's the correct one.

---

# PART 3: CREATE AZURE RESOURCES

**IMPORTANT:** Throughout this guide, replace `YOURNAME` with your actual name (lowercase, no spaces).

Example: If your name is Musaab, use `musaab`

---

## Step 3.1: Create Resource Group

```cmd
az group create --name photo-sharing-rg --location eastus
```

**Expected output:** `"provisioningState": "Succeeded"`

---

## Step 3.2: Create PostgreSQL Database Server

```cmd
az postgres flexible-server create --resource-group photo-sharing-rg --name YOURNAME-photo-db --location eastus --admin-user photoadmin --admin-password "SecurePass123!" --sku-name Standard_B1ms --tier Burstable --storage-size 32 --version 15 --yes
```

**This takes 5-10 minutes.** Wait for it to complete.

**Expected output:** Server details with `"state": "Ready"`

---

## Step 3.3: Configure Database Firewall

Allow Azure services to connect:

```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name YOURNAME-photo-db --rule-name AllowAzure --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

Allow all IPs temporarily (for setup):

```cmd
az postgres flexible-server firewall-rule create --resource-group photo-sharing-rg --name YOURNAME-photo-db --rule-name AllowAll --start-ip-address 0.0.0.0 --end-ip-address 255.255.255.255
```

---

## Step 3.4: Create Storage Account

**IMPORTANT:** Storage name must be:
- All lowercase
- No dashes or spaces
- 3-24 characters

```cmd
az storage account create --name YOURNAMEphotostorage --resource-group photo-sharing-rg --location eastus --sku Standard_LRS
```

Example: `musaabphotostorage`

---

## Step 3.5: Create Storage Container

```cmd
az storage container create --name photos --account-name YOURNAMEphotostorage --public-access blob
```

---

## Step 3.6: Get Storage Connection String

```cmd
az storage account show-connection-string --name YOURNAMEphotostorage --resource-group photo-sharing-rg --query connectionString -o tsv
```

**COPY AND SAVE THIS OUTPUT!**

It looks like: `DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net`

You'll need this in Step 4.3.

---

## Step 3.7: Create App Service Plan

```cmd
az appservice plan create --name photo-sharing-plan --resource-group photo-sharing-rg --location eastus --is-linux --sku B1
```

---

## Step 3.8: Create Backend Web App

```cmd
az webapp create --resource-group photo-sharing-rg --plan photo-sharing-plan --name YOURNAME-photo-backend --runtime "NODE:18-lts"
```

Example: `musaab-photo-backend`

---

# PART 4: CONFIGURE AND DEPLOY BACKEND

## Step 4.1: Enable CORS

```cmd
az webapp cors add --resource-group photo-sharing-rg --name YOURNAME-photo-backend --allowed-origins "*"
```

---

## Step 4.2: Configure Environment Variables

**IMPORTANT:** Before running this command, replace:
- `YOURNAME-photo-backend` → your backend name from Step 3.8
- `YOURNAME-photo-db` → your database name from Step 3.2
- `YOUR_CONNECTION_STRING` → the connection string from Step 3.6

```cmd
az webapp config appsettings set --resource-group photo-sharing-rg --name YOURNAME-photo-backend --settings NODE_ENV=production PORT=8080 DB_HOST=YOURNAME-photo-db.postgres.database.azure.com DB_PORT=5432 DB_NAME=photo_sharing_db DB_USER=photoadmin DB_PASSWORD="SecurePass123!" DB_SSL=true JWT_SECRET="change-this-to-a-random-string-at-least-32-characters-long" JWT_EXPIRES_IN=24h AZURE_STORAGE_CONNECTION_STRING="YOUR_CONNECTION_STRING" AZURE_STORAGE_CONTAINER_NAME=photos MAX_FILE_SIZE=10485760 ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp
```

---

## Step 4.3: Deploy Backend from GitHub

```cmd
az webapp deployment source config --name YOURNAME-photo-backend --resource-group photo-sharing-rg --repo-url https://github.com/WilfordGeorge/Com-769 --branch claude/setup-local-testing-84TB3 --manual-integration
```

---

## Step 4.4: Configure Startup Command

```cmd
az webapp config set --resource-group photo-sharing-rg --name YOURNAME-photo-backend --startup-file "cd photo-sharing-platform/backend && npm install && npm start"
```

---

## Step 4.5: Test Backend

Wait 2-3 minutes for deployment, then open your browser:

```
https://YOURNAME-photo-backend.azurewebsites.net/
```

**Expected result:** `{"message":"Photo Sharing Platform API","version":"1.0.0"...}`

If you see this, your backend is working!

---

# PART 5: INITIALIZE DATABASE

We need to create the database and tables. We'll use Azure Cloud Shell for this.

## Step 5.1: Open Azure Portal

1. Go to **https://portal.azure.com**
2. Sign in with your school account

---

## Step 5.2: Create the Database

1. In the search bar at the top, type your database name (e.g., `musaab-photo-db`)
2. Click on your PostgreSQL server
3. In the left menu, click **"Databases"**
4. Click **"+ Add"**
5. Enter name: `photo_sharing_db`
6. Click **"Save"**

---

## Step 5.3: Open Cloud Shell

1. Click the **Cloud Shell** icon in the top right (looks like `>_`)
2. If prompted, select **Bash**
3. If prompted to create storage, click **"Create storage"**

---

## Step 5.4: Initialize Database Tables

In the Cloud Shell, run these commands one by one:

**Download the init script:**
```bash
curl -O https://raw.githubusercontent.com/WilfordGeorge/Com-769/claude/setup-local-testing-84TB3/photo-sharing-platform/database/init.sql
```

**Run the script (replace YOURNAME-photo-db with your database name):**
```bash
psql "host=YOURNAME-photo-db.postgres.database.azure.com port=5432 dbname=photo_sharing_db user=photoadmin password=SecurePass123! sslmode=require" -f init.sql
```

**Expected output:** Multiple `CREATE TABLE`, `CREATE INDEX`, and `INSERT 0 4` messages.

---

# PART 6: DEPLOY FRONTEND

## Step 6.1: Create Static Web App

1. In Azure Portal, search for **"Static Web Apps"**
2. Click **"+ Create"**

---

## Step 6.2: Configure Static Web App

Fill in the form:

**Basics tab:**
- **Subscription:** Your school subscription
- **Resource Group:** `photo-sharing-rg`
- **Name:** `YOURNAME-photo-frontend` (e.g., `musaab-photo-frontend`)
- **Plan type:** Free
- **Region:** East US 2
- **Source:** GitHub

---

## Step 6.3: Connect to GitHub

1. Click **"Sign in with GitHub"**
2. Authorize Azure to access your GitHub
3. Select:
   - **Organization:** WilfordGeorge
   - **Repository:** Com-769
   - **Branch:** claude/setup-local-testing-84TB3

---

## Step 6.4: Configure Build Settings

- **Build Presets:** React
- **App location:** `/photo-sharing-platform/frontend`
- **Api location:** (leave empty)
- **Output location:** `build`

---

## Step 6.5: Create the Static Web App

1. Click **"Review + create"**
2. Click **"Create"**

**This takes 3-5 minutes** to deploy.

---

## Step 6.6: Configure Frontend Environment Variable

1. Once created, go to your Static Web App in Azure Portal
2. In the left menu, click **"Environment variables"**
3. Click **"+ Add"**
4. Add:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://YOURNAME-photo-backend.azurewebsites.net/api`
5. Click **"Save"**

---

## Step 6.7: Get Your Frontend URL

1. Go to your Static Web App **Overview** page
2. Find the **URL** - it looks like: `https://xxxx-xxxx-xxxx.azurestaticapps.net`

---

# PART 7: TEST YOUR APPLICATION

## Step 7.1: Open Your App

Open your browser and go to your frontend URL:
```
https://YOURNAME-photo-frontend.azurestaticapps.net
```

---

## Step 7.2: Test Login

1. Click **"Login"**
2. Enter demo credentials:
   - **Email:** `creator1@example.com`
   - **Password:** `password123`
3. Click **"Login"**

---

## Step 7.3: Test Features

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

# PART 8: TROUBLESHOOTING

## Problem: Backend returns errors

Check the logs:
```cmd
az webapp log tail --name YOURNAME-photo-backend --resource-group photo-sharing-rg
```

---

## Problem: "Invalid credentials" when logging in

Connect to your database via Cloud Shell and run:
```sql
UPDATE users SET password_hash = '$2a$10$lsXOVtBTtfpSI0HkgNm/8.8g6KsxSkyFDm4yylVsMvs8/7XlolRYK' WHERE email LIKE '%@example.com';
```

---

## Problem: Frontend can't connect to backend

1. Verify REACT_APP_API_URL is correct in environment variables
2. Make sure CORS is enabled on backend
3. Check that backend URL ends with `/api`

---

## Problem: Static Web App build fails

1. Check App location is `/photo-sharing-platform/frontend`
2. Check Output location is `build`
3. View deployment logs in GitHub Actions tab

---

## Problem: Database connection failed

1. Check firewall rules allow your IP
2. Verify password is correct: `SecurePass123!`
3. Make sure database name is `photo_sharing_db`

---

# PART 9: YOUR URLS AND CREDENTIALS

## Your Application URLs:

| Service | URL |
|---------|-----|
| **Frontend** | `https://YOURNAME-photo-frontend.azurestaticapps.net` |
| **Backend API** | `https://YOURNAME-photo-backend.azurewebsites.net/api` |

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

# PART 10: COST AND CLEANUP

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

- [ ] Azure CLI installed
- [ ] Logged into Azure (`az login`)
- [ ] Resource group created
- [ ] PostgreSQL server created
- [ ] Database firewall configured
- [ ] Storage account created
- [ ] Storage container created
- [ ] App Service plan created
- [ ] Backend web app created
- [ ] Backend environment variables set
- [ ] Backend deployed from GitHub
- [ ] Database created (`photo_sharing_db`)
- [ ] Database tables initialized (ran init.sql)
- [ ] Static Web App created
- [ ] Frontend connected to GitHub
- [ ] Frontend environment variable set
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
| `YOUR_CONNECTION_STRING` | DefaultEndpoints... | _____________ |

---

**Congratulations! Your Photo Sharing Platform is now live on Azure!**
