# VettCode Developer API

Backend API for VettCode Developer Authentication and Management System.

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js           # MongoDB connection configuration
├── models/
│   └── VettcodeDeveloper.js  # Developer model schema
├── middleware/
│   └── authMiddleware.js     # JWT authentication middleware
├── routes/
│   └── developerAuth.js      # Authentication routes
├── server.js                 # Main server file
├── package.json             # Dependencies
├── .env                     # Environment variables
└── .env.example             # Environment variables template
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update values as needed

3. **Start MongoDB** (if using local instance):
   ```bash
   mongod
   ```

4. **Start the server:**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

5. **Server will run on:** `http://localhost:5001`

## 📡 API Endpoints

### Authentication Routes (`/api/developer-auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/signup` | Register new developer | Public |
| POST | `/login` | Login developer | Public |
| GET | `/me` | Get current developer profile | Private |
| PUT | `/update-profile` | Update developer profile | Private |
| POST | `/logout` | Logout developer | Private |
| GET | `/stats` | Get developer statistics | Private |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | API health check |
| GET | `/` | API information |

## 📝 API Usage Examples

### Signup
```bash
POST /api/developer-auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123",
  "confirmPassword": "secure123"
}
```

### Login
```bash
POST /api/developer-auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure123"
}
```

### Get Profile (Protected)
```bash
GET /api/developer-auth/me
Authorization: Bearer <your-jwt-token>
```

### Update Profile (Protected)
```bash
PUT /api/developer-auth/update-profile
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Full-stack developer",
  "github": "https://github.com/johndoe"
}
```

## 🗄️ Database Schema

### VettcodeDeveloper Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (developer/admin),
  isActive: Boolean,
  isEmailVerified: Boolean,
  profile: {
    avatar: String,
    bio: String,
    website: String,
    github: String,
    linkedin: String
  },
  subscription: {
    plan: String (free/pro/enterprise),
    startDate: Date,
    endDate: Date,
    status: String
  },
  scanStats: {
    totalScans: Number,
    lastScanDate: Date,
    vulnerabilitiesFound: Number
  },
  lastLogin: Date,
  loginCount: Number,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🔐 Authentication

- JWT-based authentication
- Token expires in 30 days (configurable)
- Password hashing with bcrypt (12 salt rounds)
- Protected routes require Bearer token

### Example Authorization Header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🛡️ Security Features

- Password hashing with bcryptjs
- JWT token validation
- Role-based access control
- Input validation
- Email verification support (ready)
- Password reset token support (ready)
- API key generation for CLI access
- CORS protection
- Security headers

## 📊 Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 5001 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/vettcode-developers |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRE` | JWT expiration time | 30d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## 🧪 Testing

Test the API health:
```bash
curl http://localhost:5001/health
```

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables

## 🚧 Future Features

- [ ] Email verification system
- [ ] Password reset functionality
- [ ] OAuth integration (GitHub, Google)
- [ ] Rate limiting
- [ ] API key management for CLI
- [ ] Admin dashboard routes
- [ ] Scan history tracking
- [ ] Subscription management

## 📝 License

MIT License - ATAI Enterprises

## 🤝 Support

For issues or questions, contact: support@vettcode.dev
