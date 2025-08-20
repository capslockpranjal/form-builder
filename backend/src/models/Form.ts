import mongoose, { Document, Schema } from 'mongoose';

export interface IFormField {
  id: string;
  type: 'text' | 'email' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  options?: string[]; // For select, radio, checkbox
  fileTypes?: string[]; // For file uploads
  maxFileSize?: number;
  order: number;
}

export interface IForm extends Document {
  title: string;
  description?: string;
  fields: IFormField[];
  settings: {
    thankYouMessage?: string;
    submissionLimit?: number;
    allowMultipleSubmissions: boolean;
    redirectUrl?: string;
    isMultiStep: boolean;
    steps?: string[];
  };
  status: 'draft' | 'published';
  submissions: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  createdBy?: string;
}

const FormFieldSchema = new Schema<IFormField>({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['text', 'email', 'select', 'checkbox', 'radio', 'textarea', 'file'] 
  },
  label: { type: String, required: true },
  placeholder: { type: String },
  required: { type: Boolean, default: false },
  validation: {
    minLength: { type: Number },
    maxLength: { type: Number },
    pattern: { type: String },
    min: { type: Number },
    max: { type: Number }
  },
  options: [{ type: String }],
  fileTypes: [{ type: String }],
  maxFileSize: { type: Number },
  order: { type: Number, required: true }
});

const FormSchema = new Schema<IForm>({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  fields: [FormFieldSchema],
  settings: {
    thankYouMessage: { type: String, default: 'Thank you for your submission!' },
    submissionLimit: { type: Number },
    allowMultipleSubmissions: { type: Boolean, default: true },
    redirectUrl: { type: String },
    isMultiStep: { type: Boolean, default: false },
    steps: [{ type: String }]
  },
  status: { 
    type: String, 
    required: true, 
    enum: ['draft', 'published'], 
    default: 'draft' 
  },
  submissions: { type: Number, default: 0 },
  createdBy: { type: String },
  publishedAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for better query performance
FormSchema.index({ status: 1, createdAt: -1 });
FormSchema.index({ createdBy: 1 });
FormSchema.index({ title: 'text', description: 'text' });

export const Form = mongoose.model<IForm>('Form', FormSchema);
