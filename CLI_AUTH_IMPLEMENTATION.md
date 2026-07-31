# VettCode CLI Authentication Implementation Guide

## Overview
This document provides a complete guide for implementing browser-based authentication for the VettCode CLI using the Device Authorization Flow (OAuth 2.0 Device Flow).

## Architecture

### Backend Components
1. **DeviceAuth Model** (`backend/models/DeviceAuth.ts`)
   - Stores device authorization sessions
   - Generates secure device codes and user-friendly user codes
   - Handles session expiration and cleanup

2. **CLI Auth Routes** (`backend/routes/cliAuth.ts`)
   - `/api/cli/auth/start` - Initiate authentication
   - `/api/cli/auth/status` - Poll for authorization status
   - `/api/cli/auth/verify` - Approve device (from browser)
   - `/api/cli/auth/revoke` - Revoke device authorization
   - `/api/cli/auth/devices` - List authorized devices

3. **Frontend Auth Page** (`app/cli-auth/page.tsx`)
   - Browser-based authorization UI
   - User enters code from CLI
   - Links CLI device to user account

## Authentication Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│   CLI   │                │ Backend │                │ Browser │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ 1. POST /auth/start      │                          │
     │─────────────────────────>│                          │
     │                          │                          │
     │ 2. device_code + user_code│                         │
     │<─────────────────────────│                          │
     │                          │                          │
     │ 3. Open browser          │                          │
     │──────────────────────────┼─────────────────────────>│
     │                          │                          │
     │                          │ 4. User logs in          │
     │                          │<─────────────────────────│
     │                          │                          │
     │                          │ 5. POST /auth/verify     │
     │                          │<─────────────────────────│
     │                          │                          │
     │ 6. Poll /auth/status     │                          │
     │─────────────────────────>│                          │
     │                          │                          │
     │ 7. Status: approved + JWT│                          │
     │<─────────────────────────│                          │
     │                          │                          │
     │ 8. Store token locally   │                          │
     │                          │                          │
