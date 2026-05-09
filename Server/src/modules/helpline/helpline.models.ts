import { Schema, model } from 'mongoose';
import { IHelpline } from './helpline.interface';

const helplineSchema = new Schema<IHelpline>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending',
    },
    adminReply: { type: String },
    repliedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export const Helpline = model<IHelpline>('Helpline', helplineSchema);
