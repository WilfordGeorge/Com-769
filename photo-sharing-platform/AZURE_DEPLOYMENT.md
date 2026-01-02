# Azure Deployment Steps (Wilford-Osagie Photo Sharing Platform)

This document records the exact deployment steps used to get the app running on Azure.
Replace placeholders with your own values and do not commit real secrets.

## 0) Login and subscription
```cmd
az login --use-device-code
az account list -o table
az account set --subscription <SUBSCRIPTION_ID>
az account show -o table
```

## 1) Resource group (Central US)
```cmd
set rg=wilford-osagie-rg-centralus
set location=centralus
az group create --name %rg% --location %location%
```

## 2) Register PostgreSQL resource provider
```cmd
az provider register --namespace Microsoft.DBforPostgreSQL
az provider show --namespace Microsoft.DBforPostgreSQL --query registrationState -o tsv
```

## 3) PostgreSQL Flexible Server
```cmd
set pgServer=wilford-osagie-db
set dbAdmin=photoadmin
set dbPass=YOUR_STRONG_PASSWORD

az postgres flexible-server create --resource-group %rg% --name %pgServer% --location %location% --admin-user %dbAdmin% --admin-password "%dbPass%" --sku-name Standard_B1ms --tier Burstable --storage-size 32 --version 15
```

Allow Azure services and your IP:
```cmd
az postgres flexible-server firewall-rule create --resource-group %rg% --name %pgServer% --rule-name AllowAzureServices --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

## 4) Create database
```cmd
az postgres flexible-server db create --resource-group %rg% --server-name %pgServer% --database-name photo_sharing_db
```

## 5) Enable pgcrypto and initialize schema
Create a temp SQL file for Azure (uuid-ossp is not allowed):
```cmd
powershell -NoProfile -Command "$src='photo-sharing-platform\database\init.sql'; $dst=\"$env:TEMP\init_azure.sql\"; (Get-Content $src) -replace 'uuid-ossp','pgcrypto' -replace 'uuid_generate_v4\(\)','gen_random_uuid()' | Set-Content $dst; Write-Output $dst"
```

Allow pgcrypto and restart:
```cmd
az postgres flexible-server parameter set --resource-group %rg% --server-name %pgServer% --name azure.extensions --value "pgcrypto"
az postgres flexible-server restart --resource-group %rg% --name %pgServer%
```

Run schema:
```cmd
set PGPASSWORD=YOUR_STRONG_PASSWORD
"C:\Program Files\PostgreSQL\17\bin\psql.exe" "host=wilford-osagie-db.postgres.database.azure.com port=5432 dbname=photo_sharing_db user=photoadmin sslmode=require" -v ON_ERROR_STOP=1 -f "%TEMP%\init_azure.sql"
set PGPASSWORD=
```

## 6) App Service Plan and Backend App
```cmd
az appservice plan create --name wilford-osagie-plan --resource-group %rg% --location %location% --is-linux --sku B1
az webapp create --resource-group %rg% --plan wilford-osagie-plan --name wilford-osagie-api --runtime "NODE:20-lts"
```

Backend app settings (replace secrets):
```cmd
az webapp config appsettings set --resource-group %rg% --name wilford-osagie-api --settings "NODE_ENV=production" "PORT=8080" "DB_HOST=wilford-osagie-db.postgres.database.azure.com" "DB_PORT=5432" "DB_NAME=photo_sharing_db" "DB_USER=photoadmin" "DB_PASSWORD=YOUR_DB_PASSWORD" "DB_SSL=true" "DB_SSL_REJECT_UNAUTHORIZED=true" "JWT_SECRET=CHANGE_ME" "JWT_EXPIRES_IN=24h" "UPLOAD_DIR=/home/uploads" "MAX_FILE_SIZE=10485760" "ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp" "SCM_DO_BUILD_DURING_DEPLOYMENT=true"
```

## 7) Backend deploy (zip)
Create zip without node_modules and deploy:
```cmd
cd photo-sharing-platform\backend
tar -a -c -f ..\backend.zip --exclude=node_modules --exclude=uploads --exclude=.env .
az webapp deploy --resource-group %rg% --name wilford-osagie-api --src-path ..\backend.zip --type zip
```

Health check:
```cmd
curl https://wilford-osagie-api.azurewebsites.net/api/health
```

## 8) Frontend build
```cmd
cd ..\frontend
echo REACT_APP_API_URL=https://wilford-osagie-api.azurewebsites.net/api> .env.production
npm install
npm run build
```

## 9) Static Web App
```cmd
az staticwebapp create --name wilford-osagie-web --resource-group %rg% --location %location%
```

Get deployment token and deploy:
```cmd
az staticwebapp secrets list --name wilford-osagie-web --resource-group %rg% --query properties.apiKey -o tsv
set SWA_TOKEN=YOUR_DEPLOYMENT_TOKEN
swa deploy .\build --deployment-token %SWA_TOKEN% --env production
```

## 10) CORS
```cmd
az webapp cors add --resource-group %rg% --name wilford-osagie-api --allowed-origins https://delightful-island-066945910.1.azurestaticapps.net
```

## 11) Final URLs
- Frontend: https://delightful-island-066945910.1.azurestaticapps.net
- Backend health: https://wilford-osagie-api.azurewebsites.net/api/health

## 12) Notes
- Uploads are stored on App Service local disk. If the app restarts or redeploys, files may be lost. For production, use Azure Blob Storage.
- The frontend uses SPA routing. The static web app config file is `frontend/public/staticwebapp.config.json`.
