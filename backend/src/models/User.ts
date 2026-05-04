import mongoose, { Schema, Types } from 'mongoose';

export type TravelStyle = 'backpacker' | 'budget' | 'midrange' | 'luxury';
export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ReviewStatus = 'not-submitted' | 'pending' | 'approved' | 'rejected';

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
  accountStatus: AccountStatus;
  verificationStatus: ReviewStatus;
  photoVerificationStatus: ReviewStatus;
  verificationSubmission?: {
    profilePhoto?: string;
    verificationSelfie?: string;
    idDocument?: string;
    note?: string;
    submittedAt?: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
  };
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
    accountStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending'
    },
    verificationStatus: {
      type: String,
      enum: ['not-submitted', 'pending', 'approved', 'rejected'],
      default: 'not-submitted'
    },
    photoVerificationStatus: {
      type: String,
      enum: ['not-submitted', 'pending', 'approved', 'rejected'],
      default: 'not-submitted'
    },
    verificationSubmission: {
      profilePhoto: String,
      verificationSelfie: String,
      idDocument: String,
      note: String,
      submittedAt: Date,
      reviewedAt: Date,
      rejectionReason: String
    },
    onboardingCompleted: { type: Boolean, default: false },
    trustScore: { type: Number, default: 4.5 }
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', userSchema);
