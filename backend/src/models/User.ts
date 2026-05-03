import mongoose, { Schema, Types } from 'mongoose';

export type TravelStyle = 'backpacker' | 'budget' | 'midrange' | 'luxury';
export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export interface TripPlan {
  destination: string;
  startDate: Date;
  endDate: Date;
}

export interface UserDocument extends mongoose.Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  homeCity?: string;
  bio?: string;
  photos: string[];
  travelStyle: TravelStyle;
  interests: string[];
  languages: string[];
  budgetMin: number;
  budgetMax: number;
  preferredDuration?: string;
  companionPreference?: string;
  dreamDestinations: string[];
  tripPlans: TripPlan[];
  isVerified: boolean;
  onboardingCompleted: boolean;
  trustScore: number;
}

const tripPlanSchema = new Schema<TripPlan>(
  {
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  { _id: false }
);

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer-not-to-say']
    },
    homeCity: String,
    bio: String,
    photos: [{ type: String }],
    travelStyle: {
      type: String,
      enum: ['backpacker', 'budget', 'midrange', 'luxury'],
      default: 'budget'
    },
    interests: [{ type: String }],
    languages: [{ type: String }],
    budgetMin: { type: Number, default: 1500 },
    budgetMax: { type: Number, default: 5000 },
    preferredDuration: String,
    companionPreference: String,
    dreamDestinations: [{ type: String }],
    tripPlans: [tripPlanSchema],
    isVerified: { type: Boolean, default: false },
    onboardingCompleted: { type: Boolean, default: false },
    trustScore: { type: Number, default: 4.5 }
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', userSchema);
