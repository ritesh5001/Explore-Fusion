import mongoose, { Schema, Types } from 'mongoose';

export interface MessageDocument extends mongoose.Document {
  match: Types.ObjectId;
  sender: Types.ObjectId;
  body: string;
  type: 'text' | 'photo' | 'voice' | 'location' | 'document';
}

const messageSchema = new Schema<MessageDocument>(
  {
    match: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ['text', 'photo', 'voice', 'location', 'document'], default: 'text' }
  },
  { timestamps: true }
);

export const Message = mongoose.model<MessageDocument>('Message', messageSchema);
