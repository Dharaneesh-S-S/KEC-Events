# KEC Events - Backend Setup Guide

## Overview

The admin dashboard is now fully connected to the backend with the following features:
- **Admin Authentication**: Secure login with database storage
- **Club Management**: Create, read, update, delete clubs
- **Real-time Statistics**: Live data from the database
- **Search & Filter**: Advanced club filtering capabilities
- **API Integration**: Full REST API backend

## Prerequisites

1. **Node.js** (v16 or higher)
2. **MongoDB** (local or cloud instance)
3. **Git** (for cloning the repository)

## Backend Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the server directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kec-events
JWT_SECRET=your-super-secret-jwt-key-here
```

### 3. Database Setup

Make sure MongoDB is running:
- **Local MongoDB**: Start MongoDB service
- **Cloud MongoDB**: Use MongoDB Atlas connection string

### 4. Start Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Start Frontend Development Server

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173`

## Admin Dashboard Features

### Authentication
- **Username**: `ADMIN_KEC`
- **Password**: `ADMIN_KEC`
- Admin user is automatically created in the database on first login

### Dashboard Statistics
- Total Clubs (from database)
- Total Events (from database)
- Total Students (from database)
- Active Clubs (from database)

### Club Management
- **Create Clubs**: Add new clubs with full details
- **Edit Clubs**: Modify existing club information
- **Delete Clubs**: Remove clubs (with safety checks)
- **View Details**: See club statistics and information

### Search & Filter
- Search clubs by name or email
- Filter by department
- Real-time results

## API Endpoints

### Admin Routes (Protected)
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/clubs` - Get all clubs with filters
- `POST /api/admin/clubs` - Create new club
- `GET /api/admin/clubs/:id` - Get specific club
- `PUT /api/admin/clubs/:id` - Update club
- `DELETE /api/admin/clubs/:id` - Delete club
- `GET /api/admin/departments` - Get all departments

### Authentication Routes
- `POST /api/auth/login` - User login (including admin)
- `POST /api/auth/signup` - User registration
- `GET /api/auth/verify` - Verify authentication token

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'club', 'student']),
  department: String,
  description: String,
  status: String (enum: ['active', 'inactive']),
  createdAt: Date
}
```

### Event Model
```javascript
{
  title: String (required),
  venue: String (required),
  eventDate: Date (required),
  registrationDeadline: Date (required),
  description: String (required),
  category: String (required),
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date
}
```

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: bcrypt for password security
3. **Admin Middleware**: Role-based access control
4. **Input Validation**: Server-side validation
5. **Error Handling**: Comprehensive error management

## Development Workflow

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 2. Access Admin Dashboard
1. Open `http://localhost:5173`
2. Click "Login"
3. Enter admin credentials:
   - Username: `ADMIN_KEC`
   - Password: `ADMIN_KEC`
4. You'll be redirected to the admin dashboard

### 3. Test Features
- Create a new club
- Edit existing clubs
- Search and filter clubs
- View real-time statistics

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes on the port

3. **CORS Errors**
   - Backend CORS is configured for development
   - Check if frontend URL matches CORS settings

4. **Authentication Errors**
   - Clear browser localStorage
   - Check JWT_SECRET in `.env`
   - Verify token expiration

### Debug Mode

Enable debug logging by adding to `.env`:
```env
DEBUG=true
NODE_ENV=development
```

## Production Deployment

### Environment Variables
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/kec-events
JWT_SECRET=very-long-secure-secret-key
NODE_ENV=production
```

### Security Considerations
1. Use strong JWT secrets
2. Enable HTTPS in production
3. Set up proper CORS for production domain
4. Use environment-specific MongoDB connections
5. Implement rate limiting
6. Add request validation middleware

## API Documentation

For detailed API documentation, see `server/API_DOCUMENTATION.md`

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs for errors
3. Verify database connectivity
4. Test API endpoints with Postman/curl
