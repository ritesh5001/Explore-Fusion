export interface DiscoverProfile {
  id: string;
  name: string;
  age?: number;
  homeCity?: string;
  gender?: string;
  bio?: string;
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

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export async function getDiscoverProfiles(): Promise<DiscoverProfile[]> {
  const response = await fetch(`${apiUrl}/api/match/discover`);

  if (!response.ok) {
    throw new Error('Unable to load discovery profiles');
  }

  const data = (await response.json()) as { profiles: DiscoverProfile[] };
  return data.profiles;
}

export async function getTrips(): Promise<GroupTrip[]> {
  const response = await fetch(`${apiUrl}/api/trips`);

  if (!response.ok) {
    throw new Error('Unable to load trips');
  }

  const data = (await response.json()) as { trips: GroupTrip[] };
  return data.trips;
}
