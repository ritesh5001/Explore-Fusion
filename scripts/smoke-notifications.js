/* eslint-disable no-console */

const authBase = process.env.AUTH_BASE || 'http://127.0.0.1:5001/api/v1/auth';
const matchesBase = process.env.MATCHES_BASE || 'http://127.0.0.1:5050/api/v1/matches';
const notifBase = process.env.NOTIF_BASE || 'http://127.0.0.1:5050/api/v1/notifications';

async function req(method, url, body, token) {
  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { status: res.status, json };
}

async function register(name) {
  const email = `notif_${name.replace(/\s+/g, '_')}_${Date.now()}@example.com`;
  const password = 'Passw0rd!';
  const r = await req('POST', `${authBase}/register`, { name, email, password });
  const token = r?.json?.data?.token;
  if (!token) {
    throw new Error(`register failed: ${JSON.stringify(r.json)}`);
  }
  return { token };
}

(async () => {
  const a = await register('Notif A');
  const b = await register('Notif B');

  const pa = await req(
    'POST',
    `${matchesBase}/profile`,
    {
      destinationPreferences: ['Goa'],
      interests: ['food'],
      travelStyle: 'budget',
      bio: 'A',
    },
    a.token
  );

  const pb = await req(
    'POST',
    `${matchesBase}/profile`,
    {
      destinationPreferences: ['Goa'],
      interests: ['food'],
      travelStyle: 'budget',
      bio: 'B',
    },
    b.token
  );

  const bUserId = pb.json?.data?.userId;
  if (!bUserId) {
    throw new Error(`profile did not return userId: ${JSON.stringify(pb.json)}`);
  }

  const send = await req('POST', `${matchesBase}/${bUserId}/request`, undefined, a.token);

  const bNotifs1 = await req('GET', `${notifBase}/my`, undefined, b.token);
  const firstNotifId = bNotifs1.json?.data?.[0]?._id;

  const mark = firstNotifId
    ? await req('PUT', `${notifBase}/${firstNotifId}/read`, undefined, b.token)
    : { status: 'n/a' };

  const del = firstNotifId
    ? await req('DELETE', `${notifBase}/${firstNotifId}`, undefined, b.token)
    : { status: 'n/a' };

  const clear = await req('DELETE', `${notifBase}/clear/all`, undefined, b.token);
  const bNotifs2 = await req('GET', `${notifBase}/my`, undefined, b.token);

  console.log(
    JSON.stringify(
      {
        profileA: pa.status,
        profileB: pb.status,
        matchRequest: send.status,
        bNotifsAfterRequest: {
          status: bNotifs1.status,
          count: bNotifs1.json?.data?.length,
          topType: bNotifs1.json?.data?.[0]?.type,
        },
        markRead: mark.status,
        deleteOne: del.status,
        clearAll: clear.status,
        bNotifsAfterClear: {
          status: bNotifs2.status,
          count: bNotifs2.json?.data?.length,
        },
      },
      null,
      2
    )
  );
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
