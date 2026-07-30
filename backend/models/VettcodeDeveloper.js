const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vettcodeDeveloperSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['developer', 'admin'],
      default: 'developer',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    profile: {
      avatar: {
        type: String,
        default: null,
      },
      bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
      },
      website: {
        type: String,
      },
      github: {
        type: String,
      },
      linkedin: {
        type: String,
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free',
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'expired'],
        default: 'active',
      },
    },
    scanStats: {
      totalScans: {
        type: Number,
        default: 0,
      },
      lastScanDate: {
        type: Date,
      },
      vulnerabilitiesFound: {
        type: Number,
        default: 0,
      },
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
vettcodeDeveloperSchema.index({ email: 1 });
vettcodeDeveloperSchema.index({ createdAt: -1 });

// Hash password before saving
vettcodeDeveloperSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('password')) return next();

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password is correct
vettcodeDeveloperSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Method to generate API key
vettcodeDeveloperSchema.methods.generateApiKey = function () {
  const crypto = require('crypto');
  this.apiKey = `vettcode_${crypto.randomBytes(32).toString('hex')}`;
  return this.apiKey;
};

// Method to update login stats
vettcodeDeveloperSchema.methods.updateLoginStats = async function () {
  this.lastLogin = new Date();
  this.loginCount += 1;
  await this.save({ validateBeforeSave: false });
};

// Virtual for full profile URL
vettcodeDeveloperSchema.virtual('profileUrl').get(function () {
  return `/developers/${this._id}`;
});

// Method to get public profile
vettcodeDeveloperSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified,
    profile: this.profile,
    subscription: this.subscription,
    scanStats: this.scanStats,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
  };
};

const VettcodeDeveloper = mongoose.model('VettcodeDeveloper', vettcodeDeveloperSchema);

module.exports = VettcodeDeveloper;
