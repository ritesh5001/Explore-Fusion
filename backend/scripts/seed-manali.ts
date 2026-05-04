/**
 * Seed script — 10 Manali travelers (Jul 18–20, 2025 · 3 days)
 *
 * Run: npx tsx scripts/seed-manali.ts
 *
 * These users all share:
 *   - dreamDestinations includes 'Manali'
 *   - tripPlans: Manali Jul 18–20 2025 (3 nights)
 *
 * When any user updates their trip plan to Manali / same dates, the
 * compatibility score will spike on date-overlap (25 pts) + destination (30 pts).
 */

const BASE = process.env.API_URL ?? 'http://localhost:4000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'nextgenfusion.devs@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Ritesh5001@';

// ── Free Unsplash portrait URLs (different faces from the first batch) ───────
const PHOTOS = {
  riya:     'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&q=80',
  amit:     'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=600&q=80',
  tanvi:    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80',
  nikhil:   'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
  ishaan:   'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=600&q=80',
  simran:   'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=600&q=80',
  aryan:    'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&q=80',
  preethi:  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80',
  dhruv:    'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=600&q=80',
  lavanya:  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&q=80',
};

// Manali trip dates — all 3 nights, Jul 18–21 2025
const MANALI_START = '2025-07-18';
const MANALI_END   = '2025-07-21';

