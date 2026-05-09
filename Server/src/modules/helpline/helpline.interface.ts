import { Types } from 'mongoose';

export type IHelpline = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  userId?: Types.ObjectId;
  status: 'pending' | 'in-progress' | 'resolved';
  adminReply?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