```

## CLI Implementation Guide

### File Structure
```
vettcode-cli/
├── src/
│   ├── auth/
│   │   ├── auth.service.ts      # Main authentication service
│   │   ├── token.manager.ts     # Token storage and management
│   │   └── api.client.ts        # API communication
│   ├── commands/
│   │   ├── login.ts             # Login command
│   │   ├── logout.ts            # Logout command
│   │   └── whoami.ts            # Show current user
│   └── utils/
│       ├── config.ts            # Config file management
│       └── browser.ts           # Open browser utility
└── package.json
```

### 1. Token Manager (`src/auth/token.manager.ts`)

```typescript
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export class TokenManager {
  private configDir: string;
  private configPath: string;

  constructor() {
    this.configDir = path.join(os.homedir(), '.vettcode');
    this.configPath = path.join(this.configDir, 'config.json');
  }

  async ensureConfigDir(): Promise<void> {
    try {
      await fs.access(this.configDir);
    } catch {
      await fs.mkdir(this.configDir, { recursive: true, mode: 0o700 });
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const content = await fs.readFile(this.configPath, 'utf-8');
      const config = JSON.parse(content);
      return config.token || null;
    } catch {
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    await this.ensureConfigDir();
    const config = { token, updatedAt: new Date().toISOString() };
    await fs.writeFile(
      this.configPath,
      JSON.stringify(config, null, 2),
      { mode: 0o600 }
    );
  }

  async clearToken(): Promise<void> {
    try {
      await fs.unlink(this.configPath);
    } catch {
      // File doesn't exist, that's fine
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }
}
```

### 2. API Client (`src/auth/api.client.ts`)

```typescript
import axios, { AxiosInstance } from 'axios';
import { TokenManager } from './token.manager';

export class APIClient {
  private client: AxiosInstance;
  private tokenManager: TokenManager;

  constructor(baseURL: string = 'https://vettcodecli.vercel.app') {
    this.tokenManager = new TokenManager();
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.client.interceptors.request.use(async (config) => {
      const token = await this.tokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async startAuth(): Promise<{
    device_code: string;
    user_code: string;
    verification_url: string;
    expires_in: number;
    interval: number;
  }> {
    const response = await this.client.post('/api/cli/auth/start');
    return response.data;
  }

  async checkStatus(deviceCode: string): Promise<{
    status: 'pending' | 'approved' | 'expired' | 'rejected';
    token?: string;
    developer?: any;
  }> {
    const response = await this.client.get('/api/cli/auth/status', {
      params: { device_code: deviceCode },
    });
    return response.data;
  }

  async revokeAuth(): Promise<void> {
    const token = await this.tokenManager.getToken();
    await this.client.post('/api/cli/auth/revoke', {
      developer_token: token,
    });
  }
}
```

### 3. Auth Service (`src/auth/auth.service.ts`)

```typescript
import open from 'open';
import ora from 'ora';
import chalk from 'chalk';
import { APIClient } from './api.client';
import { TokenManager } from './token.manager';

export class AuthService {
  private api: APIClient;
  private tokenManager: TokenManager;

  constructor() {
    this.api = new APIClient();
    this.tokenManager = new TokenManager();
  }

  async login(): Promise<void> {
    const spinner = ora('Initializing authentication...').start();

    try {
      // Start auth session
      const session = await this.api.startAuth();
      spinner.succeed('Authentication session created');

      // Display user code
      console.log('');
      console.log(chalk.bold.cyan('  Enter this code in your browser:'));
      console.log('');
      console.log(chalk.bold.yellow(`    ${session.user_code}`));
      console.log('');

      // Open browser
      spinner.start('Opening browser...');
      await open(session.verification_url);
      spinner.succeed('Browser opened');

      // Poll for completion
      spinner.start('Waiting for authorization...');
      const token = await this.pollForCompletion(
        session.device_code,
        session.interval,
        session.expires_in
      );

      // Save token
      await this.tokenManager.setToken(token);
      spinner.succeed(chalk.green('Authentication successful!'));
      console.log('');
      console.log(chalk.gray('  You are now logged in to VettCode CLI'));
      console.log('');
    } catch (error: any) {
      spinner.fail('Authentication failed');
      console.error(chalk.red(`  Error: ${error.message}`));
      throw error;
    }
  }

  private async pollForCompletion(
    deviceCode: string,
    interval: number,
    expiresIn: number
  ): Promise<string> {
    const startTime = Date.now();
    const timeout = expiresIn * 1000;

    while (true) {
      // Check timeout
      if (Date.now() - startTime > timeout) {
        throw new Error('Authentication timeout');
      }

      // Check status
      try {
        const status = await this.api.checkStatus(deviceCode);

        if (status.status === 'approved' && status.token) {
          return status.token;
        }

        if (status.status === 'expired') {
          throw new Error('Authentication session expired');
        }

        if (status.status === 'rejected') {
          throw new Error('Authentication was rejected');
        }

        // Still pending, wait and try again
        await this.sleep(interval * 1000);
      } catch (error: any) {
        if (error.response?.data?.status === 'pending') {
          await this.sleep(interval * 1000);
          continue;
        }
        throw error;
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async logout(): Promise<void> {
    const spinner = ora('Logging out...').start();

    try {
      // Revoke on server
      await this.api.revokeAuth();
      
      // Clear local token
      await this.tokenManager.clearToken();
      
      spinner.succeed('Logged out successfully');
    } catch (error) {
      // Even if server revoke fails, clear local token
      await this.tokenManager.clearToken();
      spinner.succeed('Logged out locally');
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return await this.tokenManager.isAuthenticated();
  }
}
```

### 4. CLI Commands

#### Login Command (`src/commands/login.ts`)
```typescript
import { Command } from 'commander';
import { AuthService } from '../auth/auth.service';

export const loginCommand = new Command('login')
  .description('Authenticate with VettCode CLI')
  .action(async () => {
    const authService = new AuthService();
    
    if (await authService.isAuthenticated()) {
      console.log('You are already logged in');
      console.log('Use "vettcode logout" to sign out');
      return;
    }

    await authService.login();
  });
```

#### Logout Command (`src/commands/logout.ts`)
```typescript
import { Command } from 'commander';
import { AuthService } from '../auth/auth.service';

export const logoutCommand = new Command('logout')
  .description('Log out from VettCode CLI')
  .action(async () => {
    const authService = new AuthService();
    
    if (!(await authService.isAuthenticated())) {
      console.log('You are not logged in');
      return;
    }

    await authService.logout();
  });
```

#### Whoami Command (`src/commands/whoami.ts`)
```typescript
import { Command } from 'commander';
import { AuthService } from '../auth/auth.service';
import { APIClient } from '../auth/api.client';
import chalk from 'chalk';

export const whoamiCommand = new Command('whoami')
  .description('Show current logged-in user')
  .action(async () => {
    const authService = new AuthService();
    
    if (!(await authService.isAuthenticated())) {
      console.log(chalk.red('Not logged in'));
      console.log(chalk.gray('Use "vettcode login" to authenticate'));
      return;
    }

    try {
      const api = new APIClient();
      const response = await api.client.get('/api/developer-auth/me');
      const developer = response.data.developer;

      console.log('');
      console.log(chalk.bold.cyan('Logged in as:'));
      console.log(chalk.white(`  Name: ${developer.name}`));
      console.log(chalk.white(`  Email: ${developer.email}`));
      console.log(chalk.white(`  Plan: ${developer.subscription?.plan || 'free'}`));
      console.log('');
    } catch (error) {
      console.error(chalk.red('Failed to fetch user info'));
    }
  });
```

## Required NPM Packages

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "commander": "^11.0.0",
    "ora": "^6.3.0",
    "chalk": "^5.3.0",
    "open": "^9.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Environment Variables

Add to `.env.local`:
```bash
# API Base URL
NEXT_PUBLIC_API_URL=https://vettcodecli.vercel.app

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=30d
```

## Security Considerations

1. **Token Storage**: Config files stored with 0o600 permissions (owner read/write only)
2. **Code Expiration**: Device codes expire after 5 minutes
3. **Secure Generation**: Device codes use crypto.randomBytes for security
4. **JWT Validation**: All endpoints validate JWT tokens
5. **HTTPS Only**: All API communication over HTTPS

## Testing

### Manual Testing Flow

1. Start backend server
2. Run CLI login command
3. Browser opens automatically
4. Enter user code in browser
5. CLI receives token and saves locally
6. Run protected commands with token

### Test Commands
```bash
# Login
vettcode login

# Check status
vettcode whoami

# Logout
vettcode logout
```

## Deployment Checklist

- [ ] Deploy backend with CLI auth routes
- [ ] Set environment variables in Vercel
- [ ] Test authentication flow end-to-end
- [ ] Verify token storage and retrieval
- [ ] Test logout and token revocation
- [ ] Ensure CORS headers allow CLI domain

## Next Steps

1. Implement token refresh mechanism
2. Add multi-device management in dashboard
3. Add "Remember this device" option
4. Implement API rate limiting per device
5. Add device usage analytics

## Support

For issues or questions, contact the VettCode team or open an issue on GitHub.
