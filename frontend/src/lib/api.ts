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

export interface AppUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  homeCity?: string;
  gender?: string;
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
}

export interface DestinationsResponse {
  destinations: string[];
}

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(error.message ?? 'Request failed');
  }

  return (await response.json()) as T;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function completeOnboarding(token: string, input: OnboardingInput): Promise<AppUser> {
  return request<AppUser>('/api/profile/onboarding', {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(input)
  });
}

export async function getDiscoverProfiles(token: string): Promise<DiscoverProfile[]> {
  const data = await request<{ profiles: DiscoverProfile[] }>('/api/match/discover', {
    headers: authHeaders(token)
  });
  return data.profiles;
}

export async function getTrips(token: string): Promise<GroupTrip[]> {
  const data = await request<{ trips: GroupTrip[] }>('/api/trips', {
    headers: authHeaders(token)
  });
  return data.trips;
}

export async function getDestinations(query?: string): Promise<string[]> {
  const search = query ? `?q=${encodeURIComponent(query)}` : '';
  const data = await request<DestinationsResponse>(`/api/destinations${search}`);
  return data.destinations;
}
