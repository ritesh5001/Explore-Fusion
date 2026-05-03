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

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl }),
  endpoints: (builder) => ({
    getDiscoverProfiles: builder.query<{ profiles: DiscoverProfile[] }, void>({
      query: () => '/api/match/discover'
    }),
    getTrips: builder.query<{ trips: GroupTrip[] }, void>({
      query: () => '/api/trips'
    })
  })
});

export const { useGetDiscoverProfilesQuery, useGetTripsQuery } = api;
