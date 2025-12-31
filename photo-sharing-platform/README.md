# Photo Sharing Platform

A scalable, cloud-native web application for sharing and discovering photos, similar to Instagram. This platform enables creators to upload photos with metadata and allows consumers to browse, search, comment, and rate photos.

## Features

### Creator Features
- Upload photos with metadata (title, caption, location, people present)
- Manage uploaded photos
- View photo statistics (views, ratings, comments)
- Delete photos

### Consumer Features
- Browse and search photos
- Filter by location, search by keywords
- Sort by latest, highest rated, or most viewed
- View photo details
- Comment on photos
- Rate photos (1-5 stars)

### Technical Features
- RESTful API backend
- JWT-based authentication with role-based access control
- PostgreSQL database for persistence
- File upload with automatic thumbnail generation
- Responsive React frontend
- Docker containerization for easy deployment
- Scalable architecture ready for cloud deployment

## Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** for relational data
- **JWT** for authentication
- **Multer** for file uploads
- **Sharp** for image processing
- **bcryptjs** for password hashing

### Frontend
- **React.js** for UI
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management

### DevOps
- **Docker** and Docker Compose
- **PostgreSQL** containerized database
- Ready for Azure deployment

## Prerequisites

- **Docker** and **Docker Compose** installed
- OR
- **Node.js** (v18+)
- **PostgreSQL** (v15+)
- **npm** or **yarn**

## Quick Start with Docker (Recommended)

1. **Clone the repository**
   ```bash
   cd photo-sharing-platform
   ```

2. **Start all services with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

4. **Demo Credentials**
   - **Creator Account:**
     - Email: `creator1@example.com`
     - Password: `password123`

   - **Consumer Account:**
     - Email: `consumer1@example.com`
     - Password: `password123`

## Manual Setup (Without Docker)

### 1. Database Setup

```bash
# Install PostgreSQL
# Create database
createdb photo_sharing_db

# Initialize schema
psql -d photo_sharing_db -f database/init.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start the backend server
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

Frontend will run on http://localhost:3000

## Project Structure

```
photo-sharing-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, upload middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── server.js        # Entry point
│   ├── uploads/             # Uploaded photos
│   ├── .env                 # Environment variables
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/      # Shared components
│   │   │   ├── creator/     # Creator view
│   │   │   └── consumer/    # Consumer view
│   │   ├── context/         # Auth context
│   │   ├── services/        # API services
│   │   ├── styles/          # CSS files
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql             # Database schema
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Photos
- `GET /api/photos` - Get all photos (with pagination and search)
- `GET /api/photos/:id` - Get photo details
- `POST /api/photos` - Upload photo (Creator only)
- `PUT /api/photos/:id` - Update photo metadata (Creator only)
- `DELETE /api/photos/:id` - Delete photo (Creator only)
- `GET /api/photos/my/uploads` - Get creator's photos
- `POST /api/photos/:id/comment` - Add comment (Consumer only)
- `POST /api/photos/:id/rate` - Rate photo (Consumer only)
- `GET /api/photos/:id/comments` - Get photo comments

### Health Check
- `GET /api/health` - API health status

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=photo_sharing_db
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,image/webp
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Testing the Application

### 1. Register Accounts
- Create a Creator account to upload photos
- Create a Consumer account to browse and interact

### 2. Creator Workflow
1. Login as a creator
2. Navigate to "Upload Photo"
3. Select an image file
4. Fill in metadata (title, caption, location, people)
5. Upload the photo
6. View your photos in "My Photos"

### 3. Consumer Workflow
1. Login as a consumer
2. Browse photos on the dashboard
3. Use search and filters
4. Click on a photo to view details
5. Add comments and ratings

## Scalability Features

### Database
- Indexed columns for fast queries
- Full-text search support
- Efficient pagination
- Connection pooling

### Caching (Ready for Implementation)
- Photo metadata caching
- Popular searches caching
- Redis integration ready

### Storage
- Local file system for development
- Easy migration to Azure Blob Storage
- CDN-ready architecture

### Application
- Stateless REST API
- Horizontal scaling ready
- Docker containerization
- Load balancer ready

## Azure Deployment Guide

See [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) for detailed instructions on deploying to Microsoft Azure.

### Azure Services Required
- **Azure App Service** - Backend API
- **Azure Static Web Apps** - Frontend
- **Azure Database for PostgreSQL** - Database
- **Azure Blob Storage** - Photo storage
- **Azure CDN** - Content delivery
- **Azure Redis Cache** - Caching (optional)
- **Azure Application Insights** - Monitoring (optional)

## Monitoring and Logging

### Application Logs
- Request/response logging
- Error tracking
- Database query logging

### Health Checks
- Database connectivity
- API status
- Timestamp tracking

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation
- File type and size validation
- SQL injection prevention (parameterized queries)
- CORS configuration

## Performance Optimization

- Image thumbnail generation
- Database indexing
- Query optimization
- Connection pooling
- Lazy loading of images
- Pagination for large datasets

## Future Enhancements

- Azure Cognitive Services integration for:
  - Automatic image tagging
  - Content moderation
  - Face detection
  - OCR for text in images
- Real-time notifications
- Direct messaging between users
- Photo albums/collections
- Advanced search with AI
- Social features (follow users)
- Photo editing tools
- Mobile application

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose ps

# Check database logs
docker-compose logs postgres
```

### Backend Issues
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Frontend Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Code Style
- ESLint for JavaScript
- Prettier for formatting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API documentation

## Acknowledgments

- Built for cloud computing coursework
- Demonstrates modern web application architecture
- Production-ready scalable design
