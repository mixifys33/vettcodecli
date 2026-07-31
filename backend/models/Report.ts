import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IReport extends Document {
  developerId: mongoose.Types.ObjectId;
  projectName: string;
  score: number;
  grade: string;
  summary: string;
  findings: any[];
  totalFindings: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  infoFindings: number;
  metadata: {
    cliVersion?: string;
    scanDuration?: number;
    filesScanned?: number;
    linesOfCode?: number;
    technologies?: string[];
  };
  reportUrl?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    developerId: {
      type: Schema.Types.ObjectId,
      ref: 'VettcodeDeveloper',
      required: true,
      index: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D', 'F'],
    },
    summary: {
      type: String,
      required: true,
    },
    findings: {
      type: Array,
      default: [],
    },
    totalFindings: {
      type: Number,
      default: 0,
    },
    criticalFindings: {
      type: Number,
      default: 0,
    },
    highFindings: {
      type: Number,
      default: 0,
    },
    mediumFindings: {
      type: Number,
      default: 0,
    },
    lowFindings: {
      type: Number,
      default: 0,
    },
    infoFindings: {
      type: Number,
      default: 0,
    },
    metadata: {
      cliVersion: String,
      scanDuration: Number,
      filesScanned: Number,
      linesOfCode: Number,
      technologies: [String],
    },
    reportUrl: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
reportSchema.index({ developerId: 1, createdAt: -1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic deletion

// Virtual for checking if report is expired
reportSchema.virtual('isExpired').get(function () {
  return this.expiresAt < new Date();
});

const Report: Model<IReport> =
  mongoose.models.Report || mongoose.model<IReport>('Report', reportSchema);

export default Report;
