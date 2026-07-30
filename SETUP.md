# VettCode CLI Landing - Setup Instructions

## 🚀 Complete Authentication System Setup

This project now has a complete authentication system with:

- ✅ Email/Password login and signup
- ✅ Google Sign-In (OAuth)
- ✅ MongoDB database (VettcodeDeveloper model)
- ✅ JWT authentication
- ✅ Unified .env configuration

---

## 📁 Project Structure

```
vettcode-cli-landing/
├── .env.local                    # ✅ UNIFIED config (used by frontend, backend, CLI)
├── app/
│   ├── login/page.tsx           # Login page with Google Sign-In
│   ├── signup/page.tsx          # Signup page with Google Sign-In
│   └── atai/page.tsx            # ATAI Enterprises page
├── backend/
│   ├── models/
│   │   └── VettcodeDeveloper.js # MongoDB developer model
│   ├── routes/
│   │   ├── developerAuth.js     # Email/password auth routes
│   │   └── googleAuth.js        # Google OAuth routes
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT middleware
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── server.js                # Express server
│   └── package.json             # Backend dependencies
├── components/
│   └── GoogleSignInButton.tsx   # Reusable Google Sign-In
└── lib/
    └── api-config.ts            # API configuration
```

---

## 🔧 Installation Steps

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Required packages will include:

- express
- mongoose
- bcryptjs
- jsonwebtoken
- google-auth-library
- cors
- dotenv

### 3. Configure Environment Variables

The `.env.local` file in the root directory is already configured with:

- ✅ MongoDB Atlas connection
- ✅ JWT secrets
- ✅ Google OAuth Client ID
- ✅ Email (Gmail SMTP) configuration
- ✅ OpenRouter & Groq AI API keys
- ✅ Redis configuration
- ✅ ImageKit configuration

**No changes needed!** All credentials are already set up.

---

## 🏃 Running the Application

### Terminal 1: Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: `http://localhost:5001`

### Terminal 2: Start Frontend (Next.js)

```bash
npm run dev
```

Frontend will run on: `http://localhost:3000`

---

## 🗄️ Database Setup

### MongoDB Atlas (Already Configured)

- Database: `vettcode-developers`
- Collection: `vettcodedevelopers`
- Connection string is in `.env.local`

The database will be automatically created when the first user signs up!

---

## 🔐 Authentication Features

### Email/Password Authentication

- **Signup**: `/signup`
  - Name, email, password validation
  - Password strength indicator
  - Stores hashed password in MongoDB
- **Login**: `/login`
  - Email/password verification
  - JWT token generation
  - Login statistics tracking

### Google Sign-In

- **One-Click Sign-In**: Works on both `/login` and `/signup`
- Uses Google Identity Services (only needs Client ID)
- Auto-creates account if user doesn't exist
- Email is pre-verified for Google users

### Storage

- JWT token stored in localStorage: `vettcode_token`
- Developer data stored in localStorage: `vettcode_developer`
- Auth status flag: `vettcode_authenticated`

---

## 📡 API Endpoints

### Developer Authentication (`/api/developer-auth`)

| Method | Endpoint          | Description                       |
| ------ | ----------------- | --------------------------------- |
| POST   | `/signup`         | Register with email/password      |
| POST   | `/login`          | Login with email/password         |
| GET    | `/me`             | Get current developer (protected) |
| PUT    | `/update-profile` | Update profile (protected)        |
| GET    | `/stats`          | Get developer stats (protected)   |
| POST   | `/logout`         | Logout developer                  |

### Google Authentication (`/api/google-auth`)

| Method | Endpoint  | Description                        |
| ------ | --------- | ---------------------------------- |
| POST   | `/verify` | Verify Google token & login/signup |
| GET    | `/config` | Get Google Client ID               |

---

## 👤 VettcodeDeveloper Model

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "developer" | "admin",
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
    plan: "free" | "pro" | "enterprise",
    status: String,
    startDate: Date,
    endDate: Date
  },
  scanStats: {
    totalScans: Number,
    lastScanDate: Date,
    vulnerabilitiesFound: Number
  },
  lastLogin: Date,
  loginCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing the Authentication

### Test Email/Password Signup

1. Go to `http://localhost:3000/signup`
2. Fill in the form
3. Click "Create Account"
4. Should redirect to home page

### Test Google Sign-In

1. Go to `http://localhost:3000/login`
2. Click "Sign in with Google" button
3. Select your Google account
4. Should redirect to home page

### Test Login

1. Go to `http://localhost:3000/login`
2. Enter your credentials
3. Click "Sign In"
4. Should redirect to home page

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ JWT token validation
- ✅ CORS protection (multiple origins supported)
- ✅ Input validation
- ✅ Protected routes with middleware
- ✅ Email verification support (ready)
- ✅ Password reset token support (ready)

---

## 🌐 CORS Configuration

Frontend URLs allowed:

- `https://vettcodecli.vercel.app`
- `https://vetted-xi.vercel.app`
- `http://localhost:3000`

---

## 📝 Notes

### Google OAuth Setup

- Only requires `GOOGLE_CLIENT_ID` (no secret needed)
- Uses Google Identity Services
- Token verification happens server-side

### Unified .env File

- **ONE** `.env.local` file at root
- Used by frontend, backend, and CLI
- No separate backend .env file needed

### Production Deployment

- Update `NEXT_PUBLIC_API_URL` in `.env.local` to production backend URL
- Update `FRONTEND_URL` to include production frontend URL
- Use environment variables in Vercel/deployment platform

---

## 🐛 Troubleshooting

### Backend won't start

- Make sure MongoDB Atlas connection string is correct
- Check if port 5001 is available
- Run `npm install` in backend folder

### Google Sign-In not working

- Verify `GOOGLE_CLIENT_ID` is correct
- Check browser console for errors
- Make sure you're on http://localhost:3000 (not 127.0.0.1)

### CORS errors

- Make sure backend is running on port 5001
- Check `FRONTEND_URL` in `.env.local`
- Verify frontend is making requests to correct API URL

---

## ✅ What's Working

- ✅ Email/Password signup and login
- ✅ Google Sign-In (OAuth)
- ✅ MongoDB connection and storage
- ✅ JWT authentication
- ✅ Profile management
- ✅ Login statistics tracking
- ✅ Beautiful UI with animations
- ✅ Password strength indicator
- ✅ Error handling
- ✅ Unified environment configuration

---

## 🚀 Ready to Deploy!

Your authentication system is fully functional and ready for testing and deployment!

**Need help?** Check the backend README.md for more details.
