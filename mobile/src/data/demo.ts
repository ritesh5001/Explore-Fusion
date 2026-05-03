import type { DiscoverProfile, GroupTrip } from '../features/api';

export const demoProfiles: DiscoverProfile[] = [
  {
    id: 'demo-priya',
    name: 'Priya Shah',
    age: 27,
    homeCity: 'Mumbai',
    bio: 'Food walks, old city lanes, slow mornings, and clean hostels.',
    travelStyle: 'budget',
    interests: ['Food & Cuisine', 'Culture & History', 'Photography'],
    budgetMin: 1800,
    budgetMax: 4200,
    isVerified: true,
    trustScore: 4.8,
    compatibilityScore: 94
  },
  {
    id: 'demo-rahul',
    name: 'Rahul Mehta',
    age: 31,
    homeCity: 'Bengaluru',
    bio: 'Remote worker planning calm trips with hikes and reliable Wi-Fi.',
    travelStyle: 'midrange',
    interests: ['Hiking', 'Beaches', 'Photography'],
    budgetMin: 3000,
    budgetMax: 6500,
    isVerified: true,
    trustScore: 4.6,
    compatibilityScore: 89
  }
];

export const demoTrips: GroupTrip[] = [
  {
    id: 'trip-bali',
    destination: 'Bali, Indonesia',
    dates: 'Jul 4-16',
    members: 3,
    maxMembers: 5,
    status: 'planning'
  },
  {
    id: 'trip-jaipur',
    destination: 'Jaipur, India',
    dates: 'Jun 12-18',
    members: 2,
    maxMembers: 4,
    status: 'confirmed'
  }
];