const USERS = [
  {
    name: 'Riya Chauhan',
    email: 'riya.chauhan.hills@gmail.com',
    password: 'Manali@2025',
    phone: '9701234501',
    homeCity: 'Delhi',
    gender: 'female',
    dateOfBirth: '1999-03-11',
    photo: PHOTOS.riya,
    onboarding: {
      bio: "Delhi girl who drives to the hills every chance she gets. Manali is home away from home. I'm going Jul 18–20 for a quick mountain reset — cafe hopping, Solang Valley, and hopefully snow. Looking for a chill co-traveler who doesn't need a luxury resort.",
      travelStyle: 'budget',
      interests: ['Mountains', 'Cafés', 'Photography', 'Hiking', 'Slow travel', 'Road trips'],
      languages: ['English', 'Hindi'],
      budgetMin: 1500,
      budgetMax: 3500,
      preferredDuration: 'weekend',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Manali', 'Spiti', 'Ladakh', 'Chopta', 'Kasol'],
      tripPlans: [{ destination: 'Manali', startDate: MANALI_START, endDate: MANALI_END }],
    },
  },
  
  {
    name: 'Amit Rawat',
    email: 'amit.rawat.manali@gmail.com',
    password: 'Manali@2025',
    phone: '9712345602',
    homeCity: 'Dehradun',
    gender: 'male',
    dateOfBirth: '1994-08-24',
    photo: PHOTOS.amit,
    onboarding: {
      bio: "Himachali by blood, wanderer by choice. I know Manali better than most guides. Jul 18–20 trip — planning Beas riverside, Old Manali lanes, maybe a quick Hadimba trek. If you want someone who knows where the real chai comes from, I'm your guy.",
      travelStyle: 'backpacker',
      interests: ['Trekking', 'Mountains', 'Camping', 'Hiking', 'Local food', 'Photography'],
      languages: ['English', 'Hindi', 'Pahadi'],
      budgetMin: 1000,
      budgetMax: 2500,
      preferredDuration: 'weekend',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Manali', 'Spiti', 'Kinnaur', 'Chopta', 'Kedarkantha'],
      tripPlans: [{ destination: 'Manali', startDate: MANALI_START, endDate: MANALI_END }],
    },
  },

  {
    name: 'Tanvi Bhatt',
    email: 'tanvi.bhatt.peaks@gmail.com',
    password: 'Manali@2025',
    phone: '9723456703',
    homeCity: 'Mumbai',
    gender: 'female',
    dateOfBirth: '1997-11-05',
    photo: PHOTOS.tanvi,
    onboarding: {
      bio: "Escape the Mumbai humidity, breathe actual air for 3 days. That's the entire plan. Jul 18–20 in Manali — no fixed itinerary, just mountains and hot momos. Bonus if you like playing cards at a cafe until midnight.",
      travelStyle: 'budget',
      interests: ['Mountains', 'Cafés', 'Food walks', 'Photography', 'Slow travel', 'Hostels'],
      languages: ['English', 'Hindi', 'Marathi'],
      budgetMin: 1800,
      budgetMax: 4000,
      preferredDuration: 'weekend',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Manali', 'Kasol', 'Himachal', 'Coorg', 'Ooty'],
      tripPlans: [{ destination: 'Manali', startDate: MANALI_START, endDate: MANALI_END }],
    },
  },
  {
    name: 'Nikhil Sharma',
    email: 'nikhil.sharma.altitude@gmail.com',
    password: 'Manali@2025',
    phone: '9734567804',
    homeCity: 'Chandigarh',
    gender: 'male',
    dateOfBirth: '1995-06-18',
    photo: PHOTOS.nikhil,
    onboarding: {
      bio: "Chandigarh to Manali in one shot — I've done it 7 times. This Jul 18–20 trip is short but the mountains don't care. Solang Valley paragliding if the weather holds. Looking for someone who's comfortable with an early 5 AM start.",
      travelStyle: 'budget',
      interests: ['Paragliding', 'Mountains', 'Hiking', 'Road trips', 'Photography', 'Camping'],
      languages: ['English', 'Hindi', 'Punjabi'],
      budgetMin: 1500,
      budgetMax: 3000,
      preferredDuration: 'weekend',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Manali', 'Spiti', 'Ladakh', 'Kasol', 'Kheerganga'],
      tripPlans: [{ destination: 'Manali', startDate: MANALI_START, endDate: MANALI_END }],
    },
  },
  {
    name: 'Ishaan Gupta',
    email: 'ishaan.gupta.trailhead@gmail.com',
    password: 'Manali@2025',
    phone: '9745678905',
    homeCity: 'Noida',
    gender: 'male',
    dateOfBirth: '1996-02-14',
    photo: PHOTOS.ishaan,
    onboarding: {
      bio: "Software developer who codes better after a mountain trip. Jul 18–20 Manali long weekend — going with a light pack and no work notifications. I want someone who can sit quietly and watch the Beas without needing to fill every second with conversation.",
      travelStyle: 'budget',
      interests: ['Mountains', 'Hiking', 'Cafés', 'Photography', 'Slow travel', 'Books'],
      languages: ['English', 'Hindi'],
      budgetMin: 1500,
      budgetMax: 3500,
      preferredDuration: 'weekend',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Manali', 'Spiti', 'Nepal', 'Bhutan', 'Sikkim'],
      tripPlans: [{ destination: 'Manali', startDate: MANALI_START, endDate: MANALI_END }],
    },
  },
  {
    name: 'Simran Arora',
    email: 'simran.arora.cloudlines@gmail.com',
    password: 'Manali@2025',
    phone: '9756789006',
    homeCity: 'Amritsar',
    gender: 'female',
    dateOfBirth: '1998-09-30',
    photo: PHOTOS.simran,
    onboarding: {
      bio: "Punjab to Manali every summer — it's tradition now. Jul 18–20 I'm going with one bag and zero expectations. Love the Old Manali village vibe, Johnsons Cafe for breakfast, and the Hadimba temple in the morning before tourists show up.",
      travelStyle: 'budget',
      interests: ['Mountains', 'Heritage', 'Cafés', 'Slow travel', 'Photography', 'Yoga'],
      languages: ['English', 'Hindi', 'Punjabi'],
      budgetMin: 1200,
      budgetMax: 3000,
      preferredDuration: 'weekend',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Manali', 'Dharamshala', 'Kasol', 'Spiti', 'Chopta'],
      tripPlans: [{ destination: 'Manali', startDate: MANALI_START, endDate: MANALI_END }],
    },
  },
  {
    name: 'Aryan Kapila',
    email: 'aryan.kapila.mountainman@gmail.com',
    password: 'Manali@2025',
    phone: '9767890107',
    homeCity: 'Ludhiana',
    gender: 'male',
    dateOfBirth: '1993-05-07',
    photo: PHOTOS.aryan,
    onboarding: {
      bio: "30 and still counting mountain trips. Jul 18–20 Manali — snow-capped peaks, river sounds, no deadlines. I'm an early riser, carry snacks, and always know a good hidden dhaba. If you're going the same days, let's figure out the rest together.",
      travelStyle: 'budget',
      interests: ['Mountains', 'Camping', 'Trekking', 'Local food', 'Photography', 'Road trips'],
      languages: ['English', 'Hindi', 'Punjabi'],
      budgetMin: 1000,
      budgetMax: 2800,
      preferredDuration: 'weekend',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Manali', 'Spiti', 'Ladakh', 'Kheerganga', 'Triund'],
      tripPlans: [{ destination: 'Manali', startDate: MANALI_START, endDate: MANALI_END }],
    },
  },
  {
    name: 'Preethi Nambiar',
    email: 'preethi.nambiar.hillside@gmail.com',
    password: 'Manali@2025',
    phone: '9778901208',
    homeCity: 'Bengaluru',
    gender: 'female',
    dateOfBirth: '1998-07-23',
    photo: PHOTOS.preethi,
    onboarding: {
      bio: "Bangalore tech life has its perks but mountains are mandatory twice a year. Manali Jul 18–20 is the July reset. I want to eat apple pie at a wooden cafe, walk by the river, and not think about sprints. Simple ask.",
      travelStyle: 'midrange',
      interests: ['Mountains', 'Cafés', 'Slow travel', 'Photography', 'Yoga', 'Hiking'],
      languages: ['English', 'Hindi', 'Malayalam', 'Kannada'],
      budgetMin: 2000,
      budgetMax: 5000,
      preferredDuration: 'weekend',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Manali', 'Coorg', 'Himachal', 'Scotland', 'New Zealand'],
      tripPlans: [{ destination: 'Manali', startDate: MANALI_START, endDate: MANALI_END }],
    },
  },
  {
    name: 'Dhruv Saxena',
    email: 'dhruv.saxena.ridgewalker@gmail.com',
    password: 'Manali@2025',
    phone: '9789012309',
    homeCity: 'Agra',
    gender: 'male',
    dateOfBirth: '1996-04-02',
    photo: PHOTOS.dhruv,
    onboarding: {
      bio: "History teacher who escapes to the mountains when he can't take any more monuments. Manali Jul 18–20 — first time not going as a school trip chaperone. Just me, a good jacket, and whoever wants to share a window seat on the bus.",
      travelStyle: 'budget',
      interests: ['Mountains', 'Slow travel', 'Cafés', 'Heritage', 'Photography', 'Books'],
      languages: ['English', 'Hindi'],
      budgetMin: 1200,
      budgetMax: 2800,
      preferredDuration: 'weekend',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Manali', 'Spiti', 'Himachal', 'Rishikesh', 'Chopta'],
      tripPlans: [{ destination: 'Manali', startDate: MANALI_START, endDate: MANALI_END }],
    },
  },
  {
    name: 'Lavanya Suresh',
    email: 'lavanya.suresh.ridgeline@gmail.com',
    password: 'Manali@2025',
    phone: '9790123410',
    homeCity: 'Chennai',
    gender: 'female',
    dateOfBirth: '1997-12-16',
    photo: PHOTOS.lavanya,
    onboarding: {
      bio: "Chennai heat is unbearable in July so I booked Manali last minute. Jul 18–20 — going for the cold air more than the views, honestly. First time in Himachal. Would love a buddy who knows the place, doesn't mind a first-timer's endless questions.",
      travelStyle: 'budget',
      interests: ['Mountains', 'Slow travel', 'Photography', 'Cafés', 'Food walks', 'Yoga'],
      languages: ['English', 'Hindi', 'Tamil'],
      budgetMin: 1500,
      budgetMax: 3500,
      preferredDuration: 'weekend',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Manali', 'Ooty', 'Himachal', 'Kasol', 'Coorg'],
      tripPlans: [{ destination: 'Manali', startDate: MANALI_START, endDate: MANALI_END }],
    },
  },
];

