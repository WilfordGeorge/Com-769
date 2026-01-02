# Testing Guide - Photo Sharing Platform

This guide helps you test all features of the Photo Sharing Platform locally.

## Quick Start

### Backend is currently running!
- **Backend API**: http://localhost:5000
- **Database**: PostgreSQL on localhost:5432

The backend server is already running in the background. You can check its status:
```bash
curl http://localhost:5000/api/health
```

### Start Frontend (If needed)
```bash
cd frontend
npm install
npm start
```
The frontend will be available at http://localhost:3000

## Demo Accounts

### Creator Account
- **Email**: creator1@example.com
- **Password**: password123
- **Role**: Can upload and manage photos

### Consumer Account
- **Email**: consumer1@example.com
- **Password**: password123
- **Role**: Can browse, comment, and rate photos

## Testing Workflow

### 1. Test Authentication

**Login as Creator:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"creator1@example.com","password":"password123"}'
```

**Login as Consumer:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"consumer1@example.com","password":"password123"}'
```

Save the token from the response for subsequent requests.

### 2. Test Photo Upload (Creator Only)

```bash
# Set your token
TOKEN="your-jwt-token-here"

# Upload a photo
curl -X POST http://localhost:5000/api/photos \
  -H "Authorization: Bearer $TOKEN" \
  -F "photo=@/path/to/your/image.jpg" \
  -F "title=Beautiful Sunset" \
  -F "caption=Amazing sunset at the beach" \
  -F "location=Malibu Beach, CA" \
  -F 'people_present=["John", "Jane"]'
```

### 3. Test Photo Browsing

**Get all photos:**
```bash
curl http://localhost:5000/api/photos
```

**Search photos:**
```bash
curl "http://localhost:5000/api/photos?search=sunset&sortBy=created_at"
```

**Filter by location:**
```bash
curl "http://localhost:5000/api/photos?location=beach"
```

### 4. Test Photo Details

```bash
# Get specific photo (replace PHOTO_ID)
curl http://localhost:5000/api/photos/PHOTO_ID
```

### 5. Test Comments (Consumer Only)

```bash
# Add comment (replace PHOTO_ID and TOKEN)
curl -X POST http://localhost:5000/api/photos/PHOTO_ID/comment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Amazing photo!"}'

# Get comments
curl http://localhost:5000/api/photos/PHOTO_ID/comments
```

### 6. Test Ratings (Consumer Only)

```bash
# Rate photo (1-5 stars)
curl -X POST http://localhost:5000/api/photos/PHOTO_ID/rate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating":5}'
```

### 7. Test Creator Features

**Get my photos:**
```bash
curl http://localhost:5000/api/photos/my/uploads \
  -H "Authorization: Bearer $TOKEN"
```

**Update photo:**
```bash
curl -X PUT http://localhost:5000/api/photos/PHOTO_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"caption":"Updated caption"}'
```

**Delete photo:**
```bash
curl -X DELETE http://localhost:5000/api/photos/PHOTO_ID \
  -H "Authorization: Bearer $TOKEN"
```

## Frontend Testing

### 1. Access the Application
Open http://localhost:3000 in your browser

### 2. Test Creator Workflow
1. Login with creator1@example.com / password123
2. Navigate to "Upload Photo"
3. Select an image file
4. Fill in metadata:
   - Title (required)
   - Caption (optional)
   - Location (optional)
   - People present (comma-separated)
5. Upload the photo
6. Go to "My Photos" to see uploaded photos
7. Test delete functionality

### 3. Test Consumer Workflow
1. Logout and login with consumer1@example.com / password123
2. Browse photos on the dashboard
3. Use search functionality:
   - Search by keywords
   - Filter by location
   - Sort by latest/rating/views
4. Click on a photo to view details
5. Test rating:
   - Click on stars to rate (1-5)
   - See average rating update
6. Test comments:
   - Add a comment
   - View all comments
7. Navigate back to dashboard

### 4. Test Pagination
- Upload multiple photos
- Test page navigation
- Verify correct photo counts

### 5. Test Responsive Design
- Resize browser window
- Test on mobile viewport
- Verify layout adapts correctly

## Performance Testing

### Load Testing
```bash
# Install Apache Bench (if not installed)
# sudo apt-get install apache2-utils

# Test health endpoint
ab -n 1000 -c 10 http://localhost:5000/api/health

# Test photos endpoint
ab -n 500 -c 5 http://localhost:5000/api/photos
```

### Database Performance
```bash
# Check active connections
psql -U postgres -d photo_sharing_db -c "SELECT count(*) FROM pg_stat_activity;"

# Check query performance
psql -U postgres -d photo_sharing_db -c "EXPLAIN ANALYZE SELECT * FROM photos ORDER BY created_at DESC LIMIT 20;"
```

## Security Testing

### 1. Test Authentication
- Try accessing protected endpoints without token
- Try using expired token
- Try using invalid token

### 2. Test Authorization
- Try creator accessing consumer-only endpoints
- Try consumer accessing creator-only endpoints
- Try accessing other user's photos

### 3. Test Input Validation
- Try uploading non-image files
- Try uploading files > 10MB
- Try SQL injection in search
- Try XSS in comments

## Expected Results

### Successful Tests
- ✅ All API endpoints respond correctly
- ✅ Authentication works for both roles
- ✅ Photo upload creates thumbnails
- ✅ Search and filters work accurately
- ✅ Comments and ratings update correctly
- ✅ Creator can manage their photos
- ✅ Consumer cannot upload photos
- ✅ Database maintains referential integrity

### Known Limitations
- File storage is local (not cloud)
- No real-time notifications
- No caching implemented yet
- Single-server deployment

## Troubleshooting

### Backend Not Running
```bash
cd backend
npm start
```

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start if needed
sudo service postgresql start

# Verify connection
psql -U postgres -d photo_sharing_db -c "SELECT 1;"
```

### Frontend Build Errors
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Next Steps

After local testing succeeds:
1. Review the code structure
2. Prepare for Azure deployment
3. Set up CI/CD pipeline
4. Configure production environment variables
5. Deploy to Azure (follow AZURE_DEPLOYMENT.md)

## Test Checklist

- [ ] Backend health check passes
- [ ] Database schema initialized
- [ ] Creator login works
- [ ] Consumer login works
- [ ] Photo upload works (with metadata)
- [ ] Thumbnail generation works
- [ ] Photo listing/browsing works
- [ ] Search functionality works
- [ ] Filter by location works
- [ ] Sorting works (latest, rating, views)
- [ ] Photo detail view works
- [ ] Comments can be added
- [ ] Ratings can be submitted
- [ ] Average rating calculates correctly
- [ ] Creator can view their photos
- [ ] Creator can delete photos
- [ ] Consumer cannot upload photos
- [ ] Consumer cannot delete photos
- [ ] Pagination works correctly
- [ ] Frontend UI is responsive
- [ ] Error handling works properly

## Support

If you encounter any issues:
1. Check the logs (backend.log)
2. Verify database connection
3. Ensure all dependencies are installed
4. Review the error messages
5. Check API documentation in README.md
