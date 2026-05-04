import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface DiscoverProfile {
  id: string;
  name: string;
  age?: number;
  homeCity?: string;
  bio?: string;
  travelStyle: string;
  interests: string[];
  budgetMin: number;
  budgetMax: number;
  isVerified: boolean;
  trustScore: number;
  compatibilityScore: number;
}

export interface GroupTrip {
  id?: string;
  _id?: string;
  destination: string;
  dates?: string;
  startDate?: string;
  endDate?: string;
  members?: number;
  maxMembers: number;
  status: string;
}

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  homeCity?: string;
  accountStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  verificationStatus?: 'not-submitted' | 'pending' | 'approved' | 'rejected';
  photoVerificationStatus?: 'not-submitted' | 'pending' | 'approved' | 'rejected';
  isVerified?: boolean;
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  token: string;
  user: AppUser;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  homeCity: string;
  gender?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface OnboardingInput {
  bio: string;
  travelStyle: string;
  interests: string[];
  languages: string[];
  budgetMin: number;
  budgetMax: number;
  preferredDuration: string;
  companionPreference: string;
  dreamDestinations: string[];
  tripPlans: Array<{
    destination: string;
    startDate: string;
    endDate: string;
  }>;
  verificationSubmission: {
    profilePhoto: string;
    verificationSelfie: string;
    idDocument?: string;
    note?: string;
  };
}

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterInput>({
      query: (body) => ({
        url: '/api/auth/register',
        method: 'POST',
        body
      })
    }),
    login: builder.mutation<AuthResponse, LoginInput>({
      query: (body) => ({
        url: '/api/auth/login',
        method: 'POST',
        body
      })
    }),
    completeOnboarding: builder.mutation<AppUser, { token: string; input: OnboardingInput }>({
      query: ({ token, input }) => ({
        url: '/api/profile/onboarding',
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: input
      })
    }),
    getDiscoverProfiles: builder.query<{ profiles: DiscoverProfile[] }, string>({
      query: (token) => ({
        url: '/api/match/discover',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    }),
    getTrips: builder.query<{ trips: GroupTrip[] }, string>({
      query: (token) => ({
        url: '/api/trips',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    })
  })
});

export const {
  useCompleteOnboardingMutation,
  useGetDiscoverProfilesQuery,
  useGetTripsQuery,
  useLoginMutation,
  useRegisterMutation
} = api;
