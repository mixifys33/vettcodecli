# CLI Authentication 500 Error - Root Cause & Fix

## Problem Summary

When running `vettcode login`, the CLI displays "Authentication failed" with a 500 error after creating the session:

```
√ Authentication session created
× Authentication failed
Error: Request failed with status code 500
```

## Root Cause

The backend API routes were failing because **MongoDB environment variables were not configured in Vercel**.

### Why This Happened

1. **Environment Setup Issue**
   - `.env.local` exists in vettcode-cli-landing (for local development)
   - Vercel does NOT automatically load `.env.local` files
   - Without env vars set in Vercel dashboard, `MONGODB_URI` is undefined
   - Routes fail silently when trying to connect to MongoDB

2. **Silent Failure Chain**

   ```
   POST /api/cli/auth/start
     └─> await connectDatabase()
         └─> process.env.MONGODB_URI is undefined
             └─> MongoDB connection fails
                 └─> DeviceAuth.createSession() throws error
                     └─> Caught by try/catch
                         └─> Returns 500 with generic error message
   ```

3. **Poor Error Messages**
   - Original routes caught all errors broadly
   - Didn't distinguish between DB errors, validation errors, or logic errors
   - Returned `error.message` which was often undefined/empty

## Fixes Applied ✅

### 1. Database Connection Improvements (`backend/config/database.js`)

```javascript
// Now checks if already connected to prevent duplicate connections
if (mongoose.connection.readyState === 1) {
  return mongoose.connection;
}

// Removes deprecated MongoDB options that cause warnings
// (useNewUrlParser, useUnifiedTopology)

// Throws errors instead of calling process.exit()
// Allows routes to handle errors gracefully
```

### 2. Enhanced Error Handling in Auth Routes

All three auth routes now:

- Catch database connection errors specifically (ECONNREFUSED, getaddrinfo)
- Return **503 Service Unavailable** for DB connection issues (not 500)
- Return **500 Internal Server Error** for other failures
- Provide detailed error messages in logs
- Use safe property access: `error?.message` instead of `error.message`

**Example:**

```typescript
catch (error: any) {
  if (error?.message?.includes('connect ECONNREFUSED')) {
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error?.message,
    }, { status: 503 });  // ← Better HTTP status
  }
  // ...
}
```

### 3. Force Dynamic Routing

All three auth routes now have:

```typescript
export const dynamic = "force-dynamic";
```

- Required because routes use `request.url` (GET /api/cli/auth/status)
- Required because POST routes perform mutations
- Prevents Next.js build errors

## What You Need to Do

### CRITICAL: Configure Environment Variables in Vercel

1. **Go to Vercel Project Settings**
   - https://vercel.com/projects → Select vettcodecli project
   - Settings → Environment Variables

2. **Add These Variables** (get values from `.env.local`):

   ```
   MONGODB_URI=mongodb+srv://easyshop:HackerX123456@cluster0.pv3uslj.mongodb.net/vettcode-developers?retryWrites=true&w=majority&appName=Cluster0&ssl=true&tlsAllowInvalidCertificates=true

   JWT_SECRET=b633187483a11e0a36b.d820*ccd686f^8e443131$9009944e%bf298!c7f04cadb@d815
   JWT_EXPIRE=30d

   NEXT_PUBLIC_API_URL=https://vettcodecli.vercel.app/

   GOOGLE_CLIENT_ID=730508780764-i7joh8sqs4jjp4cach9q5dtabkj70smu.apps.googleusercontent.com
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=730508780764-i7joh8sqs4jjp4cach9q5dtabkj70smu.apps.googleusercontent.com
   ```

3. **Set Environment to:** Production (or both Production & Preview)

4. **Redeploy Vercel**
   - Go to Deployments → Redeploy latest commit
   - Or push a new commit to trigger auto-deploy

### Testing Locally

If testing locally with `npm run dev`:

1. Create a `.env.local` file with the same variables
2. Run `npm run dev`
3. Test with: `node dist/cli.js login`

## How the Flow Works (After Fix)

```
CLI User                    Backend API              MongoDB
[vettcode login]
    |
    +--POST /api/cli/auth/start
                    |
                    ✅ connectDatabase() succeeds
                    |
                    +--DeviceAuth.createSession()
                    |
                    +--return { device_code, user_code, ... }
    |
    ← { success: true, device_code: "ABC123", user_code: "X7Q-LWL", ... }
    |
    [Display code & open browser]
    |
    [User authorizes in browser]
    |
    +--GET /api/cli/auth/status?device_code=ABC123
                    |
                    ✅ connectDatabase() succeeds
                    |
                    +--DeviceAuth.findOne()
                    |
                    +--return { status: "approved", token: "...", developer: {...} }
    |
    ← { success: true, status: "approved", token: "...", ... }
    |
    [Save token to local storage]
    |
    ✅ Authentication successful!
```

## Debugging Commands

If you get a 503 error after setting env vars:

```bash
# Check MongoDB connection on Vercel
curl https://vettcodecli.vercel.app/api/health

# View Vercel function logs
vercel logs --follow

# Check env vars are set
vercel env ls
```

## Files Changed

- `app/api/cli/auth/start/route.ts` - Better error handling + force-dynamic
- `app/api/cli/auth/status/route.ts` - Better error handling + force-dynamic
- `app/api/cli/auth/verify/route.ts` - Better error handling + force-dynamic
- `backend/config/database.js` - Connection state checking + no process.exit()

## Security Note

⚠️ **DO NOT COMMIT** the `.env` file with API keys to GitHub.

- `.env.local` is for local development (in `.gitignore`)
- Set secrets in Vercel dashboard only
- GitHub will block pushes with exposed secrets anyway
