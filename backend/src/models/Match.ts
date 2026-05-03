import mongoose, { Schema, Types } from 'mongoose';

export interface MatchDocument extends mongoose.Document {
  users: Types.ObjectId[];
  status: 'matched' | 'unmatched';
  compatibilityScore: number;
  matchedAt: Date;
}

const matchSchema = new Schema<MatchDocument>(
  {
    users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    status: { type: String, enum: ['matched', 'unmatched'], default: 'matched' },
    compatibilityScore: { type: Number, required: true },
    matchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

matchSchema.index({ users: 1 });

export const Match = mongoose.model<MatchDocument>('Match', matchSchema);