// ── HTTP helpers ─────────────────────────────────────────────────────────────
async function post<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  const json = await res.json() as T & { message?: string };
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${(json as Record<string, string>).message ?? JSON.stringify(json)}`);
  return json;
}

async function patch<T>(path: string, body: unknown, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json() as T;
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

async function put<T>(path: string, body: unknown, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json() as T;
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

// ── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  // Health check
  try {
    const health = await fetch(`${BASE}/health`);
    if (!health.ok) throw new Error('unhealthy');
    console.log(`✓ API reachable at ${BASE}`);
  } catch {
    console.error(`✗ Cannot reach ${BASE}. Start the backend first.`);
    process.exit(1);
  }

  // Admin login
  const { token: adminToken } = await post<{ token: string }>('/api/admin/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  console.log('✓ Admin authenticated');
  console.log(`\nSeeding 10 Manali travelers (Jul 18–20, 2025)...\n`);

  let created = 0;
  let skipped = 0;

  for (const u of USERS) {
    try {
      // Register
      const { token: userToken, user } = await post<{ token: string; user: { _id: string } }>(
        '/api/auth/register',
        {
          name: u.name,
          email: u.email,
          password: u.password,
          phone: u.phone,
          homeCity: u.homeCity,
          gender: u.gender,
          dateOfBirth: u.dateOfBirth,
        }
      );

      // Complete onboarding
      await put('/api/profile/onboarding', {
        ...u.onboarding,
        verificationSubmission: {
          profilePhoto: u.photo,
          verificationSelfie: u.photo,
          note: 'Manali seed user — auto-approved.',
        },
      }, userToken);

      // Set profile photo
      await put('/api/profile/me', { photos: [u.photo] }, userToken);

      // Admin approve + verify
      await patch(`/api/admin/users/${user._id}/moderation`, {
        accountStatus: 'approved',
        verificationStatus: 'approved',
        photoVerificationStatus: 'approved',
      }, adminToken);

      console.log(`  ✓ ${u.name.padEnd(22)} ${u.homeCity.padEnd(16)} Manali Jul 18–20`);
      created++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already registered')) {
        console.log(`  ~ ${u.name.padEnd(22)} already exists — skipped`);
        skipped++;
      } else {
        console.error(`  ✗ ${u.name}: ${msg}`);
      }
    }
  }

  console.log(`\nDone. Created: ${created}  Skipped: ${skipped}`);
  console.log('\nTo see these users in Discover, update any account\'s trip plan to:');
  console.log('  destination: Manali  |  dates: Jul 18–21 2025\n');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
