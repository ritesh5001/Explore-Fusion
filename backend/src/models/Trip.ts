import mongoose, { Schema, Types } from 'mongoose';

export interface TripDocument extends mongoose.Document {
  creator: Types.ObjectId;
  destination: string;
  startDate: Date;
  endDate: Date;
  tripType: 'solo_buddy' | 'group';
  maxMembers: number;
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled';
  members: Types.ObjectId[];
  tasks: Array<{ title: string; assignee?: Types.ObjectId; done: boolean }>;
  expenses: Array<{ label: string; amount: number; paidBy?: Types.ObjectId }>;
}

const tripSchema = new Schema<TripDocument>(
  {
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tripType: { type: String, enum: ['solo_buddy', 'group'], default: 'solo_buddy' },
    maxMembers: { type: Number, default: 2 },
    status: {
      type: String,
      enum: ['planning', 'confirmed', 'completed', 'cancelled'],
      default: 'planning'
    },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tasks: [
      {
        title: String,
        assignee: { type: Schema.Types.ObjectId, ref: 'User' },
        done: { type: Boolean, default: false }
      }
    ],
    expenses: [
      {
        label: String,
        amount: Number,
        paidBy: { type: Schema.Types.ObjectId, ref: 'User' }
      }
    ]
  },
  { timestamps: true }
);

export const Trip = mongoose.model<TripDocument>('Trip', tripSchema);
