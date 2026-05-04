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

export interface GroupTrip {
  id?: string;
  _id?: string;
  destination: string;
  dates?: string;
  startDate?: string;
  endDate?: string;
  members?: number;
  creator?: AppUser;
  tripType?: 'solo_buddy' | 'group';
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
  photos?: string[];
  accountStatus?: 'pending' | 'approved' | 'rejected' | 'suspended';
  verificationStatus?: 'not-submitted' | 'pending' | 'approved' | 'rejected';
  photoVerificationStatus?: 'not-submitted' | 'pending' | 'approved' | 'rejected';
  isVerified?: boolean;
  verificationSubmission?: {
    profilePhoto?: string;
    verificationSelfie?: string;
    idDocument?: string;
    note?: string;
    submittedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
  };
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  token: string;
  user: AppUser;
}

export interface AdminAuthResponse {
  token: string;
  admin: {
    email: string;
  };
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

export interface DestinationsResponse {
  destinations: string[];
}

export interface AdminSummary {
  totalUsers: number;
  pendingAccounts: number;
  pendingPhotos: number;
  pendingVerification: number;
  approvedAccounts: number;
}

export interface AdminUsersResponse {
  users: AppUser[];
}

export interface MatchUser extends AppUser {
  bio?: string;
  photos?: string[];
  interests?: string[];
  languages?: string[];
  dreamDestinations?: string[];
  trustScore?: number;
  travelStyle?: string;
  isVerified?: boolean;
}

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

export async function swipeUser(
  token: string,
  input: { targetUserId: string; action: 'left' | 'right' | 'super'; compatibilityScore: number }
): Promise<{ match: MatchRecord | null }> {
  return request<{ match: MatchRecord | null }>('/api/match/swipe', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(input)
  });
}

export async function getMatches(token: string): Promise<MatchRecord[]> {
  const data = await request<{ matches: MatchRecord[] }>('/api/match/matches', {
    headers: authHeaders(token)
  });
  return data.matches;
}

export async function getPublicProfile(token: string, userId: string): Promise<MatchUser> {
  return request<MatchUser>(`/api/profile/${userId}`, {
    headers: authHeaders(token)
  });
}

export async function getTrips(token: string): Promise<GroupTrip[]> {
  const data = await request<{ trips: GroupTrip[] }>('/api/trips', {
    headers: authHeaders(token)
  });
  return data.trips;
}

export async function createTrip(
  token: string,
  input: {
    destination: string;
    startDate: string;
    endDate: string;
    tripType: 'solo_buddy' | 'group';
    maxMembers: number;
  }
): Promise<GroupTrip> {
  const data = await request<{ trip: GroupTrip }>('/api/trips', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(input)
  });
  return data.trip;
}

export async function joinTrip(token: string, tripId: string): Promise<GroupTrip> {
  const data = await request<{ trip: GroupTrip }>(`/api/trips/${tripId}/join`, {
    method: 'POST',
    headers: authHeaders(token)
  });
  return data.trip;
}

export async function getMessages(token: string, matchId: string): Promise<MessageRecord[]> {
  const data = await request<{ messages: MessageRecord[] }>(`/api/chat/${matchId}/messages`, {
    headers: authHeaders(token)
  });
  return data.messages;
}

export async function sendChatMessage(token: string, matchId: string, body: string): Promise<MessageRecord> {
  const data = await request<{ message: MessageRecord }>(`/api/chat/${matchId}/messages`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ body })
  });
  return data.message;
}

export async function getDestinations(query?: string): Promise<string[]> {
  const search = query ? `?q=${encodeURIComponent(query)}` : '';
  const data = await request<DestinationsResponse>(`/api/destinations${search}`);
  return data.destinations;
}

export async function loginAdmin(input: LoginInput): Promise<AdminAuthResponse> {
  return request<AdminAuthResponse>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify(input)
  });
}

export async function getAdminSummary(adminToken: string): Promise<AdminSummary> {
  return request<AdminSummary>('/api/admin/summary', {
    headers: authHeaders(adminToken)
  });
}

export async function getAdminUsers(adminToken: string): Promise<AppUser[]> {
  const data = await request<AdminUsersResponse>('/api/admin/users', {
    headers: authHeaders(adminToken)
  });
  return data.users;
}

export async function updateUserModeration(
  adminToken: string,
  userId: string,
  input: {
    accountStatus?: AppUser['accountStatus'];
    verificationStatus?: AppUser['verificationStatus'];
    photoVerificationStatus?: AppUser['photoVerificationStatus'];
    rejectionReason?: string;
  }
): Promise<AppUser> {
  const data = await request<{ user: AppUser }>(`/api/admin/users/${userId}/moderation`, {
    method: 'PATCH',
    headers: authHeaders(adminToken),
    body: JSON.stringify(input)
  });
  return data.user;
}
