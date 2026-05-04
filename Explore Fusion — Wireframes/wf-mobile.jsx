// wf-mobile.jsx — Mobile (iOS) wireframes for Explore Fusion
// 6 artboards: Onboarding A/B, Discover A/B, Profile A/B, Matches A/B, Chat A/B
// Width 360 inside iOS frame. Wireframe fidelity, real photos for cards.

const M_W = 360;
const M_H = 720;

// ── Mobile chrome: status bar dot + tab bar ──────────────────────────
function MobileShell({ children, dark = false, hideTabs = false, active = 'discover', bg }) {
  return (
    <div style={{
      width: M_W, height: M_H,
      background: bg || (dark ? '#0e0f12' : 'var(--wf-bg, #fff)'),
      color: dark ? '#fff' : WF.ink,
      fontFamily: 'ui-sans-serif, system-ui, -apple-system',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* status bar */}
      <div style={{
        height: 36, padding: '10px 20px 0', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, fontWeight: 700, color: dark ? '#fff' : WF.ink, flexShrink: 0,
      }}>
        <span>9:41</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', opacity: 0.8 }}>
          <span style={{ fontSize: 9 }}>●●●●</span>
          <span style={{ fontSize: 9 }}>5G</span>
          <div style={{ width: 18, height: 9, border: `1px solid ${dark ? '#fff' : WF.ink}`, borderRadius: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 1, background: dark ? '#fff' : WF.ink, width: 11 }} />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>{children}</div>
      {!hideTabs && <MobileTabs dark={dark} active={active} />}
    </div>
  );
}

function MobileTabs({ active = 'discover', dark = false }) {
  const tabs = [
    { id: 'discover', label: 'Discover', icon: Icon.search },
    { id: 'matches', label: 'Matches', icon: Icon.heart },
    { id: 'trips', label: 'Trips', icon: Icon.globe },
    { id: 'chat', label: 'Chat', icon: Icon.msg },
    { id: 'me', label: 'Profile', icon: Icon.user },
  ];
  return (
    <div style={{
      height: 64, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
      borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : WF.line}`,
      background: dark ? '#15161a' : WF.bg, flexShrink: 0,
      paddingBottom: 8,
    }}>
      {tabs.map((t) => (
        <div key={t.id} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 3, color: t.id === active ? (dark ? '#fff' : WF.ink) : (dark ? 'rgba(255,255,255,0.4)' : WF.muted),
          fontWeight: t.id === active ? 700 : 500,
        }}>
          {t.icon(20)}
          <span style={{ fontSize: 9.5 }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ONBOARDING A — Standard stepper (5 steps)
// ─────────────────────────────────────────────────────────────────────
function MOnboardingA() {
  return (
    <MobileShell hideTabs>
      <div style={{ padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4, flex: 1 }}>
            {[1,2,3,4,5].map((i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i <= 3 ? WF.ink : WF.fill,
              }} />
            ))}
          </div>
          <span style={{ fontSize: 10.5, color: WF.muted, fontWeight: 600 }}>3 / 5</span>
        </div>

        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Step 3 — Interests</div>
          <h1 style={{ fontSize: 24, margin: '6px 0 0', lineHeight: 1.15, fontWeight: 700 }}>What lights you up on a trip?</h1>
          <p style={{ fontSize: 12.5, color: WF.muted, margin: '6px 0 0', lineHeight: 1.45 }}>Pick at least 5. We match by interest overlap, not by gender.</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            ['Food walks', 1], ['Hiking', 1], ['Hostels', 0], ['Temples', 1],
            ['Beach', 0], ['Photography', 1], ['Slow travel', 0], ['Markets', 1],
            ['Music gigs', 0], ['Cafés', 0], ['Coworking', 0], ['Trekking', 1],
            ['Heritage', 1], ['Wellness', 0], ['Wildlife', 0], ['Nightlife', 0],
            ['Festivals', 0], ['Surfing', 0],
          ].map(([t, on]) => (
            <span key={t} style={{
              padding: '7px 12px', borderRadius: 999,
              border: `1px solid ${on ? WF.ink : WF.line}`,
              background: on ? WF.ink : 'transparent',
              color: on ? '#fff' : WF.ink,
              fontSize: 12, fontWeight: 500,
            }}>{t}</span>
          ))}
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 10 }}>
          <WFButton variant="ghost" size="lg">Back</WFButton>
          <div style={{ flex: 1 }}><WFButton variant="filled" size="lg" block>Continue · 6 picked</WFButton></div>
        </div>
      </div>
    </MobileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ONBOARDING B — Trip-first: "Where & when?" before anything else
// ─────────────────────────────────────────────────────────────────────
function MOnboardingB() {
  return (
    <MobileShell hideTabs>
      <div style={{ padding: '14px 20px 20px', display: 'flex', flexDirection: 'column', height: '100%', gap: 14, overflow: 'auto' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skip signup. Start with a trip.</div>
        <h1 style={{ fontSize: 26, margin: 0, lineHeight: 1.1, fontWeight: 700 }}>Where are you going?</h1>

        {/* Big destination input */}
        <div style={{
          border: `1.5px solid ${WF.ink}`, borderRadius: 14, padding: 14,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: WF.muted }}>
            {Icon.pin(14)}<span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Destination</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Bali, Indonesia</div>

          <WFRule my={4} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: WF.muted }}>
            {Icon.cal(14)}<span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>When</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Jul 4 — Jul 16  <span style={{ color: WF.muted, fontWeight: 400, fontSize: 12 }}>· 12 nights</span></div>
        </div>

        {/* Suggested picks */}
        <div>
          <div style={{ fontSize: 11, color: WF.muted, fontWeight: 600, marginBottom: 6 }}>Trending with Indian travelers</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { name: 'Vietnam', img: PHOTOS.vietnam, n: '128 buddies' },
              { name: 'Himachal', img: PHOTOS.himachal, n: '94 buddies' },
            ].map((p) => (
              <div key={p.name} style={{ borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                <WFImage src={p.img} ratio="4/3" radius={10} />
                <div style={{
                  position: 'absolute', inset: 0, padding: 10,
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.65) 100%)',
                  color: '#fff',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 10, opacity: 0.85 }}>{p.n}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick travel style chips */}
        <div>
          <div style={{ fontSize: 11, color: WF.muted, fontWeight: 600, marginBottom: 6 }}>I travel</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['Backpacker', 0], ['Budget', 1], ['Mid-range', 0], ['Luxury', 0]].map(([t, on]) => (
              <span key={t} style={{
                padding: '8px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                border: `1px solid ${on ? WF.ink : WF.line}`,
                background: on ? WF.ink : 'transparent', color: on ? '#fff' : WF.ink,
              }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <WFButton variant="filled" size="lg" block>See 47 buddies headed to Bali →</WFButton>
          <div style={{ textAlign: 'center', marginTop: 8, fontSize: 11, color: WF.muted }}>
            Sign up only when you find a match.
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// DISCOVER A — Card stack (Tinder-like, big photo, interest match)
// ─────────────────────────────────────────────────────────────────────
function MDiscoverA() {
  return (
    <MobileShell active="discover">
      {/* Top bar */}
      <div style={{ padding: '10px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
          {Icon.pin(14)} Bali · Jul 4–16
        </div>
        <div style={{ width: 32, height: 32, border: `1px solid ${WF.line}`, borderRadius: 8, display: 'grid', placeItems: 'center' }}>{Icon.filter(15)}</div>
      </div>

      {/* Card stack */}
      <div style={{ padding: '4px 16px 12px', position: 'relative', flex: 1 }}>
        {/* back card peek */}
        <div style={{
          position: 'absolute', inset: '12px 24px 32px', borderRadius: 16,
          background: WF.fillSoft, border: `1px solid ${WF.line}`, transform: 'scale(0.96)',
        }} />
        {/* main card */}
        <div style={{
          position: 'relative', borderRadius: 16, overflow: 'hidden',
          border: `1px solid ${WF.line}`, height: 'calc(100% - 70px)',
          background: WF.bg, display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
            <WFImage src={PHOTOS.priya} ratio="auto" style={{ aspectRatio: 'unset', height: '100%', position: 'absolute', inset: 0 }} />
            {/* photo dots */}
            <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: 4 }}>
              {[1,1,0,0,0].map((on,i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: on ? '#fff' : 'rgba(255,255,255,0.4)' }} />
              ))}
            </div>
            {/* match score badge */}
            <div style={{
              position: 'absolute', top: 22, right: 10, padding: '4px 8px',
              borderRadius: 999, background: 'rgba(0,0,0,0.7)', color: '#fff',
              fontSize: 10, fontWeight: 700, backdropFilter: 'blur(6px)',
            }}>94% interest match</div>
            {/* gradient + meta */}
            <div style={{
              position: 'absolute', inset: 0, padding: 14,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.85) 100%)',
              color: '#fff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, opacity: 0.9 }}>
                {Icon.shield(11)} Verified · Mumbai
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>Priya, 27</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>Going to Bali · Jul 4–16 (matches yours)</div>
            </div>
          </div>
          {/* shared interests strip */}
          <div style={{ padding: '8px 12px 0', display: 'flex', gap: 4 }}>
            {[PHOTOS.goa, PHOTOS.jaipur, PHOTOS.himachal, PHOTOS.meghalaya].map((src, i) => (
              <div key={i} style={{ flex: 1, aspectRatio: '1.4', borderRadius: 6, overflow: 'hidden' }}>
                <WFImage src={src} ratio="auto" radius={6} style={{ aspectRatio: 'unset', height: '100%' }} />
              </div>
            ))}
          </div>
          <div style={{ padding: '8px 12px 10px', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {['Food walks', 'Hostels', 'Photography', 'Slow travel'].map((t) => (
              <WFChip key={t} small filled>● {t}</WFChip>
            ))}
          </div>
        </div>
      </div>

      {/* Action row */}
      <div style={{ padding: '4px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <CircleAction>{Icon.x(20)}</CircleAction>
        <CircleAction tone="star">{Icon.star(18)}</CircleAction>
        <CircleAction tone="like">{Icon.heart(22)}</CircleAction>
        <CircleAction>{Icon.msg(18)}</CircleAction>
      </div>
    </MobileShell>
  );
}

function CircleAction({ children, tone }) {
  const sz = tone === 'like' ? 60 : 48;
  const bg = tone === 'like' ? WF.accent : 'transparent';
  const color = tone === 'like' ? '#fff' : tone === 'star' ? '#d6a200' : WF.ink;
  return (
    <div style={{
      width: sz, height: sz, borderRadius: '50%',
      border: `1.5px solid ${tone === 'like' ? WF.accent : WF.line}`,
      background: bg, color, display: 'grid', placeItems: 'center',
      boxShadow: tone === 'like' ? '0 6px 16px rgba(0,0,0,0.15)' : 'none',
    }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// DISCOVER B — Map-based: explore buddies clustered on a map
// ─────────────────────────────────────────────────────────────────────
function MDiscoverB() {
  return (
    <MobileShell active="discover">
      {/* Sticky search */}
      <div style={{ padding: '8px 12px', display: 'flex', gap: 8 }}>
        <div style={{
          flex: 1, height: 36, borderRadius: 18, border: `1px solid ${WF.line}`,
          padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8,
          background: WF.bg, fontSize: 12, color: WF.muted,
        }}>
          {Icon.search(14)} Bali, Indonesia
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${WF.line}`, display: 'grid', placeItems: 'center' }}>{Icon.sliders(15)}</div>
      </div>

      {/* Map area */}
      <div style={{ position: 'relative', flex: 1, margin: '0 12px', borderRadius: 14, overflow: 'hidden', border: `1px solid ${WF.line}`, background: '#dfe6e6' }}>
        {/* fake map */}
        <svg width="100%" height="100%" viewBox="0 0 360 500" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
          {/* land mass shapes */}
          <rect width="360" height="500" fill="#e8efe8" />
          <path d="M-20 280 Q 80 240 160 270 T 360 240 L 360 500 L -20 500 Z" fill="#d2e0d4" />
          <path d="M40 60 Q 140 30 220 80 T 380 70 L 380 200 Q 280 220 200 190 T 40 200 Z" fill="#d8e4d8" />
          {/* roads */}
          <path d="M0 320 Q 180 300 360 360" stroke="#fff" strokeWidth="3" fill="none" opacity="0.6" />
          <path d="M120 0 Q 140 250 100 500" stroke="#fff" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M240 0 Q 280 200 260 500" stroke="#fff" strokeWidth="2" fill="none" opacity="0.4" />
          {/* labels */}
          <text x="60" y="120" fontSize="9" fill="#7a8579" fontFamily="ui-sans-serif">UBUD</text>
          <text x="200" y="350" fontSize="9" fill="#7a8579" fontFamily="ui-sans-serif">CANGGU</text>
          <text x="270" y="420" fontSize="9" fill="#7a8579" fontFamily="ui-sans-serif">SEMINYAK</text>
        </svg>

        {/* Buddy clusters */}
        {[
          { x: 80, y: 130, n: 12, top: false },
          { x: 220, y: 320, n: 8, top: true },
          { x: 270, y: 200, n: 5, top: false },
          { x: 140, y: 390, n: 3, top: false },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${c.x/360*100}%`, top: `${c.y/500*100}%`,
            transform: 'translate(-50%, -50%)',
            width: c.top ? 56 : 44, height: c.top ? 56 : 44,
            borderRadius: '50%',
            background: c.top ? WF.ink : '#fff',
            color: c.top ? '#fff' : WF.ink,
            border: c.top ? `2px solid #fff` : `2px solid ${WF.ink}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700,
          }}>{c.n}</div>
        ))}

        {/* Selected buddy bubble */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          padding: 3, borderRadius: '50%', background: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
        }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${WF.accent}` }}>
            <WFImage src={PHOTOS.priya} ratio="1" radius={999} />
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{
          position: 'absolute', top: 12, left: 12, display: 'flex',
          background: '#fff', borderRadius: 8, padding: 3, boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          fontSize: 11, fontWeight: 600,
        }}>
          <span style={{ padding: '5px 10px', borderRadius: 5, background: WF.ink, color: '#fff' }}>Map</span>
          <span style={{ padding: '5px 10px', color: WF.muted }}>Cards</span>
        </div>
      </div>

      {/* Bottom sheet — selected buddy */}
      <div style={{
        margin: 12, padding: 12, borderRadius: 14, border: `1px solid ${WF.line}`,
        display: 'flex', gap: 10, alignItems: 'center', background: WF.bg,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden' }}>
          <WFImage src={PHOTOS.priya} ratio="1" radius={10} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Priya, 27 · Ubud now</div>
          <div style={{ fontSize: 10.5, color: WF.muted, marginTop: 2 }}>94% match · 4 shared interests · same dates</div>
        </div>
        <WFButton variant="filled" size="sm" icon={Icon.heart(13)}>Match</WFButton>
      </div>
    </MobileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PROFILE A — Standard profile detail (photos → bio → interests → trip)
// ─────────────────────────────────────────────────────────────────────
function MProfileA() {
  return (
    <MobileShell hideTabs>
      <div style={{ height: '100%', overflow: 'auto', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <WFImage src={PHOTOS.priya} ratio="3/4" />
          {/* top floating chrome */}
          <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'grid', placeItems: 'center', backdropFilter: 'blur(8px)' }}>{Icon.back(16)}</div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'grid', placeItems: 'center', backdropFilter: 'blur(8px)' }}>{Icon.more(16)}</div>
          </div>
          {/* photo dots */}
          <div style={{ position: 'absolute', top: 12, left: 60, right: 60, display: 'flex', gap: 4 }}>
            {[1,1,0,0].map((on,i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: on ? '#fff' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
          {/* identity overlay */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, padding: '40px 18px 14px', color: '#fff',
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, opacity: 0.9 }}>
              {Icon.shield(11)} Verified · Trust 4.8 ★
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>Priya Shah, 27</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Mumbai · speaks EN · HI · GU</div>
          </div>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* match score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${WF.ink}`, display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 800 }}>94%</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Strong interest match</div>
              <div style={{ fontSize: 11, color: WF.muted }}>4 shared · same dates · ₹1.8k–4.2k/day overlap</div>
            </div>
          </div>

          {/* About */}
          <div>
            <SectionH>About</SectionH>
            <p style={{ fontSize: 13, lineHeight: 1.55, margin: '6px 0 0', color: WF.ink }}>
              Food walks, old city lanes, slow mornings, and clean hostels. Looking for a chill buddy who shows up on time.
            </p>
          </div>

          {/* Interests */}
          <div>
            <SectionH>Interests · 4 shared</SectionH>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {[['Food walks',1],['Hostels',1],['Photography',1],['Slow travel',1],['Heritage',0],['Markets',0]].map(([t,on]) => (
                <WFChip key={t} filled={!!on}>{on ? '● ' : ''}{t}</WFChip>
              ))}
            </div>
          </div>

          {/* Trip */}
          <div>
            <SectionH>Upcoming trip</SectionH>
            <div style={{ marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${WF.line}`, display: 'flex', gap: 10 }}>
              <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                <WFImage src={PHOTOS.bali} ratio="1" radius={8} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Bali, Indonesia</div>
                <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>Jul 4 — Jul 16 · 12 nights</div>
                <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>Budget · ₹1.8k–4.2k / day</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 80 }} />
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: 14, background: WF.bg, borderTop: `1px solid ${WF.line}`,
        display: 'flex', gap: 8,
      }}>
        <WFButton variant="outline" size="lg">Skip</WFButton>
        <div style={{ flex: 1 }}><WFButton variant="filled" size="lg" block icon={Icon.heart(15)}>Match with Priya</WFButton></div>
      </div>
    </MobileShell>
  );
}

function SectionH({ children }) {
  return <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────
// PROFILE B — Trip-led: itinerary + compatibility breakdown
// ─────────────────────────────────────────────────────────────────────
function MProfileB() {
  return (
    <MobileShell hideTabs bg={WF.fillSoft}>
      <div style={{ height: '100%', overflow: 'auto', padding: '10px 14px 90px' }}>
        {/* Header bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0 12px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${WF.line}`, display: 'grid', placeItems: 'center', background: WF.bg }}>{Icon.back(15)}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: WF.muted }}>BUDDY · BALI TRIP</div>
          <div style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${WF.line}`, display: 'grid', placeItems: 'center', background: WF.bg }}>{Icon.more(15)}</div>
        </div>

        {/* Identity card */}
        <div style={{ background: WF.bg, borderRadius: 14, border: `1px solid ${WF.line}`, padding: 14, display: 'flex', gap: 12 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <WFImage src={PHOTOS.priya} ratio="1" radius={999} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Priya, 27</div>
            <div style={{ fontSize: 11, color: WF.muted, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              {Icon.shield(11)} Verified · Mumbai
            </div>
            <div style={{ fontSize: 11, marginTop: 4, fontWeight: 500 }}>"Slow mornings, clean hostels, late food walks."</div>
          </div>
        </div>

        {/* Compatibility breakdown */}
        <div style={{ marginTop: 12, background: WF.bg, borderRadius: 14, border: `1px solid ${WF.line}`, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Compatibility · 94%</div>
            <div style={{ fontSize: 10, color: WF.muted }}>HOW WE MATCH</div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Interests', 4, 6, 'Food walks · Hostels · Photography · Slow travel'],
              ['Travel style', 1, 1, 'Both budget travelers'],
              ['Dates', 1, 1, 'Both Jul 4–16'],
              ['Daily budget', 1, 1, '₹1.8–4.2k overlap with yours'],
              ['Pace', 1, 1, 'Both relaxed planners'],
            ].map(([k, on, total, note]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 10, alignItems: 'center' }}>
                <div style={{ fontSize: 11.5, fontWeight: 600 }}>{k}</div>
                <div style={{ height: 6, borderRadius: 999, background: WF.fill, overflow: 'hidden' }}>
                  <div style={{ width: `${on/total*100}%`, height: '100%', background: WF.ink }} />
                </div>
                <div style={{ fontSize: 10, color: WF.muted }}>{on}/{total}</div>
                <div style={{ gridColumn: '2 / -1', fontSize: 10, color: WF.muted }}>{note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Itinerary */}
        <div style={{ marginTop: 12, background: WF.bg, borderRadius: 14, border: `1px solid ${WF.line}`, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Her Bali plan</div>
            <div style={{ fontSize: 10, color: WF.muted }}>JUL 4 — JUL 16</div>
          </div>
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              ['Jul 4–7', 'Ubud — yoga, rice terraces'],
              ['Jul 8–11', 'Canggu — surf, cafés'],
              ['Jul 12–16', 'Nusa Lembongan — diving'],
            ].map(([d, t]) => (
              <div key={d} style={{ display: 'flex', gap: 10, paddingLeft: 6, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 0, top: 4, width: 6, height: 6, borderRadius: 3, background: WF.ink }} />
                <div style={{ paddingLeft: 14 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.muted }}>{d}</div>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{t}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, padding: 8, borderRadius: 8, background: WF.fillSoft, fontSize: 11, color: WF.muted }}>
            Your dates overlap on <b style={{ color: WF.ink }}>all 12 nights</b>.
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: 14, background: WF.bg, borderTop: `1px solid ${WF.line}`,
        display: 'flex', gap: 8,
      }}>
        <WFButton variant="outline" size="lg">Pass</WFButton>
        <div style={{ flex: 1 }}><WFButton variant="filled" size="lg" block>Ask to join her trip</WFButton></div>
      </div>
    </MobileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// MATCHES A — Standard list (recent, unread, pinned)
// ─────────────────────────────────────────────────────────────────────
function MMatchesA() {
  return (
    <MobileShell active="matches">
      <div style={{ padding: '12px 16px 8px' }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Matches</div>
        <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>12 active · 3 new</div>
      </div>

      {/* New matches strip */}
      <div style={{ padding: '4px 16px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>New · 3</div>
        <div style={{ display: 'flex', gap: 10, overflow: 'auto', paddingBottom: 4 }}>
          {[PHOTOS.priya, PHOTOS.rahul, PHOTOS.ananya, PHOTOS.arjun].map((src, i) => (
            <div key={i} style={{ flexShrink: 0, width: 64 }}>
              <div style={{ position: 'relative', width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: i < 2 ? `2px solid ${WF.accent}` : `1px solid ${WF.line}` }}>
                <WFImage src={src} ratio="1" radius={999} />
              </div>
              <div style={{ fontSize: 10, textAlign: 'center', marginTop: 4, fontWeight: 600 }}>
                {['Priya','Rahul','Ananya','Arjun'][i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 16px 8px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Messages</div>
      </div>

      {/* Conversations */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {[
          { name: 'Priya Shah', msg: 'Thinking of doing the Tegallalang walk on day 2 — interested?', time: '2m', unread: 2, pin: true, src: PHOTOS.priya },
          { name: 'Rahul Mehta', msg: 'Sent the homestay link in Ubud', time: '1h', unread: 0, src: PHOTOS.rahul },
          { name: 'Ananya Rao', msg: 'You: same dates! Should we sync on bus tickets?', time: '4h', unread: 0, src: PHOTOS.ananya },
          { name: 'Meera Iyer', msg: 'Photo · Sukawati market', time: 'yest', unread: 1, src: PHOTOS.meera },
          { name: 'Vikram Singh', msg: 'Cool, lets compare itineraries tomorrow', time: '2d', unread: 0, src: PHOTOS.vikram },
        ].map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 16px', alignItems: 'center', borderBottom: `1px solid ${WF.fill}` }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
              <WFImage src={m.src} ratio="1" radius={999} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {m.name} {m.pin && <span style={{ fontSize: 9, color: WF.muted }}>📌</span>}
                </div>
                <div style={{ fontSize: 10.5, color: WF.muted }}>{m.time}</div>
              </div>
              <div style={{ fontSize: 11.5, color: m.unread ? WF.ink : WF.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: m.unread ? 600 : 400 }}>
                {m.msg}
              </div>
            </div>
            {m.unread > 0 && (
              <div style={{
                minWidth: 18, height: 18, borderRadius: 9, padding: '0 5px',
                background: WF.accent, color: '#fff', fontSize: 10, fontWeight: 700,
                display: 'grid', placeItems: 'center',
              }}>{m.unread}</div>
            )}
          </div>
        ))}
      </div>
    </MobileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// MATCHES B — Clustered by trip (novel: matches grouped per destination)
// ─────────────────────────────────────────────────────────────────────
function MMatchesB() {
  return (
    <MobileShell active="matches" bg={WF.fillSoft}>
      <div style={{ padding: '12px 16px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Your trips & buddies</div>
          <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>2 trips · 12 buddies total</div>
        </div>
        <WFButton variant="outline" size="sm" icon={Icon.plus(13)}>Trip</WFButton>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 14px 14px' }}>
        {/* Trip group: Bali */}
        <div style={{ background: WF.bg, borderRadius: 14, overflow: 'hidden', border: `1px solid ${WF.line}`, marginBottom: 12 }}>
          <div style={{ position: 'relative', height: 100 }}>
            <WFImage src={PHOTOS.bali} ratio="auto" style={{ aspectRatio: 'unset', height: '100%', position: 'absolute', inset: 0 }} />
            <div style={{
              position: 'absolute', inset: 0, padding: 12,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
              color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trip 1 · 5 buddies</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Bali · Jul 4–16</div>
            </div>
          </div>
          {[
            { name: 'Priya', msg: 'Thinking of Tegallalang day 2 — in?', time: '2m', unread: 2, src: PHOTOS.priya, status: 'matched' },
            { name: 'Rahul', msg: 'Sent the homestay link', time: '1h', unread: 0, src: PHOTOS.rahul, status: 'matched' },
            { name: 'Ananya', msg: 'Wants to join · awaiting your reply', time: '5h', unread: 0, src: PHOTOS.ananya, status: 'pending' },
          ].map((m,i,arr) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', alignItems: 'center', borderTop: i === 0 ? 'none' : `1px solid ${WF.fill}` }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <WFImage src={m.src} ratio="1" radius={999} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{m.name}</span>
                  {m.status === 'pending' && <span style={{ fontSize: 9, padding: '1px 5px', background: '#fff4b8', color: '#7a5a10', borderRadius: 3, fontWeight: 700 }}>PENDING</span>}
                </div>
                <div style={{ fontSize: 11, color: m.unread ? WF.ink : WF.muted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: m.unread ? 600 : 400 }}>
                  {m.msg}
                </div>
              </div>
              <div style={{ fontSize: 10, color: WF.muted }}>{m.time}</div>
              {m.unread > 0 && (
                <div style={{ minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px', background: WF.accent, color: '#fff', fontSize: 9, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{m.unread}</div>
              )}
            </div>
          ))}
          <div style={{ padding: '8px 14px', fontSize: 11, color: WF.muted, borderTop: `1px solid ${WF.fill}`, textAlign: 'center', fontWeight: 600 }}>
            View all 5 buddies →
          </div>
        </div>

        {/* Trip group: Vietnam */}
        <div style={{ background: WF.bg, borderRadius: 14, overflow: 'hidden', border: `1px solid ${WF.line}` }}>
          <div style={{ position: 'relative', height: 100 }}>
            <WFImage src={PHOTOS.vietnam} ratio="auto" style={{ aspectRatio: 'unset', height: '100%', position: 'absolute', inset: 0 }} />
            <div style={{
              position: 'absolute', inset: 0, padding: 12,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
              color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Trip 2 · 7 buddies</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>Vietnam · Aug 2–14</div>
            </div>
          </div>
          {[
            { name: 'Meera', msg: 'Photo · Hanoi old quarter', time: '1d', unread: 1, src: PHOTOS.meera },
            { name: 'Vikram', msg: 'Train tickets sorted!', time: '3d', unread: 0, src: PHOTOS.vikram },
          ].map((m,i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 14px', alignItems: 'center', borderTop: i === 0 ? 'none' : `1px solid ${WF.fill}` }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <WFImage src={m.src} ratio="1" radius={999} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: m.unread ? WF.ink : WF.muted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.msg}</div>
              </div>
              <div style={{ fontSize: 10, color: WF.muted }}>{m.time}</div>
              {m.unread > 0 && <div style={{ minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px', background: WF.accent, color: '#fff', fontSize: 9, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{m.unread}</div>}
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CHAT A — Standard chat (header, bubbles, composer)
// ─────────────────────────────────────────────────────────────────────
function MChatA() {
  return (
    <MobileShell hideTabs>
      {/* Header */}
      <div style={{ padding: '8px 12px 10px', borderBottom: `1px solid ${WF.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }}>{Icon.back(18)}</div>
        <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden' }}>
          <WFImage src={PHOTOS.priya} ratio="1" radius={999} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
            Priya Shah {Icon.shield(11)}
          </div>
          <div style={{ fontSize: 10.5, color: WF.muted }}>Bali · Jul 4–16 · online</div>
        </div>
        <div style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', color: WF.muted }}>{Icon.more(18)}</div>
      </div>

      {/* Match banner */}
      <div style={{ margin: 12, padding: 10, borderRadius: 10, background: WF.fillSoft, border: `1px solid ${WF.line}`, fontSize: 11, color: WF.muted, textAlign: 'center' }}>
        ✦ You matched 2 days ago — both going to Bali
      </div>

      {/* Bubbles */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Bubble who="them">Hey! Saw we have the same Bali dates 🎉</Bubble>
        <Bubble who="them">What part are you starting in?</Bubble>
        <Bubble who="me">Hii! Yes, was so excited to see your profile. Starting with Ubud — 4 nights.</Bubble>
        <Bubble who="me">Then Canggu for surf lessons.</Bubble>
        <Bubble who="them">Same!! Want to do the Tegallalang walk together day 2?</Bubble>
        <DateChip>10:42 AM</DateChip>
        <Bubble who="me">Yes definitely. Should we share Ubud stay?</Bubble>
        <Bubble who="them">Open to it. Sending a hostel option →</Bubble>
        {/* Trip card */}
        <div style={{ alignSelf: 'flex-start', maxWidth: 240, border: `1px solid ${WF.line}`, borderRadius: 14, overflow: 'hidden', background: WF.bg }}>
          <WFImage src={PHOTOS.bali} ratio="2/1" />
          <div style={{ padding: 10 }}>
            <div style={{ fontSize: 10, color: WF.muted, fontWeight: 700, textTransform: 'uppercase' }}>Hostel · Ubud</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>The Onion Collective</div>
            <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>4.7 ★ · ₹1,200 / night · twin room</div>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div style={{ padding: '8px 10px 12px', borderTop: `1px solid ${WF.line}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${WF.line}`, display: 'grid', placeItems: 'center' }}>{Icon.plus(16)}</div>
        <div style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 18, border: `1px solid ${WF.line}`, fontSize: 12, color: WF.muted, display: 'flex', alignItems: 'center' }}>Message…</div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: WF.ink, color: '#fff', display: 'grid', placeItems: 'center' }}>{Icon.send(15)}</div>
      </div>
    </MobileShell>
  );
}

