import mongoose, { Document, Schema, Model } from 'mongoose';
import crypto from 'crypto';

// Interface for the device auth document
export interface IDeviceAuth extends Document {
  deviceCode: string;
  userCode: string;
  status: 'pending' | 'approved' | 'expired' | 'rejected';
  developerId?: mongoose.Types.ObjectId;
  token?: string;
  expiresAt: Date;
  approvedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the model static methods
interface IDeviceAuthModel extends Model<IDeviceAuth> {
  generateDeviceCode(): string;
  generateUserCode(): string;
  createSession(): Promise<IDeviceAuth>;
  cleanupExpired(): Promise<any>;
}

const deviceAuthSchema = new Schema<IDeviceAuth, IDeviceAuthModel>(
  {
    deviceCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'expired', 'rejected'],
      default: 'pending',
      index: true,
    },
    developerId: {
      type: Schema.Types.ObjectId,
      ref: 'VettcodeDeveloper',
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Static method: Generate random device code (long, secure)
deviceAuthSchema.static('generateDeviceCode', function (): string {
  return crypto.randomBytes(32).toString('hex'); // 64 chars
});

// Static method: Generate user-friendly user code (short, easy to type)
deviceAuthSchema.static('generateUserCode', function (): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    if (i === 3) code += '-'; // Format: ABC-123
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
});

// Static method: Create new device auth session
deviceAuthSchema.static('createSession', async function (): Promise<IDeviceAuth> {
  const DeviceAuthModel = this as IDeviceAuthModel;
  const deviceCode = DeviceAuthModel.generateDeviceCode();
  const userCode = DeviceAuthModel.generateUserCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  const session = await DeviceAuthModel.create({
    deviceCode,
    userCode,
    expiresAt,
  });

  return session;
});

// Static method: Cleanup expired sessions (call this periodically)
deviceAuthSchema.static('cleanupExpired', async function () {
  const result = await this.updateMany(
    {
      status: 'pending',
      expiresAt: { $lt: new Date() },
    },
    {
      status: 'expired',
    }
  );
  return result;
});

// Pre-hook: Auto-expire on query (REMOVED - causes issues with findOne)
// Cleanup is handled by cleanupExpired() method instead

// Index for automatic cleanup (MongoDB TTL index) - removed duplicate declaration
// TTL index is declared inline in the schema above

const DeviceAuth: IDeviceAuthModel =
  (mongoose.models.DeviceAuth as IDeviceAuthModel) ||
  mongoose.model<IDeviceAuth, IDeviceAuthModel>('DeviceAuth', deviceAuthSchema);

export default DeviceAuth;
