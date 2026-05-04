// wf-primitives.jsx — Wireframe building blocks for Explore Fusion
// Lo-fi but expressive: solid grays, dashed boxes, real photos optional.
// Everything reads from CSS vars set by the host (--wf-ink, --wf-line, --wf-fill, --wf-accent, --wf-bg).

const WF = {
  ink: 'var(--wf-ink, #1a1a1a)',
  line: 'var(--wf-line, #c9c9c9)',
  lineHard: 'var(--wf-line-hard, #8a8a8a)',
  fill: 'var(--wf-fill, #ececec)',
  fillSoft: 'var(--wf-fill-soft, #f5f5f5)',
  bg: 'var(--wf-bg, #ffffff)',
  accent: 'var(--wf-accent, #1a1a1a)',
  muted: 'var(--wf-muted, #6b6b6b)',
};

// ── Annotation labels (corner ribbons on each artboard) ──────────────
function WFLabel({ text, tone = 'neutral' }) {
  const bg = tone === 'a' ? '#e7f0ff' : tone === 'b' ? '#fff0e7' : '#f0f0f0';
  const fg = tone === 'a' ? '#0a3d91' : tone === 'b' ? '#8a3a13' : '#2a2a2a';
  return (
    <span style={{
      display: 'inline-block', padding: '3px 8px', borderRadius: 4,
      background: bg, color: fg, fontSize: 10, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
    }}>{text}</span>
  );
}

// ── Sticky note for designer commentary ──────────────────────────────
function WFNote({ children, color = 'amber' }) {
  const bg = color === 'amber' ? '#fff4b8' : color === 'blue' ? '#dceeff' : '#e8f5d8';
  return (
    <div style={{
      background: bg, padding: '10px 12px', fontSize: 11.5, lineHeight: 1.45,
      color: '#2a2a2a', maxWidth: 220,
      boxShadow: '0 1px 0 rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06)',
      fontFamily: 'ui-sans-serif, system-ui',
    }}>{children}</div>
  );
}

// ── Image placeholder. If ENABLE_PHOTOS via context, shows real img. ─
const PhotosCtx = React.createContext(true);
function WFImage({ src, alt = '', ratio = '1', radius = 0, style = {}, label }) {
  const photosOn = React.useContext(PhotosCtx);
  return (
    <div style={{
      position: 'relative', aspectRatio: ratio, width: '100%',
      background: WF.fill, borderRadius: radius, overflow: 'hidden',
      border: photosOn ? 'none' : `1px dashed ${WF.lineHard}`,
      ...style,
    }}>
      {photosOn && src ? (
        <img src={src} alt={alt} style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          filter: 'grayscale(0.15) contrast(0.95)',
        }} />
      ) : (
        <>
          {/* X mark for empty placeholder */}
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
               style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
            <line x1="0" y1="0" x2="100" y2="100" stroke={WF.lineHard} strokeWidth="0.4" />
            <line x1="100" y1="0" x2="0" y2="100" stroke={WF.lineHard} strokeWidth="0.4" />
          </svg>
          {label && (
            <div style={{
              position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
              fontSize: 10, color: WF.muted, fontFamily: 'ui-monospace, monospace',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}>{label}</div>
          )}
        </>
      )}
    </div>
  );
}

// ── A horizontal divider that looks intentional ───────────────────────
function WFRule({ thick = false, dashed = false, my = 0 }) {
  return (
    <div style={{
      height: thick ? 2 : 1,
      background: dashed ? 'transparent' : WF.line,
      borderTop: dashed ? `1px dashed ${WF.line}` : 'none',
      margin: `${my}px 0`,
    }} />
  );
}

// ── A simple chip / tag ───────────────────────────────────────────────
function WFChip({ children, filled = false, small = false }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: small ? '3px 7px' : '5px 10px',
      borderRadius: 999,
      border: `1px solid ${WF.line}`,
      background: filled ? WF.fill : 'transparent',
      color: WF.ink,
      fontSize: small ? 10 : 11,
      fontWeight: 500,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// ── A button (filled / outline / ghost) ───────────────────────────────
function WFButton({ children, variant = 'outline', block = false, size = 'md', icon }) {
  const styles = {
    filled: { background: WF.ink, color: '#fff', border: `1px solid ${WF.ink}` },
    outline: { background: 'transparent', color: WF.ink, border: `1px solid ${WF.lineHard}` },
    ghost: { background: 'transparent', color: WF.ink, border: '1px solid transparent' },
    accent: { background: WF.accent, color: '#fff', border: `1px solid ${WF.accent}` },
  };
  const sz = size === 'sm'
    ? { height: 28, padding: '0 10px', fontSize: 11 }
    : size === 'lg'
    ? { height: 48, padding: '0 18px', fontSize: 14 }
    : { height: 38, padding: '0 14px', fontSize: 12.5 };
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      borderRadius: 8, fontWeight: 600, fontFamily: 'inherit',
      width: block ? '100%' : 'auto', cursor: 'pointer',
      ...sz, ...(styles[variant] || styles.outline),
    }}>
      {icon}
      {children}
    </button>
  );
}

// ── A skeleton text line ──────────────────────────────────────────────
function WFLine({ w = '100%', h = 8, mt = 0, color }) {
  return (
    <div style={{
      width: w, height: h, marginTop: mt,
      background: color || WF.fill, borderRadius: 2,
    }} />
  );
}

// ── A field row (label + box) ─────────────────────────────────────────
function WFField({ label, value, placeholder, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <div style={{ fontSize: 10.5, fontWeight: 700, color: WF.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>}
      <div style={{
        height: 36, padding: '0 10px', display: 'flex', alignItems: 'center',
        border: `1px solid ${WF.line}`, borderRadius: 6, fontSize: 12,
        color: value ? WF.ink : WF.muted, background: WF.bg,
      }}>{value || placeholder || ''}</div>
      {hint && <div style={{ fontSize: 10, color: WF.muted }}>{hint}</div>}
    </div>
  );
}

// ── Stock icon set (line, monochrome, small) ─────────────────────────
const Icon = {
  heart: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
  ),
  x: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  ),
  star: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  ),
  pin: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  ),
  cal: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  msg: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  user: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  search: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  filter: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
  ),
  shield: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
  ),
  send: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
  ),
  plus: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  back: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
  ),
  more: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
  ),
  globe: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
  sliders: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
  ),
};

// ── Travel photos pool (Unsplash) ────────────────────────────────────
const PHOTOS = {
  priya: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=70',
  rahul: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=600&q=70',
  ananya: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?w=600&q=70',
  arjun: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=600&q=70',
  meera: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=70',
  vikram: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=70',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=70',
  jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=70',
  vietnam: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=70',
  himachal: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=70',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=70',
  meghalaya: 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=800&q=70',
};

Object.assign(window, {
  WF, WFLabel, WFNote, WFImage, WFRule, WFChip, WFButton, WFLine, WFField,
  Icon, PHOTOS, PhotosCtx,
});
