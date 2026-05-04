/**
 * Seed script — creates 15 realistic demo users, completes their onboarding,
 * and approves every account + both verification flags via the admin API.
 *
 * Usage:
 *   npx ts-node --esm scripts/seed-users.ts
 *   — or —
 *   npx tsx scripts/seed-users.ts
 */

const BASE = process.env.API_URL ?? 'http://localhost:4000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'nextgenfusion.devs@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'Ritesh5001@';

// ── Unsplash free portrait photos ──────────────────────────────────────────
// All use publicly accessible Unsplash URLs (no auth required)
const PHOTOS = {
  // People
  priya:   'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80',
  rahul:   'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=600&q=80',
  ananya:  'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=600&q=80',
  arjun:   'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=600&q=80',
  meera:   'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80',
  vikram:  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80',
  nisha:   'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80',
  karan:   'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=600&q=80',
  divya:   'https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&q=80',
  rohit:   'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&q=80',
  shreya:  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80',
  aditya:  'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&q=80',
  kavya:   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80',
  siddharth:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80',
  pooja:   'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=600&q=80',
};

// ── 15 demo user profiles ────────────────────────────────────────────────────
const USERS = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma.travels@gmail.com',
    password: 'Travel@2024',
    phone: '9812345601',
    homeCity: 'Mumbai',
    gender: 'female',
    dateOfBirth: '1997-03-14',
    photo: PHOTOS.priya,
    onboarding: {
      bio: "Food walks and slow mornings in old city lanes. I plan the food spots, keep the days flexible. Looking for a chill buddy who shows up on time and doesn't mind a long chai conversation at midnight.",
      travelStyle: 'budget',
      interests: ['Food walks', 'Photography', 'Hostels', 'Slow travel', 'Heritage', 'Markets', 'Cafés'],
      languages: ['English', 'Hindi', 'Gujarati'],
      budgetMin: 1800,
      budgetMax: 4000,
      preferredDuration: '1-week',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Bali', 'Vietnam', 'Jaipur', 'Pondicherry'],
      tripPlans: [
        { destination: 'Bali', startDate: '2025-07-04', endDate: '2025-07-16' }
      ],
    },
  },
  {
    name: 'Rahul Mehta',
    email: 'rahul.mehta.explorer@gmail.com',
    password: 'Travel@2024',
    phone: '9823456702',
    homeCity: 'Bengaluru',
    gender: 'male',
    dateOfBirth: '1993-11-22',
    photo: PHOTOS.rahul,
    onboarding: {
      bio: "Hiking trails, beach sunsets, and hostel rooftops with strangers who become friends. Always have a backup plan but happy to ditch it when something better comes up.",
      travelStyle: 'budget',
      interests: ['Hiking', 'Beaches', 'Photography', 'Hostels', 'Surfing', 'Camping'],
      languages: ['English', 'Hindi', 'Kannada'],
      budgetMin: 2000,
      budgetMax: 5000,
      preferredDuration: '2-weeks',
      companionPreference: 'small-group',
      dreamDestinations: ['Bali', 'Vietnam', 'Nepal', 'Spiti'],
      tripPlans: [
        { destination: 'Bali', startDate: '2025-07-06', endDate: '2025-07-18' }
      ],
    },
  },
  {
    name: 'Ananya Reddy',
    email: 'ananya.reddy.wanderer@gmail.com',
    password: 'Travel@2024',
    phone: '9834567803',
    homeCity: 'Hyderabad',
    gender: 'female',
    dateOfBirth: '2000-06-08',
    photo: PHOTOS.ananya,
    onboarding: {
      bio: "Temples, local markets, and street food at 11 PM. I'm 24 but I travel like I'm 50 — unhurried, intentional, deep. My ideal trip has one plan a day and the rest left to chance.",
      travelStyle: 'budget',
      interests: ['Temples', 'Markets', 'Food walks', 'Heritage', 'Street food', 'Photography'],
      languages: ['English', 'Hindi', 'Telugu'],
      budgetMin: 1500,
      budgetMax: 3500,
      preferredDuration: '1-week',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Bali', 'Thailand', 'Rajasthan', 'Kerala'],
      tripPlans: [
        { destination: 'Bali', startDate: '2025-07-04', endDate: '2025-07-11' }
      ],
    },
  },
  {
    name: 'Arjun Nair',
    email: 'arjun.nair.surf@gmail.com',
    password: 'Travel@2024',
    phone: '9845678904',
    homeCity: 'Kochi',
    gender: 'male',
    dateOfBirth: '1995-09-17',
    photo: PHOTOS.arjun,
    onboarding: {
      bio: "Surf, coffee, repeat. Ex-software engineer who quit to travel and never went back. I wake up at 6 AM for waves and I'm asleep by 10 PM. If that sounds boring to you, we're not a match.",
      travelStyle: 'budget',
      interests: ['Surfing', 'Cafés', 'Beaches', 'Yoga', 'Diving', 'Hiking'],
      languages: ['English', 'Hindi', 'Malayalam'],
      budgetMin: 2500,
      budgetMax: 5500,
      preferredDuration: '2-weeks',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Bali', 'Philippines', 'Goa', 'Sri Lanka'],
      tripPlans: [
        { destination: 'Bali', startDate: '2025-07-08', endDate: '2025-07-22' }
      ],
    },
  },
  {
    name: 'Meera Krishnan',
    email: 'meera.krishnan.yoga@gmail.com',
    password: 'Travel@2024',
    phone: '9856789005',
    homeCity: 'Chennai',
    gender: 'female',
    dateOfBirth: '1998-01-30',
    photo: PHOTOS.meera,
    onboarding: {
      bio: "I travel to slow down, not speed up. Yoga at dawn, market in the evening, a good book in between. I eat local, stay local, and rarely follow tourist trails. Let's find the real place together.",
      travelStyle: 'budget',
      interests: ['Yoga', 'Slow travel', 'Markets', 'Wellness', 'Photography', 'Cafés', 'Heritage'],
      languages: ['English', 'Hindi', 'Tamil'],
      budgetMin: 1500,
      budgetMax: 3500,
      preferredDuration: '1-week',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Bali', 'Vietnam', 'Kerala', 'Auroville'],
      tripPlans: [
        { destination: 'Bali', startDate: '2025-07-05', endDate: '2025-07-14' }
      ],
    },
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh.heritage@gmail.com',
    password: 'Travel@2024',
    phone: '9867890106',
    homeCity: 'Jaipur',
    gender: 'male',
    dateOfBirth: '1991-04-12',
    photo: PHOTOS.vikram,
    onboarding: {
      bio: "Architect by training, traveller by compulsion. I go to places most tourists skip and photograph the things most cameras miss. Rajasthan is home but the world is the plan.",
      travelStyle: 'midrange',
      interests: ['Heritage', 'Photography', 'Architecture', 'Culture', 'Markets', 'Temples'],
      languages: ['English', 'Hindi'],
      budgetMin: 2500,
      budgetMax: 6000,
      preferredDuration: '1-week',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Bali', 'Turkey', 'Egypt', 'Hampi'],
      tripPlans: [
        { destination: 'Bali', startDate: '2025-07-04', endDate: '2025-07-12' }
      ],
    },
  },
  {
    name: 'Nisha Patel',
    email: 'nisha.patel.adventures@gmail.com',
    password: 'Travel@2024',
    phone: '9878901207',
    homeCity: 'Ahmedabad',
    gender: 'female',
    dateOfBirth: '1996-07-25',
    photo: PHOTOS.nisha,
    onboarding: {
      bio: "I pack light, move fast, and eat everything. Street food is non-negotiable. I've done Ladakh solo, Vietnam solo, and Cambodia solo — next up is a buddy who keeps up with me.",
      travelStyle: 'backpacker',
      interests: ['Food walks', 'Backpacking', 'Hostels', 'Hiking', 'Nightlife', 'Street food', 'Festivals'],
      languages: ['English', 'Hindi', 'Gujarati'],
      budgetMin: 1200,
      budgetMax: 2800,
      preferredDuration: '2-weeks',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Vietnam', 'Nepal', 'Himachal', 'Meghalaya'],
      tripPlans: [
        { destination: 'Vietnam', startDate: '2025-08-02', endDate: '2025-08-16' }
      ],
    },
  },
  {
    name: 'Karan Malhotra',
    email: 'karan.malhotra.trails@gmail.com',
    password: 'Travel@2024',
    phone: '9889012308',
    homeCity: 'Delhi',
    gender: 'male',
    dateOfBirth: '1994-12-03',
    photo: PHOTOS.karan,
    onboarding: {
      bio: "Trekking and cold coffee at 4200m. I'm in Himachal or Uttarakhand four months a year. For the off-season I go south or east. Looking for someone who can carry their own pack and still smile at the top.",
      travelStyle: 'backpacker',
      interests: ['Trekking', 'Camping', 'Hiking', 'Mountains', 'Photography', 'Hostels'],
      languages: ['English', 'Hindi'],
      budgetMin: 1000,
      budgetMax: 3000,
      preferredDuration: '2-weeks',
      companionPreference: 'small-group',
      dreamDestinations: ['Spiti', 'Nepal', 'Himachal', 'Meghalaya', 'Bhutan'],
      tripPlans: [
        { destination: 'Himachal Pradesh', startDate: '2025-06-10', endDate: '2025-06-22' }
      ],
    },
  },
  {
    name: 'Divya Agarwal',
    email: 'divya.agarwal.wanders@gmail.com',
    password: 'Travel@2024',
    phone: '9890123409',
    homeCity: 'Lucknow',
    gender: 'female',
    dateOfBirth: '1999-05-19',
    photo: PHOTOS.divya,
    onboarding: {
      bio: "Literature grad who travels by train whenever possible. I like places that are lived in, not polished. Old towns, narrow alleys, dhabas with no menus. Tell me where you're going and I'll tell you what to eat.",
      travelStyle: 'budget',
      interests: ['Heritage', 'Food walks', 'Slow travel', 'Train travel', 'Markets', 'Books', 'Photography'],
      languages: ['English', 'Hindi', 'Urdu'],
      budgetMin: 1400,
      budgetMax: 3200,
      preferredDuration: '1-week',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Varanasi', 'Jaipur', 'Pondicherry', 'Vietnam', 'Hampi'],
      tripPlans: [
        { destination: 'Pondicherry', startDate: '2025-09-05', endDate: '2025-09-12' }
      ],
    },
  },
  {
    name: 'Rohit Joshi',
    email: 'rohit.joshi.rideon@gmail.com',
    password: 'Travel@2024',
    phone: '9901234510',
    homeCity: 'Pune',
    gender: 'male',
    dateOfBirth: '1992-08-11',
    photo: PHOTOS.rohit,
    onboarding: {
      bio: "Royal Enfield on weekends, flights when the destination demands it. I've done Leh-Manali twice and Coorg six times. Not looking for a co-rider — looking for someone to eat, explore, and get lost with.",
      travelStyle: 'midrange',
      interests: ['Road trips', 'Mountains', 'Cafés', 'Hiking', 'Photography', 'Camping', 'Food walks'],
      languages: ['English', 'Hindi', 'Marathi'],
      budgetMin: 2000,
      budgetMax: 5000,
      preferredDuration: '1-week',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Ladakh', 'Coorg', 'Vietnam', 'Bali', 'New Zealand'],
      tripPlans: [
        { destination: 'Ladakh', startDate: '2025-07-15', endDate: '2025-07-26' }
      ],
    },
  },
  {
    name: 'Shreya Kapoor',
    email: 'shreya.kapoor.vivid@gmail.com',
    password: 'Travel@2024',
    phone: '9912345611',
    homeCity: 'Kolkata',
    gender: 'female',
    dateOfBirth: '1997-10-06',
    photo: PHOTOS.shreya,
    onboarding: {
      bio: "I shoot street photography and write a travel journal no one reads. Kolkata has the best food in the country and I'll fight anyone who disagrees. Outside of home: Hanoi old quarter, Hoi An markets, and anywhere with good natural light.",
      travelStyle: 'budget',
      interests: ['Street photography', 'Food walks', 'Markets', 'Heritage', 'Art', 'Cafés'],
      languages: ['English', 'Hindi', 'Bengali'],
      budgetMin: 1600,
      budgetMax: 4000,
      preferredDuration: '1-week',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Vietnam', 'Japan', 'Kolkata', 'Varanasi', 'Hampi'],
      tripPlans: [
        { destination: 'Vietnam', startDate: '2025-08-02', endDate: '2025-08-14' }
      ],
    },
  },
  {
    name: 'Aditya Bose',
    email: 'aditya.bose.northeast@gmail.com',
    password: 'Travel@2024',
    phone: '9923456712',
    homeCity: 'Guwahati',
    gender: 'male',
    dateOfBirth: '1995-02-27',
    photo: PHOTOS.aditya,
    onboarding: {
      bio: "Northeast India is the most underrated travel destination in the world. I've done all 8 states and I'll take you through places no itinerary has heard of. Also decent at Meghalayan living root bridge hikes.",
      travelStyle: 'backpacker',
      interests: ['Wildlife', 'Hiking', 'Camping', 'Photography', 'Tribal culture', 'Trekking', 'Slow travel'],
      languages: ['English', 'Hindi', 'Assamese', 'Bengali'],
      budgetMin: 1200,
      budgetMax: 3000,
      preferredDuration: '2-weeks',
      companionPreference: 'small-group',
      dreamDestinations: ['Meghalaya', 'Arunachal Pradesh', 'Nagaland', 'Bhutan', 'Myanmar'],
      tripPlans: [
        { destination: 'Meghalaya', startDate: '2025-10-03', endDate: '2025-10-14' }
      ],
    },
  },
  {
    name: 'Kavya Iyer',
    email: 'kavya.iyer.wanderlist@gmail.com',
    password: 'Travel@2024',
    phone: '9934567813',
    homeCity: 'Bengaluru',
    gender: 'female',
    dateOfBirth: '1998-04-15',
    photo: PHOTOS.kavya,
    onboarding: {
      bio: "Product manager by day, chronic trip planner by night. I have spreadsheets for every destination and I'm not ashamed of it. My trips are well-researched but never rigid — there's always a buffer day for the unexpected.",
      travelStyle: 'midrange',
      interests: ['Food walks', 'Boutique hotels', 'Cafés', 'Photography', 'Heritage', 'Yoga', 'Slow travel'],
      languages: ['English', 'Hindi', 'Tamil', 'Kannada'],
      budgetMin: 3000,
      budgetMax: 7000,
      preferredDuration: '1-week',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Bali', 'Japan', 'Portugal', 'Vietnam', 'Coorg'],
      tripPlans: [
        { destination: 'Bali', startDate: '2025-07-10', endDate: '2025-07-18' }
      ],
    },
  },
  {
    name: 'Siddharth Verma',
    email: 'siddharth.verma.lens@gmail.com',
    password: 'Travel@2024',
    phone: '9945678914',
    homeCity: 'Chandigarh',
    gender: 'male',
    dateOfBirth: '1993-07-09',
    photo: PHOTOS.siddharth,
    onboarding: {
      bio: "Travel photographer and part-time adventurer. I chase golden hour and monsoon clouds. The camera always comes, the itinerary usually doesn't. I can find a great frame anywhere — mountains, deserts, or a bylane in Old Delhi.",
      travelStyle: 'midrange',
      interests: ['Photography', 'Mountains', 'Hiking', 'Heritage', 'Festivals', 'Camping', 'Slow travel'],
      languages: ['English', 'Hindi', 'Punjabi'],
      budgetMin: 2000,
      budgetMax: 5000,
      preferredDuration: '1-week',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Spiti', 'Ladakh', 'Rajasthan', 'Iceland', 'Vietnam'],
      tripPlans: [
        { destination: 'Spiti Valley', startDate: '2025-06-15', endDate: '2025-06-25' }
      ],
    },
  },
  {
    name: 'Pooja Menon',
    email: 'pooja.menon.backpack@gmail.com',
    password: 'Travel@2024',
    phone: '9956789015',
    homeCity: 'Thiruvananthapuram',
    gender: 'female',
    dateOfBirth: '1996-12-20',
    photo: PHOTOS.pooja,
    onboarding: {
      bio: "Kerala girl who's more comfortable in a Bali hostel than a 5-star resort. Diving certified, vegan-curious, always has a spare power bank. I'm the one who finds the hidden waterfall the guidebook missed.",
      travelStyle: 'budget',
      interests: ['Diving', 'Beaches', 'Yoga', 'Hiking', 'Hostels', 'Slow travel', 'Wildlife'],
      languages: ['English', 'Hindi', 'Malayalam', 'Tamil'],
      budgetMin: 1500,
      budgetMax: 3500,
      preferredDuration: '2-weeks',
      companionPreference: 'solo-buddy',
      dreamDestinations: ['Bali', 'Maldives', 'Sri Lanka', 'Philippines', 'Thailand'],
      tripPlans: [
        { destination: 'Bali', startDate: '2025-07-12', endDate: '2025-07-26' }
      ],
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
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}`);
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
  // 1 — Health check
  try {
    const health = await fetch(`${BASE}/health`);
    if (!health.ok) throw new Error('unhealthy');
    console.log(`✓ API reachable at ${BASE}`);
  } catch {
    console.error(`✗ Cannot reach API at ${BASE}. Start the backend first.`);
    process.exit(1);
  }

  // 2 — Admin login
  const adminRes = await post<{ token: string }>('/api/admin/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  const adminToken = adminRes.token;
  console.log('✓ Admin authenticated');

  // 3 — Register + onboard + approve each user
  let created = 0;
  let skipped = 0;

  for (const u of USERS) {
    try {
      // Register
      const authRes = await post<{ token: string; user: { _id: string } }>(
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
      const userToken = authRes.token;
      const userId = authRes.user._id;

      // Complete onboarding
      await put('/api/profile/onboarding', {
        ...u.onboarding,
        tripPlans: u.onboarding.tripPlans,
        verificationSubmission: {
          profilePhoto: u.photo,
          verificationSelfie: u.photo,
          note: 'Demo seed user — auto-approved.',
        },
      }, userToken);

      // Update profile photos via PUT /me
      await put('/api/profile/me', { photos: [u.photo] }, userToken);

      // Admin approve account + both verifications
      await patch(`/api/admin/users/${userId}/moderation`, {
        accountStatus: 'approved',
        verificationStatus: 'approved',
        photoVerificationStatus: 'approved',
      }, adminToken);

      console.log(`  ✓ ${u.name.padEnd(22)} ${u.email}`);
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

  console.log(`\nDone. Created: ${created}  Skipped: ${skipped}  Total users seeded: ${USERS.length}`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
