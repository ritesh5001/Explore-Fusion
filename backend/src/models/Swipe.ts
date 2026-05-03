import mongoose, { Schema, Types } from 'mongoose';

export interface SwipeDocument extends mongoose.Document {
  swiper: Types.ObjectId;
  target: Types.ObjectId;
  action: 'left' | 'right' | 'super';
  compatibilityScore: number;
}

const swipeSchema = new Schema<SwipeDocument>(
  {
    swiper: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    target: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['left', 'right', 'super'], required: true },
    compatibilityScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

swipeSchema.index({ swiper: 1, target: 1 }, { unique: true });

export const Swipe = mongoose.model<SwipeDocument>('Swipe', swipeSchema);
