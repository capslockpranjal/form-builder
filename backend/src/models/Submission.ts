import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmissionField {
  fieldId: string;
  value: any;
  fieldType: string;
}

export interface ISubmission extends Document {
  formId: mongoose.Types.ObjectId;
  fields: ISubmissionField[];
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    submittedAt: Date;
  };
  status: 'pending' | 'processed' | 'failed';
  processedAt?: Date;
}

const SubmissionFieldSchema = new Schema<ISubmissionField>({
  fieldId: { type: String, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  fieldType: { type: String, required: true }
});

const SubmissionSchema = new Schema<ISubmission>({
  formId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Form', 
    required: true 
  },
  fields: [SubmissionFieldSchema],
  metadata: {
    ipAddress: { type: String },
    userAgent: { type: String },
    referrer: { type: String },
    submittedAt: { type: Date, default: Date.now }
  },
  status: { 
    type: String, 
    enum: ['pending', 'processed', 'failed'], 
    default: 'pending' 
  },
  processedAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for better query performance
SubmissionSchema.index({ formId: 1, createdAt: -1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ 'metadata.submittedAt': -1 });

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