function Bubble({ who, children }) {
  const me = who === 'me';
  return (
    <div style={{
      alignSelf: me ? 'flex-end' : 'flex-start',
      maxWidth: '78%',
      padding: '8px 12px',
      borderRadius: me ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      background: me ? WF.ink : WF.fill,
      color: me ? '#fff' : WF.ink,
      fontSize: 12.5, lineHeight: 1.45,
    }}>{children}</div>
  );
}

function DateChip({ children }) {
  return (
    <div style={{ alignSelf: 'center', fontSize: 10, color: WF.muted, padding: '6px 0', fontWeight: 600 }}>{children}</div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CHAT B — Trip-plan rail: chat + collaborative itinerary on the side
// ─────────────────────────────────────────────────────────────────────
function MChatB() {
  return (
    <MobileShell hideTabs>
      {/* Header */}
      <div style={{ padding: '8px 12px 10px', borderBottom: `1px solid ${WF.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, display: 'grid', placeItems: 'center' }}>{Icon.back(18)}</div>
        <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden' }}>
          <WFImage src={PHOTOS.priya} ratio="1" radius={999} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Priya · Bali Trip</div>
          <div style={{ fontSize: 10.5, color: WF.muted }}>2 buddies · Jul 4–16</div>
        </div>
        <div style={{ padding: '4px 8px', border: `1px solid ${WF.line}`, borderRadius: 6, fontSize: 10, fontWeight: 700 }}>Plan</div>
      </div>

      {/* Tabs: Chat | Plan */}
      <div style={{ display: 'flex', padding: '8px 12px 0', gap: 4 }}>
        <div style={{ padding: '6px 12px', borderRadius: '8px 8px 0 0', borderBottom: `2px solid ${WF.ink}`, fontSize: 11.5, fontWeight: 700 }}>Chat</div>
        <div style={{ padding: '6px 12px', fontSize: 11.5, color: WF.muted, fontWeight: 600 }}>Plan · 4</div>
        <div style={{ padding: '6px 12px', fontSize: 11.5, color: WF.muted, fontWeight: 600 }}>Costs</div>
      </div>

      {/* Active Plan card pinned to top */}
      <div style={{ margin: '10px 12px 0', padding: 10, borderRadius: 12, border: `1px dashed ${WF.lineHard}`, background: WF.fillSoft }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Currently planning</div>
          <div style={{ fontSize: 10, color: WF.muted }}>2 / 2 in</div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>Tegallalang rice walk · Jul 5</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <span style={{ fontSize: 10, padding: '2px 7px', background: WF.ink, color: '#fff', borderRadius: 999, fontWeight: 700 }}>You · in</span>
          <span style={{ fontSize: 10, padding: '2px 7px', background: WF.ink, color: '#fff', borderRadius: 999, fontWeight: 700 }}>Priya · in</span>
        </div>
      </div>

      {/* Bubbles */}
      <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Bubble who="them">Hey! Same Bali dates 🎉</Bubble>
        <Bubble who="me">Yes! Starting in Ubud.</Bubble>

        {/* System: plan added */}
        <div style={{ alignSelf: 'center', fontSize: 10, color: WF.muted, padding: '8px 12px', background: WF.fillSoft, borderRadius: 999, border: `1px solid ${WF.line}`, fontWeight: 600 }}>
          ✦ Priya added "Tegallalang rice walk" to plan
        </div>

        <Bubble who="them">Should we book the homestay together?</Bubble>
        <Bubble who="me">Lets! Sending an option →</Bubble>

        {/* Cost split card */}
        <div style={{ alignSelf: 'flex-end', maxWidth: 240, border: `1px solid ${WF.line}`, borderRadius: 14, overflow: 'hidden', background: WF.bg }}>
          <div style={{ padding: 10 }}>
            <div style={{ fontSize: 10, color: WF.muted, fontWeight: 700, textTransform: 'uppercase' }}>Cost split · 2 ppl</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>Onion Collective · 4 nights</div>
            <div style={{ fontSize: 11, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: WF.muted }}>Your share</span>
              <span style={{ fontWeight: 700 }}>₹2,400</span>
            </div>
            <WFRule my={6} />
            <WFButton variant="filled" size="sm" block>Confirm split</WFButton>
          </div>
        </div>
      </div>

      {/* Composer with quick-add */}
      <div style={{ padding: '8px 10px 12px', borderTop: `1px solid ${WF.line}` }}>
        <div style={{ display: 'flex', gap: 6, padding: '0 0 8px', overflow: 'auto' }}>
          {['+ Plan', '₹ Cost', '📍 Pin', '📷 Photo'].map((t) => (
            <span key={t} style={{ flexShrink: 0, padding: '5px 10px', borderRadius: 999, border: `1px solid ${WF.line}`, fontSize: 11, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 18, border: `1px solid ${WF.line}`, fontSize: 12, color: WF.muted, display: 'flex', alignItems: 'center' }}>Message or @add to plan…</div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: WF.ink, color: '#fff', display: 'grid', placeItems: 'center' }}>{Icon.send(15)}</div>
        </div>
      </div>
    </MobileShell>
  );
}

Object.assign(window, {
  MOnboardingA, MOnboardingB,
  MDiscoverA, MDiscoverB,
  MProfileA, MProfileB,
  MMatchesA, MMatchesB,
  MChatA, MChatB,
  M_W, M_H,
  SectionH, Bubble, DateChip,
});
