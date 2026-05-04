// wf-web.jsx — Web (desktop) wireframes for Explore Fusion
// 5 artboards (A/B): Onboarding, Discover, Profile, Matches, Chat

const W_W = 1180;
const W_H = 740;

function WebShell({ children, active = 'discover', minimal = false }) {
  return (
    <div style={{
      width: W_W, height: W_H, background: 'var(--wf-bg, #fff)', color: WF.ink,
      fontFamily: 'ui-sans-serif, system-ui', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Top nav */}
      <div style={{
        height: 56, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 24,
        borderBottom: `1px solid ${WF.line}`, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 14 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: WF.ink, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800 }}>EF</div>
          Explore Fusion
        </div>
        {!minimal && (
          <>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['discover','Discover'],['matches','Matches'],['trips','Group trips'],['chat','Chat']].map(([id, label]) => (
                <div key={id} style={{
                  padding: '6px 12px', borderRadius: 6, fontSize: 12.5, fontWeight: 600,
                  background: active === id ? WF.fill : 'transparent',
                  color: active === id ? WF.ink : WF.muted,
                }}>{label}</div>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 240, height: 32, padding: '0 10px', borderRadius: 6, border: `1px solid ${WF.line}`, fontSize: 11.5, color: WF.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                {Icon.search(13)} Search destinations, buddies…
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden' }}>
                <WFImage src={PHOTOS.arjun} ratio="1" radius={999} />
              </div>
            </div>
          </>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ONBOARDING A — Two-column stepper
// ─────────────────────────────────────────────────────────────────────
function WOnboardingA() {
  return (
    <WebShell minimal>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '100%' }}>
        <div style={{ borderRight: `1px solid ${WF.line}`, padding: 28, background: WF.fillSoft, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Set up your travel profile</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 8, lineHeight: 1.2 }}>5 steps to find your travel buddy</div>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['Account', true],
              ['Travel style', true],
              ['Interests', false, 'now'],
              ['Trip dates', false],
              ['Photos & verification', false],
            ].map(([label, done, now], i) => (
              <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', display: 'grid', placeItems: 'center',
                  background: done ? WF.ink : (now ? WF.bg : WF.fill),
                  border: now ? `2px solid ${WF.ink}` : 'none',
                  color: done ? '#fff' : WF.ink,
                  fontSize: 11, fontWeight: 800,
                }}>{done ? '✓' : i + 1}</div>
                <div style={{ fontSize: 13, fontWeight: now ? 700 : 500, color: done ? WF.muted : WF.ink }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', fontSize: 11, color: WF.muted, padding: 12, border: `1px dashed ${WF.line}`, borderRadius: 8 }}>
            We never match by gender alone. Compatibility is interest-first.
          </div>
        </div>

        <div style={{ padding: 40, overflow: 'auto' }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Step 3 of 5</div>
            <h1 style={{ fontSize: 30, fontWeight: 700, margin: '6px 0 0', lineHeight: 1.15 }}>What lights you up on a trip?</h1>
            <p style={{ fontSize: 14, color: WF.muted, margin: '8px 0 0' }}>Pick 5–12. We use these to find buddies who'd actually enjoy the same things.</p>

            <div style={{ marginTop: 24 }}>
              {[
                ['Pace & vibe', ['Slow travel', 'Backpacking', 'Luxury', 'Spontaneous', 'Planned-out']],
                ['Things to do', ['Food walks', 'Hiking', 'Trekking', 'Surfing', 'Beach', 'Diving', 'Cycling', 'Yoga']],
                ['Culture', ['Heritage', 'Temples', 'Markets', 'Festivals', 'Photography', 'Music gigs']],
                ['Stay', ['Hostels', 'Homestays', 'Boutique hotels', 'Airbnb', 'Camping']],
              ].map(([cat, tags]) => (
                <div key={cat} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{cat}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {tags.map((t, i) => {
                      const on = (cat === 'Things to do' && (t === 'Food walks' || t === 'Hiking' || t === 'Photography'))
                              || (cat === 'Culture' && (t === 'Heritage' || t === 'Markets'))
                              || (cat === 'Stay' && t === 'Hostels')
                              || (cat === 'Pace & vibe' && t === 'Slow travel');
                      return (
                        <span key={t} style={{
                          padding: '7px 13px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                          border: `1px solid ${on ? WF.ink : WF.line}`,
                          background: on ? WF.ink : 'transparent',
                          color: on ? '#fff' : WF.ink,
                        }}>{t}</span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32, display: 'flex', gap: 10, alignItems: 'center' }}>
              <WFButton variant="ghost" size="lg">Back</WFButton>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 11.5, color: WF.muted }}>7 selected · pick min 5</span>
              <WFButton variant="filled" size="lg">Continue →</WFButton>
            </div>
          </div>
        </div>
      </div>
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// ONBOARDING B — Trip-first hero (web entry)
// ─────────────────────────────────────────────────────────────────────
function WOnboardingB() {
  return (
    <WebShell minimal>
      <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
        {/* Background image */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <WFImage src={PHOTOS.bali} ratio="auto" style={{ aspectRatio: 'unset', height: '100%', position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)' }} />
        </div>

        <div style={{ position: 'relative', height: '100%', padding: '60px 80px', display: 'flex', flexDirection: 'column', color: '#fff' }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Travel buddy matching · interest-first</div>
          <h1 className="ef-display" style={{ fontSize: 72, fontWeight: 400, margin: '12px 0 0', lineHeight: 1.0, maxWidth: 720, letterSpacing: '-0.02em' }}>
            Who do you want next to you on the trip?
          </h1>
          <p style={{ fontSize: 16, marginTop: 18, maxWidth: 540, lineHeight: 1.5, opacity: 0.92 }}>
            We match by where you're going, when, and what you actually want to do — not gender. Skip signup until it matters.
          </p>

          {/* Inline trip search */}
          <div style={{
            marginTop: 32, background: '#fff', color: WF.ink, borderRadius: 14, padding: 6,
            display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr auto', gap: 0,
            maxWidth: 820, boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          }}>
            <div style={{ padding: '10px 16px', borderRight: `1px solid ${WF.line}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Where</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>Bali, Indonesia</div>
            </div>
            <div style={{ padding: '10px 16px', borderRight: `1px solid ${WF.line}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>When</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>Jul 4 — Jul 16</div>
            </div>
            <div style={{ padding: '10px 16px', borderRight: `1px solid ${WF.line}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Travel style</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>Budget</div>
            </div>
            <div style={{ padding: 6, display: 'flex', alignItems: 'center' }}>
              <button style={{
                height: '100%', padding: '0 22px', borderRadius: 10, border: 'none',
                background: WF.ink, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>{Icon.search(14)} Find buddies</button>
            </div>
          </div>

          {/* Trending */}
          <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, opacity: 0.85, alignSelf: 'center', marginRight: 4 }}>Trending:</span>
            {['Vietnam · Aug', 'Himachal · Jun', 'Goa · Sep', 'Meghalaya · Oct', 'Jaipur · Jun'].map((t) => (
              <span key={t} style={{
                padding: '6px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}>{t}</span>
            ))}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: 24, fontSize: 11, opacity: 0.85 }}>
            <span>● Verified IDs</span>
            <span>● Interest-first matching</span>
            <span>● Group trips & cost split</span>
            <span>● 24/7 safety check-in</span>
          </div>
        </div>
      </div>
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// DISCOVER A — Grid of buddy cards
// ─────────────────────────────────────────────────────────────────────
function WDiscoverA() {
  const cards = [
    { name: 'Priya Shah', age: 27, city: 'Mumbai', score: 94, src: PHOTOS.priya, tags: ['Food walks', 'Hostels', 'Photography'], when: 'Bali · Jul 4–16' },
    { name: 'Rahul Mehta', age: 31, city: 'Bengaluru', score: 89, src: PHOTOS.rahul, tags: ['Hiking', 'Beaches', 'Photography'], when: 'Bali · Jul 6–18' },
    { name: 'Ananya Rao', age: 24, city: 'Delhi', score: 81, src: PHOTOS.ananya, tags: ['Temples', 'Markets'], when: 'Bali · Jul 4–10' },
    { name: 'Arjun Nair', age: 29, city: 'Pune', score: 78, src: PHOTOS.arjun, tags: ['Surfing', 'Cafés'], when: 'Bali · Jul 8–20' },
    { name: 'Meera Iyer', age: 26, city: 'Chennai', score: 92, src: PHOTOS.meera, tags: ['Yoga', 'Slow travel'], when: 'Bali · Jul 5–14' },
    { name: 'Vikram Singh', age: 33, city: 'Jaipur', score: 76, src: PHOTOS.vikram, tags: ['Heritage', 'Photography'], when: 'Bali · Jul 4–12' },
  ];
  return (
    <WebShell active="discover">
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100%' }}>
        {/* Filter sidebar */}
        <div style={{ borderRight: `1px solid ${WF.line}`, padding: 20, overflow: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filters</div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <WFField label="Destination" value="Bali, Indonesia" />
            <WFField label="Dates" value="Jul 4 — Jul 16" />
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Travel style</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {[['Backpacker',0],['Budget',1],['Mid',0],['Luxury',0]].map(([t, on]) => (
                  <span key={t} style={{ padding: '4px 9px', fontSize: 11, fontWeight: 600, borderRadius: 999, border: `1px solid ${on ? WF.ink : WF.line}`, background: on ? WF.ink : 'transparent', color: on ? '#fff' : WF.ink }}>{t}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Budget / day (₹)</div>
              <div style={{ height: 36, padding: '0 10px', border: `1px solid ${WF.line}`, borderRadius: 6, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>1,500</span>
                <div style={{ flex: 1, margin: '0 10px', height: 4, background: WF.fill, borderRadius: 2, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '15%', right: '40%', height: '100%', background: WF.ink, borderRadius: 2 }} />
                </div>
                <span>5,000</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Interests</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {['Food walks', 'Hostels', 'Photography', 'Hiking'].map((t) => (
                  <span key={t} style={{ padding: '4px 9px', fontSize: 11, fontWeight: 500, borderRadius: 999, background: WF.ink, color: '#fff' }}>● {t}</span>
                ))}
                <span style={{ padding: '4px 9px', fontSize: 11, fontWeight: 500, borderRadius: 999, border: `1px solid ${WF.line}`, color: WF.muted }}>+ add</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', fontSize: 11.5 }}>
              <span style={{ fontWeight: 600 }}>Verified only</span>
              <div style={{ width: 32, height: 18, borderRadius: 9, background: WF.ink, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: '#fff' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ padding: '20px 24px', overflow: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>47 buddies headed to Bali</div>
              <div style={{ fontSize: 12, color: WF.muted, marginTop: 2 }}>Jul 4 — Jul 16 · sorted by interest match</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, background: WF.fill }}>Match %</span>
              <span style={{ padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, color: WF.muted }}>Recent</span>
              <span style={{ padding: '5px 10px', fontSize: 11, fontWeight: 600, borderRadius: 6, color: WF.muted }}>Verified</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {cards.map((c) => (
              <div key={c.name} style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${WF.line}`, background: WF.bg }}>
                <div style={{ position: 'relative' }}>
                  <WFImage src={c.src} ratio="4/5" />
                  <div style={{ position: 'absolute', top: 8, left: 8, padding: '3px 8px', borderRadius: 999, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, fontWeight: 700 }}>{c.score}% match</div>
                  <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, color: '#fff' }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{c.name}, {c.age}</div>
                    <div style={{ fontSize: 10.5, opacity: 0.9, display: 'flex', alignItems: 'center', gap: 4 }}>{Icon.shield(10)} {c.city}</div>
                  </div>
                </div>
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 10.5, color: WF.muted, marginBottom: 6 }}>{c.when}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {c.tags.map((t) => <WFChip key={t} small>{t}</WFChip>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// DISCOVER B — Map + cards split (novel for web)
// ─────────────────────────────────────────────────────────────────────
function WDiscoverB() {
  return (
    <WebShell active="discover">
      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', height: '100%' }}>
        {/* List rail */}
        <div style={{ borderRight: `1px solid ${WF.line}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: `1px solid ${WF.line}` }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 8, border: `1px solid ${WF.line}`, fontSize: 12, color: WF.ink, display: 'flex', alignItems: 'center', gap: 6 }}>{Icon.pin(13)} Bali, Indonesia · Jul 4–16</div>
              <div style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${WF.line}`, display: 'grid', placeItems: 'center' }}>{Icon.sliders(15)}</div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: WF.muted }}>47 buddies · 12 in Ubud · 18 in Canggu</div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {[
              { name: 'Priya, 27', tag: 'Ubud · Jul 4–7', score: 94, src: PHOTOS.priya, hl: true },
              { name: 'Meera, 26', tag: 'Ubud · Jul 5–9', score: 92, src: PHOTOS.meera },
              { name: 'Rahul, 31', tag: 'Canggu · Jul 8–14', score: 89, src: PHOTOS.rahul },
              { name: 'Ananya, 24', tag: 'Ubud · Jul 4–10', score: 81, src: PHOTOS.ananya },
              { name: 'Arjun, 29', tag: 'Canggu · Jul 8–20', score: 78, src: PHOTOS.arjun },
              { name: 'Vikram, 33', tag: 'Seminyak · Jul 4–12', score: 76, src: PHOTOS.vikram },
            ].map((c) => (
              <div key={c.name} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${WF.fill}`, background: c.hl ? WF.fillSoft : 'transparent', borderLeft: c.hl ? `3px solid ${WF.ink}` : '3px solid transparent' }}>
                <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  <WFImage src={c.src} ratio="1" radius={8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{c.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: WF.ink, padding: '2px 6px', background: WF.fill, borderRadius: 4 }}>{c.score}%</span>
                  </div>
                  <div style={{ fontSize: 11, color: WF.muted, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>{Icon.pin(11)} {c.tag}</div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {['Food walks', 'Photography', 'Hostels'].slice(0, 3).map((t) => (
                      <span key={t} style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 999, background: WF.fill, color: WF.ink, fontWeight: 500 }}>● {t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div style={{ position: 'relative', background: '#dfe6e6' }}>
          <svg width="100%" height="100%" viewBox="0 0 740 700" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0 }}>
            <rect width="740" height="700" fill="#e8efe8" />
            <path d="M-20 380 Q 160 320 360 360 T 760 320 L 760 700 L -20 700 Z" fill="#d2e0d4" />
            <path d="M40 80 Q 220 30 380 100 T 760 80 L 760 250 Q 480 280 320 240 T 40 250 Z" fill="#d8e4d8" />
            <path d="M0 420 Q 360 380 740 460" stroke="#fff" strokeWidth="3" fill="none" opacity="0.6" />
            <path d="M180 0 Q 220 350 160 700" stroke="#fff" strokeWidth="2" fill="none" opacity="0.55" />
            <path d="M460 0 Q 520 350 480 700" stroke="#fff" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M620 0 Q 660 250 640 700" stroke="#fff" strokeWidth="2" fill="none" opacity="0.4" />
            <text x="120" y="220" fontSize="13" fill="#7a8579" fontFamily="ui-sans-serif" fontWeight="600">UBUD</text>
            <text x="380" y="450" fontSize="13" fill="#7a8579" fontFamily="ui-sans-serif" fontWeight="600">CANGGU</text>
            <text x="540" y="540" fontSize="13" fill="#7a8579" fontFamily="ui-sans-serif" fontWeight="600">SEMINYAK</text>
            <text x="600" y="280" fontSize="13" fill="#7a8579" fontFamily="ui-sans-serif" fontWeight="600">NUSA</text>
          </svg>

          {[
            { x: 160, y: 240, n: 12, top: false },
            { x: 410, y: 470, n: 18, top: true, big: true },
            { x: 560, y: 560, n: 8, top: false },
            { x: 620, y: 320, n: 5, top: false },
            { x: 250, y: 380, n: 4, top: false },
          ].map((c, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${c.x/740*100}%`, top: `${c.y/700*100}%`,
              transform: 'translate(-50%, -50%)',
              width: c.big ? 72 : c.top ? 60 : 48, height: c.big ? 72 : c.top ? 60 : 48,
              borderRadius: '50%',
              background: c.top ? WF.ink : '#fff', color: c.top ? '#fff' : WF.ink,
              border: c.top ? `3px solid #fff` : `2px solid ${WF.ink}`,
              boxShadow: '0 4px 14px rgba(0,0,0,0.22)',
              display: 'grid', placeItems: 'center', fontSize: c.big ? 17 : 14, fontWeight: 800,
            }}>{c.n}</div>
          ))}

          {/* Highlighted: selected user */}
          <div style={{
            position: 'absolute', left: '21%', top: '34%', transform: 'translate(-50%, -50%)',
            background: '#fff', borderRadius: '50%', padding: 4, boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
          }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${WF.accent}` }}>
              <WFImage src={PHOTOS.priya} ratio="1" radius={999} />
            </div>
            {/* arrow */}
            <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 12, height: 12, background: '#fff' }} />
          </div>

          {/* Map controls */}
          <div style={{ position: 'absolute', top: 16, left: 16, background: '#fff', borderRadius: 8, padding: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.15)', display: 'flex', gap: 2, fontSize: 11.5, fontWeight: 600 }}>
            <span style={{ padding: '6px 12px', borderRadius: 5, background: WF.ink, color: '#fff' }}>Map</span>
            <span style={{ padding: '6px 12px', color: WF.muted }}>Heat</span>
            <span style={{ padding: '6px 12px', color: WF.muted }}>List</span>
          </div>
          <div style={{ position: 'absolute', top: 16, right: 16, background: '#fff', borderRadius: 8, padding: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.15)', fontSize: 10.5, color: WF.muted, fontWeight: 600 }}>
            Drag to draw an area to filter buddies
          </div>
        </div>
      </div>
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PROFILE A — Two-column profile detail (gallery + sidebar)
// ─────────────────────────────────────────────────────────────────────
function WProfileA() {
  return (
    <WebShell active="discover">
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', height: '100%', gap: 0 }}>
        <div style={{ padding: '24px 32px', overflow: 'auto' }}>
          <div style={{ fontSize: 11, color: WF.muted, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            {Icon.back(12)} Back to results
          </div>
          {/* Gallery */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 6, height: 360 }}>
            <WFImage src={PHOTOS.priya} ratio="auto" radius={10} style={{ aspectRatio: 'unset', height: '100%' }} />
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 6 }}>
              <WFImage src={PHOTOS.bali} ratio="auto" radius={10} style={{ aspectRatio: 'unset', height: '100%' }} />
              <WFImage src={PHOTOS.jaipur} ratio="auto" radius={10} style={{ aspectRatio: 'unset', height: '100%' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 6 }}>
              <WFImage src={PHOTOS.vietnam} ratio="auto" radius={10} style={{ aspectRatio: 'unset', height: '100%' }} />
              <div style={{ position: 'relative', background: WF.fill, borderRadius: 10, overflow: 'hidden' }}>
                <WFImage src={PHOTOS.himachal} ratio="auto" radius={10} style={{ aspectRatio: 'unset', height: '100%' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700 }}>+5 more</div>
              </div>
            </div>
          </div>

          {/* Identity */}
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Priya Shah, 27</h1>
              <div style={{ fontSize: 12.5, color: WF.muted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{Icon.pin(12)} Mumbai</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{Icon.shield(12)} Verified · Trust 4.8 ★</span>
                <span>EN · HI · GU</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>94%</div>
              <div style={{ fontSize: 11, color: WF.muted, fontWeight: 600 }}>interest match</div>
            </div>
          </div>

          <p style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 18, color: WF.ink }}>
            Food walks, old city lanes, slow mornings, and clean hostels. I prefer planning the food spots and leaving days flexible. Looking for a chill buddy who shows up on time and is up for late-night chai conversations.
          </p>

          {/* Interests */}
          <div style={{ marginTop: 18 }}>
            <SectionH>Interests</SectionH>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {[['Food walks',1],['Hostels',1],['Photography',1],['Slow travel',1],['Heritage',0],['Markets',0],['Yoga',0],['Cafés',0]].map(([t,on]) => (
                <span key={t} style={{
                  padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                  background: on ? WF.ink : 'transparent', color: on ? '#fff' : WF.ink,
                  border: `1px solid ${on ? WF.ink : WF.line}`,
                }}>{on ? '● ' : ''}{t}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[['Trust', '4.8 ★'], ['Trips', '12'], ['Languages', '3'], ['Response', '< 1h']].map(([k, v]) => (
              <div key={k} style={{ padding: 12, border: `1px solid ${WF.line}`, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: WF.muted, fontWeight: 600 }}>{k}</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ borderLeft: `1px solid ${WF.line}`, padding: 24, background: WF.fillSoft, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <SectionH>Upcoming trip</SectionH>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${WF.line}`, background: WF.bg }}>
            <WFImage src={PHOTOS.bali} ratio="2/1" />
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Bali, Indonesia</div>
              <div style={{ fontSize: 12, color: WF.muted, marginTop: 4 }}>Jul 4 — Jul 16 · 12 nights</div>
              <WFRule my={10} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[['Style', 'Budget'], ['₹/day', '1.8k–4.2k'], ['Pace', 'Relaxed'], ['Stay', 'Hostels']].map(([k,v]) => (
                  <div key={k}>
                    <div style={{ fontSize: 10, color: WF.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionH>Why you match</SectionH>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              {['Same dates: Jul 4–16', 'Both budget travelers', '4 of 6 interests overlap', 'Daily budget ranges overlap', 'Both prefer Ubud first'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: WF.ink, color: '#fff', fontSize: 9, fontWeight: 800, display: 'grid', placeItems: 'center' }}>✓</span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            <WFButton variant="outline" size="lg">Skip</WFButton>
            <div style={{ flex: 1 }}><WFButton variant="filled" size="lg" block icon={Icon.heart(15)}>Match with Priya</WFButton></div>
          </div>
        </div>
      </div>
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// PROFILE B — Trip-led detail (focus on her itinerary + how to merge)
// ─────────────────────────────────────────────────────────────────────
function WProfileB() {
  return (
    <WebShell active="discover">
      <div style={{ height: '100%', overflow: 'auto', padding: '24px 40px 60px' }}>
        <div style={{ fontSize: 11, color: WF.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          {Icon.back(12)} Back to map
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 32 }}>
          {/* Left: identity */}
          <div>
            <div style={{ width: 200, height: 200, borderRadius: '50%', overflow: 'hidden', margin: '0 0 16px' }}>
              <WFImage src={PHOTOS.priya} ratio="1" radius={999} />
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Priya, 27</h1>
            <div style={{ fontSize: 12.5, color: WF.muted, marginTop: 4 }}>Mumbai · EN · HI · GU</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '4px 10px', background: WF.fill, borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
              {Icon.shield(11)} Verified ID · Trust 4.8 ★
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.55, marginTop: 16, color: WF.ink }}>
              "Slow mornings, clean hostels, late food walks. Show up on time and we'll get along."
            </p>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <WFButton variant="filled" size="lg" block>Ask to join her trip</WFButton>
              <WFButton variant="outline" size="md" block>Send a message</WFButton>
            </div>
          </div>

          {/* Right: itinerary + compatibility */}
          <div>
            {/* Compatibility */}
            <div style={{ padding: 20, border: `1px solid ${WF.line}`, borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Why you'd travel well together · 94%</div>
                <div style={{ fontSize: 11, color: WF.muted }}>Interest-first matching</div>
              </div>
              <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['Interests', 4, 6, 'Food walks · Hostels · Photography · Slow travel'],
                  ['Travel style', 1, 1, 'Both budget travelers'],
                  ['Dates', 1, 1, 'Both Jul 4–16 (12 nights overlap)'],
                  ['Daily budget', 1, 1, '₹1.8–4.2k overlap with yours'],
                  ['Pace', 1, 1, 'Both relaxed planners'],
                  ['Stay type', 1, 1, 'Both prefer hostels / homestays'],
                ].map(([k, on, total, note]) => (
                  <div key={k} style={{ padding: 12, background: WF.fillSoft, borderRadius: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{k}</span>
                      <span style={{ fontSize: 11, color: WF.muted }}>{on}/{total}</span>
                    </div>
                    <div style={{ height: 4, marginTop: 6, borderRadius: 999, background: WF.fill, overflow: 'hidden' }}>
                      <div style={{ width: `${on/total*100}%`, height: '100%', background: WF.ink }} />
                    </div>
                    <div style={{ fontSize: 11, color: WF.muted, marginTop: 6 }}>{note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div style={{ marginTop: 18, padding: 20, border: `1px solid ${WF.line}`, borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Her Bali plan</div>
                <div style={{ fontSize: 11, color: WF.muted }}>JUL 4 — JUL 16 · 12 NIGHTS</div>
              </div>

              {/* Timeline */}
              <div style={{ marginTop: 16, position: 'relative' }}>
                <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 2, background: WF.line }} />
                {[
                  ['Jul 4–7', 'Ubud', 'Yoga · rice terraces · Tegallalang', PHOTOS.bali, true],
                  ['Jul 8–11', 'Canggu', 'Surf lessons · cafés · sunset at Echo Beach', PHOTOS.goa, true],
                  ['Jul 12–16', 'Nusa Lembongan', 'Diving · island days', PHOTOS.bali, false],
                ].map(([d, place, what, img, overlap], i) => (
                  <div key={d} style={{ display: 'flex', gap: 16, paddingLeft: 26, paddingBottom: 16, position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 4, top: 4, width: 10, height: 10, borderRadius: 5, background: overlap ? WF.ink : WF.fill, border: `2px solid ${WF.ink}` }} />
                    <div style={{ width: 70, height: 70, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                      <WFImage src={img} ratio="1" radius={8} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{place}{overlap && <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 7px', background: '#dceeff', color: '#0a3d91', borderRadius: 3, fontWeight: 700 }}>YOU OVERLAP</span>}</div>
                      <div style={{ fontSize: 12.5, color: WF.muted, marginTop: 2 }}>{what}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 6, padding: 12, borderRadius: 8, background: WF.fillSoft, fontSize: 12, color: WF.muted }}>
                Your trips overlap on <b style={{ color: WF.ink }}>8 of her 12 nights</b>. You can join her in Ubud + Canggu without changing her plan.
              </div>
            </div>
          </div>
        </div>
      </div>
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// MATCHES A — Standard inbox (3-col: list / preview)
// ─────────────────────────────────────────────────────────────────────
function WMatchesA() {
  return (
    <WebShell active="matches">
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100%' }}>
        <div style={{ borderRight: `1px solid ${WF.line}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: `1px solid ${WF.line}` }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Matches</div>
            <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>12 active · 3 new</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 4, fontSize: 11, fontWeight: 600 }}>
              <span style={{ padding: '4px 9px', borderRadius: 5, background: WF.fill }}>All</span>
              <span style={{ padding: '4px 9px', borderRadius: 5, color: WF.muted }}>Unread · 3</span>
              <span style={{ padding: '4px 9px', borderRadius: 5, color: WF.muted }}>New</span>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {[
              { name: 'Priya Shah', msg: 'Tegallalang walk on day 2?', time: '2m', unread: 2, src: PHOTOS.priya, hl: true },
              { name: 'Rahul Mehta', msg: 'Sent the homestay link', time: '1h', unread: 0, src: PHOTOS.rahul },
              { name: 'Ananya Rao', msg: 'You: same dates! Sync on bus?', time: '4h', unread: 0, src: PHOTOS.ananya },
              { name: 'Meera Iyer', msg: 'Photo · Sukawati market', time: 'yest', unread: 1, src: PHOTOS.meera },
              { name: 'Arjun Nair', msg: 'Catching surf at 6am', time: '2d', unread: 0, src: PHOTOS.arjun },
              { name: 'Vikram Singh', msg: 'Compare itineraries tomorrow?', time: '3d', unread: 0, src: PHOTOS.vikram },
            ].map((m, i) => (
              <div key={i} style={{
                display: 'flex', gap: 10, padding: '12px 14px', alignItems: 'center',
                borderBottom: `1px solid ${WF.fill}`,
                background: m.hl ? WF.fillSoft : 'transparent',
                borderLeft: m.hl ? `3px solid ${WF.ink}` : '3px solid transparent',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <WFImage src={m.src} ratio="1" radius={999} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{m.name}</span>
                    <span style={{ fontSize: 10, color: WF.muted }}>{m.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: m.unread ? WF.ink : WF.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: m.unread ? 600 : 400 }}>{m.msg}</div>
                </div>
                {m.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: 9, background: WF.accent, color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{m.unread}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Right pane — preview / detail */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${WF.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', overflow: 'hidden' }}>
              <WFImage src={PHOTOS.priya} ratio="1" radius={999} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Priya Shah</div>
              <div style={{ fontSize: 11, color: WF.muted }}>Bali · Jul 4–16 · 94% match</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <WFButton variant="outline" size="sm">View profile</WFButton>
              <WFButton variant="outline" size="sm">Trip plan</WFButton>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Bubble who="them">Hey! Saw we have the same Bali dates 🎉</Bubble>
            <Bubble who="them">What part are you starting in?</Bubble>
            <Bubble who="me">Hi! Yes, was excited. Starting with Ubud — 4 nights.</Bubble>
            <Bubble who="them">Same!! Tegallalang walk together day 2?</Bubble>
            <Bubble who="me">Yes. Should we share the Ubud stay?</Bubble>
          </div>
          <div style={{ padding: 14, borderTop: `1px solid ${WF.line}`, display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, height: 38, padding: '0 14px', borderRadius: 19, border: `1px solid ${WF.line}`, fontSize: 12.5, color: WF.muted, display: 'flex', alignItems: 'center' }}>Message Priya…</div>
            <WFButton variant="filled" size="md" icon={Icon.send(13)}>Send</WFButton>
          </div>
        </div>
      </div>
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// MATCHES B — Trip-clustered (group-by-trip view)
// ─────────────────────────────────────────────────────────────────────
function WMatchesB() {
  return (
    <WebShell active="matches">
      <div style={{ height: '100%', overflow: 'auto', padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Your trips & buddies</h1>
            <div style={{ fontSize: 12.5, color: WF.muted, marginTop: 4 }}>2 active trips · 12 buddies total · 3 pending requests</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <WFButton variant="outline" size="md">Past trips</WFButton>
            <WFButton variant="filled" size="md" icon={Icon.plus(13)}>New trip</WFButton>
          </div>
        </div>

        {/* Trip 1 */}
        <TripBlock
          img={PHOTOS.bali}
          title="Bali, Indonesia"
          dates="Jul 4 — Jul 16"
          stats="5 buddies · 2 unread · 1 pending"
          buddies={[
            { name: 'Priya', src: PHOTOS.priya, status: 'matched', last: 'Tegallalang day 2?', time: '2m', unread: 2 },
            { name: 'Rahul', src: PHOTOS.rahul, status: 'matched', last: 'Sent homestay link', time: '1h', unread: 0 },
            { name: 'Ananya', src: PHOTOS.ananya, status: 'pending', last: 'Wants to join', time: '5h', unread: 0 },
            { name: 'Meera', src: PHOTOS.meera, status: 'matched', last: 'Yoga class on Jul 7', time: '1d', unread: 0 },
            { name: 'Arjun', src: PHOTOS.arjun, status: 'matched', last: 'Surf 6am 🏄', time: '2d', unread: 0 },
          ]}
        />

        <div style={{ height: 18 }} />

        {/* Trip 2 */}
        <TripBlock
          img={PHOTOS.vietnam}
          title="Vietnam"
          dates="Aug 2 — Aug 14"
          stats="7 buddies · 1 unread · 2 pending"
          buddies={[
            { name: 'Vikram', src: PHOTOS.vikram, status: 'matched', last: 'Trains booked!', time: '3d', unread: 0 },
            { name: 'Meera', src: PHOTOS.meera, status: 'matched', last: 'Photo · Hanoi old quarter', time: '1d', unread: 1 },
          ]}
        />
      </div>
    </WebShell>
  );
}

function TripBlock({ img, title, dates, stats, buddies }) {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${WF.line}`, background: WF.bg }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr' }}>
        <div style={{ position: 'relative', minHeight: 160 }}>
          <WFImage src={img} ratio="auto" style={{ aspectRatio: 'unset', height: '100%', position: 'absolute', inset: 0 }} />
          <div style={{ position: 'absolute', inset: 0, padding: 16, background: 'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.7))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff' }}>
            <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{dates}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{title}</div>
            <div style={{ fontSize: 11, marginTop: 4, opacity: 0.85 }}>{stats}</div>
          </div>
        </div>

        <div style={{ padding: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {buddies.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderTop: i === 0 ? 'none' : `1px solid ${WF.fill}` }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <WFImage src={b.src} ratio="1" radius={999} />
                </div>
                <div style={{ minWidth: 90 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{b.name}</div>
                  {b.status === 'pending' && <span style={{ fontSize: 9, padding: '1px 5px', background: '#fff4b8', color: '#7a5a10', borderRadius: 3, fontWeight: 700 }}>PENDING</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 12, color: b.unread ? WF.ink : WF.muted, fontWeight: b.unread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.last}</div>
                <div style={{ fontSize: 10.5, color: WF.muted, width: 40, textAlign: 'right' }}>{b.time}</div>
                {b.unread > 0
                  ? <div style={{ width: 18, height: 18, borderRadius: 9, background: WF.accent, color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{b.unread}</div>
                  : <div style={{ width: 18 }} />
                }
              </div>
            ))}
          </div>
          <div style={{ marginTop: 'auto', padding: '8px 4px 0', display: 'flex', gap: 6, borderTop: `1px solid ${WF.fill}` }}>
            <WFButton variant="outline" size="sm">Open trip plan</WFButton>
            <WFButton variant="ghost" size="sm">Group chat</WFButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CHAT A — Standard 3-pane (list | thread | profile sidebar)
// ─────────────────────────────────────────────────────────────────────
function WChatA() {
  return (
    <WebShell active="chat">
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', height: '100%' }}>
        <div style={{ borderRight: `1px solid ${WF.line}`, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 14, borderBottom: `1px solid ${WF.line}`, fontSize: 14, fontWeight: 700 }}>Conversations</div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {[
              { name: 'Priya Shah', msg: 'Tegallalang walk on day 2?', time: '2m', unread: 2, src: PHOTOS.priya, hl: true },
              { name: 'Rahul Mehta', msg: 'Sent homestay link', time: '1h', unread: 0, src: PHOTOS.rahul },
              { name: 'Ananya Rao', msg: 'Same dates! Bus?', time: '4h', unread: 0, src: PHOTOS.ananya },
              { name: 'Meera Iyer', msg: 'Photo', time: 'yest', unread: 1, src: PHOTOS.meera },
              { name: 'Vikram Singh', msg: 'Compare tomorrow?', time: '3d', unread: 0, src: PHOTOS.vikram },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', alignItems: 'center', background: m.hl ? WF.fillSoft : 'transparent', borderLeft: m.hl ? `3px solid ${WF.ink}` : '3px solid transparent' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <WFImage src={m.src} ratio="1" radius={999} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{m.name}</div>
                  <div style={{ fontSize: 10.5, color: m.unread ? WF.ink : WF.muted, fontWeight: m.unread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.msg}</div>
                </div>
                {m.unread > 0 && <div style={{ width: 16, height: 16, borderRadius: 8, background: WF.accent, color: '#fff', fontSize: 9, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{m.unread}</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '10px 18px', borderBottom: `1px solid ${WF.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden' }}>
              <WFImage src={PHOTOS.priya} ratio="1" radius={999} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>Priya Shah {Icon.shield(11)}</div>
              <div style={{ fontSize: 10.5, color: WF.muted }}>Online · Bali · Jul 4–16</div>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <DateChip>You matched 2 days ago — both going to Bali</DateChip>
            <Bubble who="them">Hey! Saw we have the same Bali dates 🎉</Bubble>
            <Bubble who="them">What part are you starting in?</Bubble>
            <Bubble who="me">Hii! Starting with Ubud — 4 nights. Then Canggu for surf.</Bubble>
            <Bubble who="them">Same!! Want to do the Tegallalang walk together day 2?</Bubble>
            <Bubble who="me">Yes definitely. Should we share Ubud stay?</Bubble>
            <Bubble who="them">Open to it. Sending a hostel option →</Bubble>
            <div style={{ alignSelf: 'flex-start', maxWidth: 320, border: `1px solid ${WF.line}`, borderRadius: 14, overflow: 'hidden', background: WF.bg }}>
              <WFImage src={PHOTOS.bali} ratio="2/1" />
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 10, color: WF.muted, fontWeight: 700, textTransform: 'uppercase' }}>Hostel · Ubud</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>The Onion Collective</div>
                <div style={{ fontSize: 11.5, color: WF.muted, marginTop: 2 }}>4.7 ★ · ₹1,200 / night · twin room</div>
              </div>
            </div>
          </div>
          <div style={{ padding: 14, borderTop: `1px solid ${WF.line}`, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${WF.line}`, display: 'grid', placeItems: 'center' }}>{Icon.plus(15)}</div>
            <div style={{ flex: 1, height: 38, padding: '0 14px', borderRadius: 19, border: `1px solid ${WF.line}`, fontSize: 12.5, color: WF.muted, display: 'flex', alignItems: 'center' }}>Message Priya…</div>
            <WFButton variant="filled" size="md" icon={Icon.send(13)}>Send</WFButton>
          </div>
        </div>

        <div style={{ borderLeft: `1px solid ${WF.line}`, padding: 16, background: WF.fillSoft, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', margin: '0 auto' }}>
            <WFImage src={PHOTOS.priya} ratio="1" radius={999} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Priya Shah, 27</div>
            <div style={{ fontSize: 11, color: WF.muted }}>Mumbai · 94% match</div>
          </div>
          <div>
            <SectionH>Shared interests</SectionH>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {['Food walks', 'Hostels', 'Photography', 'Slow travel'].map((t) => <WFChip key={t} small filled>● {t}</WFChip>)}
            </div>
          </div>
          <div>
            <SectionH>Trip in common</SectionH>
            <div style={{ marginTop: 8, padding: 10, borderRadius: 8, border: `1px solid ${WF.line}`, background: WF.bg }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>Bali</div>
              <div style={{ fontSize: 10.5, color: WF.muted }}>Jul 4 — 16 · 12 nights</div>
            </div>
          </div>
          <WFButton variant="outline" size="sm" block>View full profile</WFButton>
          <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, border: `1px dashed ${WF.line}`, fontSize: 10.5, color: WF.muted, lineHeight: 1.45 }}>
            Safety: report or unmatch from the ··· menu. Share live location only inside trip plans.
          </div>
        </div>
      </div>
    </WebShell>
  );
}

// ─────────────────────────────────────────────────────────────────────
// CHAT B — Plan-focused chat (split view: chat + collaborative plan)
// ─────────────────────────────────────────────────────────────────────
function WChatB() {
  return (
    <WebShell active="chat">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', height: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 18px', borderBottom: `1px solid ${WF.line}`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden' }}>
              <WFImage src={PHOTOS.priya} ratio="1" radius={999} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>Priya · Bali Trip</div>
              <div style={{ fontSize: 10.5, color: WF.muted }}>2 buddies · Jul 4–16</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, fontSize: 11, fontWeight: 600 }}>
              <span style={{ padding: '5px 10px', borderRadius: 5, background: WF.fill }}>Chat</span>
              <span style={{ padding: '5px 10px', borderRadius: 5, color: WF.muted }}>Costs</span>
              <span style={{ padding: '5px 10px', borderRadius: 5, color: WF.muted }}>Files</span>
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Bubble who="them">Hey! Same Bali dates 🎉</Bubble>
            <Bubble who="me">Yes! Starting in Ubud.</Bubble>
            <DateChip>✦ Priya added "Tegallalang rice walk" to plan</DateChip>
            <Bubble who="them">Should we book the homestay together?</Bubble>
            <Bubble who="me">Lets! Sending an option →</Bubble>
            <div style={{ alignSelf: 'flex-end', maxWidth: 320, border: `1px solid ${WF.line}`, borderRadius: 14, overflow: 'hidden', background: WF.bg }}>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: WF.muted, fontWeight: 700, textTransform: 'uppercase' }}>Cost split · 2 ppl</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>Onion Collective · 4 nights</div>
                <div style={{ fontSize: 11.5, marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: WF.muted }}>Total</span>
                  <span style={{ fontWeight: 700 }}>₹4,800</span>
                </div>
                <div style={{ fontSize: 11.5, display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ color: WF.muted }}>Your share</span>
                  <span style={{ fontWeight: 700 }}>₹2,400</span>
                </div>
                <WFRule my={8} />
                <WFButton variant="filled" size="sm" block>Confirm split</WFButton>
              </div>
            </div>
            <DateChip>✦ Ananya requested to join this trip</DateChip>
          </div>
          <div style={{ padding: 14, borderTop: `1px solid ${WF.line}` }}>
            <div style={{ display: 'flex', gap: 6, paddingBottom: 10 }}>
              {['+ Plan', '₹ Cost split', '📍 Pin location', '📷 Photo'].map((t) => (
                <span key={t} style={{ padding: '5px 10px', borderRadius: 999, border: `1px solid ${WF.line}`, fontSize: 11, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: 1, height: 38, padding: '0 14px', borderRadius: 19, border: `1px solid ${WF.line}`, fontSize: 12.5, color: WF.muted, display: 'flex', alignItems: 'center' }}>Message or @add to plan…</div>
              <WFButton variant="filled" size="md" icon={Icon.send(13)}>Send</WFButton>
            </div>
          </div>
        </div>

        {/* Right: collaborative plan */}
        <div style={{ borderLeft: `1px solid ${WF.line}`, background: WF.fillSoft, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 16, borderBottom: `1px solid ${WF.line}` }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Trip plan · Bali</div>
            <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>Jul 4–16 · 4 plans · ₹4,800 in costs</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 4 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${WF.bg}` }}><WFImage src={PHOTOS.priya} ratio="1" radius={999} /></div>
              <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${WF.bg}`, marginLeft: -8 }}><WFImage src={PHOTOS.arjun} ratio="1" radius={999} /></div>
              <span style={{ fontSize: 11, color: WF.muted, alignSelf: 'center', marginLeft: 6 }}>You & Priya</span>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { type: 'event', d: 'Jul 5', title: 'Tegallalang rice walk', who: 'Priya · You', cost: null, status: 'in' },
              { type: 'stay', d: 'Jul 4–7', title: 'Onion Collective · Ubud', who: 'Priya · You', cost: '₹4,800', status: 'split-pending' },
              { type: 'event', d: 'Jul 9', title: 'Surf class @ Echo Beach', who: 'Priya', cost: '₹1,500', status: 'open' },
              { type: 'transport', d: 'Jul 8', title: 'Ubud → Canggu (van)', who: 'Priya', cost: null, status: 'open' },
            ].map((p, i) => (
              <div key={i} style={{ background: WF.bg, borderRadius: 10, padding: 12, border: `1px solid ${WF.line}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{p.type} · {p.d}</span>
                  {p.status === 'in' && <span style={{ fontSize: 9, padding: '2px 6px', background: WF.ink, color: '#fff', borderRadius: 3, fontWeight: 700 }}>YOU'RE IN</span>}
                  {p.status === 'split-pending' && <span style={{ fontSize: 9, padding: '2px 6px', background: '#fff4b8', color: '#7a5a10', borderRadius: 3, fontWeight: 700 }}>SPLIT PENDING</span>}
                  {p.status === 'open' && <span style={{ fontSize: 9, padding: '2px 6px', background: WF.fill, color: WF.muted, borderRadius: 3, fontWeight: 700 }}>OPEN</span>}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 4 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: WF.muted, marginTop: 2 }}>{p.who}{p.cost ? ` · ${p.cost}` : ''}</div>
                {p.status === 'open' && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                    <span style={{ padding: '4px 10px', borderRadius: 999, background: WF.ink, color: '#fff', fontSize: 10.5, fontWeight: 700 }}>I'm in</span>
                    <span style={{ padding: '4px 10px', borderRadius: 999, border: `1px solid ${WF.line}`, fontSize: 10.5, fontWeight: 600 }}>Skip</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ padding: 12, borderTop: `1px solid ${WF.line}` }}>
            <WFButton variant="outline" size="md" block icon={Icon.plus(13)}>Add to plan</WFButton>
          </div>
        </div>
      </div>
    </WebShell>
  );
}

Object.assign(window, {
  WOnboardingA, WOnboardingB,
  WDiscoverA, WDiscoverB,
  WProfileA, WProfileB,
  WMatchesA, WMatchesB,
  WChatA, WChatB,
  W_W, W_H,
});
