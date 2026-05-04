import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface TripPlan {
  destination: string;
  startDate: string;
  endDate: string;
}

export interface VerificationSubmission {
  profilePhoto?: string;
  verificationSelfie?: string;
  idDocument?: string;
  note?: string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  homeCity?: string;
  gender?: string;
  dateOfBirth?: string;
  bio?: string;
  photos?: string[];
  travelStyle?: string;
  interests?: string[];
  languages?: string[];
  budgetMin?: number;
  budgetMax?: number;
  preferredDuration?: string;
  companionPreference?: string;
  dreamDestinations?: string[];
  tripPlans?: TripPlan[];
  accountStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  verificationStatus?: 'not-submitted' | 'pending' | 'approved' | 'rejected';
  photoVerificationStatus?: 'not-submitted' | 'pending' | 'approved' | 'rejected';
  verificationSubmission?: VerificationSubmission;
  isVerified?: boolean;
  trustScore?: number;
  onboardingCompleted: boolean;
}

export interface DiscoverProfile {
  id: string;
  _id?: string;
  name: string;
  age?: number;
  homeCity?: string;
  gender?: string;
  bio?: string;
  photos?: string[];
  travelStyle: string;
  interests: string[];
  languages: string[];
  budgetMin: number;
  budgetMax: number;
  dreamDestinations: string[];
  upcomingTrip?: string;
  isVerified: boolean;
  trustScore: number;
  compatibilityScore: number;
}

export interface MatchUser extends AppUser {}

export interface MatchRecord {
  _id: string;
  users: MatchUser[];
  status: 'matched' | 'unmatched';
  compatibilityScore: number;
  matchedAt: string;
}

export interface MessageRecord {
  _id: string;
  match: string;
  sender: string;
  body: string;
  type: 'text' | 'photo' | 'voice' | 'location' | 'document';
  createdAt: string;
}

export interface GroupTrip {
  id?: string;
  _id?: string;
  destination: string;
  dates?: string;
  startDate?: string;
  endDate?: string;
  members?: Array<Pick<AppUser, '_id' | 'name' | 'photos' | 'homeCity' | 'isVerified'>> | number;
  creator?: Pick<AppUser, '_id' | 'name' | 'photos' | 'homeCity' | 'isVerified'>;
  tripType?: 'solo_buddy' | 'group';
  maxMembers: number;
  status: string;
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
  dateOfBirth?: string;
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

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  homeCity?: string;
  bio?: string;
  photos?: string[];
  travelStyle?: 'backpacker' | 'budget' | 'midrange' | 'luxury';
  interests?: string[];
  languages?: string[];
  budgetMin?: number;
  budgetMax?: number;
  preferredDuration?: string;
  companionPreference?: string;
  dreamDestinations?: string[];
  tripPlans?: TripPlan[];
}

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl }),
  tagTypes: ['Profile', 'Discover', 'Matches', 'Messages', 'Trips', 'Destinations'],
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
        headers: authHeaders(token),
        body: input
      }),
      invalidatesTags: ['Profile', 'Discover']
    }),
    getProfile: builder.query<AppUser, string>({
      query: (token) => ({
        url: '/api/profile/me',
        headers: authHeaders(token)
      }),
      providesTags: ['Profile']
    }),
    updateProfile: builder.mutation<AppUser, { token: string; input: UpdateProfileInput }>({
      query: ({ token, input }) => ({
        url: '/api/profile/me',
        method: 'PUT',
        headers: authHeaders(token),
        body: input
      }),
      invalidatesTags: ['Profile', 'Discover', 'Matches']
    }),
    getPublicProfile: builder.query<MatchUser, { token: string; userId: string }>({
      query: ({ token, userId }) => ({
        url: `/api/profile/${userId}`,
        headers: authHeaders(token)
      })
    }),
    getDiscoverProfiles: builder.query<{ profiles: DiscoverProfile[] }, string>({
      query: (token) => ({
        url: '/api/match/discover',
        headers: authHeaders(token)
      }),
      providesTags: ['Discover']
    }),
    swipeUser: builder.mutation<{ match: MatchRecord | null }, { token: string; targetUserId: string; action: 'left' | 'right' | 'super'; compatibilityScore: number }>({
      query: ({ token, ...body }) => ({
        url: '/api/match/swipe',
        method: 'POST',
        headers: authHeaders(token),
        body
      }),
      invalidatesTags: ['Discover', 'Matches']
    }),
    getMatches: builder.query<{ matches: MatchRecord[] }, string>({
      query: (token) => ({
        url: '/api/match/matches',
        headers: authHeaders(token)
      }),
      providesTags: ['Matches']
    }),
    getMessages: builder.query<{ messages: MessageRecord[] }, { token: string; matchId: string }>({
      query: ({ token, matchId }) => ({
        url: `/api/chat/${matchId}/messages`,
        headers: authHeaders(token)
      }),
      providesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg.matchId }]
    }),
    sendMessage: builder.mutation<{ message: MessageRecord }, { token: string; matchId: string; body: string }>({
      query: ({ token, matchId, body }) => ({
        url: `/api/chat/${matchId}/messages`,
        method: 'POST',
        headers: authHeaders(token),
        body: { body }
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg.matchId }]
    }),
    getTrips: builder.query<{ trips: GroupTrip[] }, string>({
      query: (token) => ({
        url: '/api/trips',
        headers: authHeaders(token)
      }),
      providesTags: ['Trips']
    }),
    createTrip: builder.mutation<GroupTrip, { token: string; destination: string; startDate: string; endDate: string; tripType: 'solo_buddy' | 'group'; maxMembers: number }>({
      query: ({ token, ...body }) => ({
        url: '/api/trips',
        method: 'POST',
        headers: authHeaders(token),
        body
      }),
      transformResponse: (response: { trip: GroupTrip }) => response.trip,
      invalidatesTags: ['Trips']
    }),
    joinTrip: builder.mutation<GroupTrip, { token: string; tripId: string }>({
      query: ({ token, tripId }) => ({
        url: `/api/trips/${tripId}/join`,
        method: 'POST',
        headers: authHeaders(token)
      }),
      transformResponse: (response: { trip: GroupTrip }) => response.trip,
      invalidatesTags: ['Trips']
    }),
    getDestinations: builder.query<{ destinations: string[] }, string | void>({
      query: (search) => ({
        url: search ? `/api/destinations?q=${encodeURIComponent(search)}` : '/api/destinations'
      }),
      providesTags: ['Destinations']
    })
  })
});

export const {
  useCompleteOnboardingMutation,
  useCreateTripMutation,
  useGetDestinationsQuery,
  useGetDiscoverProfilesQuery,
  useGetMatchesQuery,
  useGetMessagesQuery,
  useGetProfileQuery,
  useGetPublicProfileQuery,
  useGetTripsQuery,
  useJoinTripMutation,
  useLoginMutation,
  useRegisterMutation,
  useSendMessageMutation,
  useSwipeUserMutation,
  useUpdateProfileMutation
} = api;
