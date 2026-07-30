# Vercel Environment Variables Setup

Add these environment variables in your Vercel Dashboard:
**Settings > Environment Variables**

## Required Variables:

```
MONGODB_URI=mongodb+srv://easyshop:HackerX123456@cluster0.pv3uslj.mongodb.net/vettcode-developers?retryWrites=true&w=majority&appName=Cluster0&ssl=true&tlsAllowInvalidCertificates=true

JWT_SECRET=b633187483a11e0a36b.d820*ccd686f^8e443131$9009944e%bf298!c7f04cadb@d815

JWT_EXPIRE=30d

REFRESH_TOKEN_SECRET=f11bfacd3bba3908548396cd6e2e65d013ea9bb90990a25c2aaf48ef815590ccda5531c1a7174bc98c6c0dc48f7709fd997df6944e68a002f7f95086a2de0c55

ACCESS_TOKEN_SECRET=7ce50bab0bdf7717a7db0c1472b9345feb53eb61cd33d4071e5080803bca00dfb8d9de1de144d13977ec1e43766cb9e4c4fe7a09a04396445afa0095b92baee0

GOOGLE_CLIENT_ID=730508780764-i7joh8sqs4jjp4cach9q5dtabkj70smu.apps.googleusercontent.com

NEXT_PUBLIC_GOOGLE_CLIENT_ID=730508780764-i7joh8sqs4jjp4cach9q5dtabkj70smu.apps.googleusercontent.com

OPENROUTER_API_KEY=<your-key-here>

GROQ_API_KEY=<your-key-here>
```

## Optional (for email features):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=p4147176@gmail.com
SMTP_PASS=<your-app-password>
FROM_EMAIL=p4147176@gmail.com
FROM_NAME=VettCode
```

---

**Note:** Copy these values from your local `.env.local` file and paste them one by one in Vercel.
