import type { CSSProperties, ReactNode } from 'react'

// ── Design tokens ────────────────────────────────────────────────────
export const T = {
  ink: 'var(--ink)',
  line: 'var(--line)',
  lineHard: 'var(--line-hard)',
  fill: 'var(--fill)',
  fillSoft: 'var(--fill-soft)',
  bg: 'var(--bg)',
  accent: 'var(--accent)',
  muted: 'var(--muted)',
}

// ── Button ───────────────────────────────────────────────────────────
type BtnVariant = 'filled' | 'outline' | 'ghost'
type BtnSize = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: ReactNode
  variant?: BtnVariant
  size?: BtnSize
  block?: boolean
  icon?: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  style?: CSSProperties
}

const BTN_VAR: Record<BtnVariant, CSSProperties> = {
  filled: { background: T.ink, color: '#fff', border: `1px solid ${T.ink}` },
  outline: { background: 'transparent', color: T.ink, border: `1px solid ${T.lineHard}` },
  ghost: { background: 'transparent', color: T.ink, border: '1px solid transparent' },
}

const BTN_SZ: Record<BtnSize, CSSProperties> = {
  sm: { height: 28, padding: '0 10px', fontSize: 11 },
  md: { height: 38, padding: '0 14px', fontSize: 12.5 },
  lg: { height: 48, padding: '0 20px', fontSize: 14 },
}

export function Button({ children, variant = 'outline', size = 'md', block, icon, onClick, type = 'button', disabled, style }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        borderRadius: 8, fontWeight: 600, fontFamily: 'inherit',
        width: block ? '100%' : 'auto', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...BTN_SZ[size], ...BTN_VAR[variant], ...style,
      }}
    >
      {icon}{children}
    </button>
  )
}

// ── Chip/Tag ─────────────────────────────────────────────────────────
interface ChipProps {
  children: ReactNode
  filled?: boolean
  small?: boolean
  active?: boolean
  onClick?: () => void
}

export function Chip({ children, filled, small, active, onClick }: ChipProps) {
  const bg = filled || active ? T.ink : 'transparent'
  const color = filled || active ? '#fff' : T.ink
  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: small ? '3px 7px' : '6px 12px',
        borderRadius: 999, border: `1px solid ${active || filled ? T.ink : T.line}`,
        background: bg, color, fontSize: small ? 10 : 12, fontWeight: 500,
        whiteSpace: 'nowrap', cursor: onClick ? 'pointer' : 'default',
      }}
    >{children}</span>
  )
}

// ── WFImage ──────────────────────────────────────────────────────────
interface WFImageProps {
  src: string
  alt?: string
  ratio?: string
  radius?: number
  style?: CSSProperties
}

export function WFImage({ src, alt = '', ratio = '1', radius = 0, style }: WFImageProps) {
  return (
    <div style={{
      position: 'relative', aspectRatio: ratio, width: '100%',
      background: T.fill, borderRadius: radius, overflow: 'hidden',
      ...style,
    }}>
      <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}

// ── Section heading ──────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 700, color: T.muted,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>{children}</div>
  )
}

// ── Horizontal rule ──────────────────────────────────────────────────
export function Rule({ my = 0, dashed }: { my?: number; dashed?: boolean }) {
  return (
    <div style={{
      height: 1, margin: `${my}px 0`,
      background: dashed ? 'transparent' : T.line,
      borderTop: dashed ? `1px dashed ${T.line}` : 'none',
    }} />
  )
}

// ── Match score badge ─────────────────────────────────────────────────
export function ScoreBadge({ score }: { score: number }) {
  return (
    <div style={{
      padding: '3px 8px', borderRadius: 999,
      background: 'rgba(0,0,0,0.7)', color: '#fff',
      fontSize: 10, fontWeight: 700, backdropFilter: 'blur(6px)',
    }}>{score}% match</div>
  )
}

// ── Chat bubble ──────────────────────────────────────────────────────
export function Bubble({ who, children }: { who: 'me' | 'them'; children: ReactNode }) {
  const me = who === 'me'
  return (
    <div style={{
      alignSelf: me ? 'flex-end' : 'flex-start', maxWidth: '78%',
      padding: '8px 12px',
      borderRadius: me ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      background: me ? T.ink : T.fill, color: me ? '#fff' : T.ink,
      fontSize: 12.5, lineHeight: 1.45,
    }}>{children}</div>
  )
}

// ── Date chip ────────────────────────────────────────────────────────
export function DateChip({ children }: { children: ReactNode }) {
  return (
    <div style={{ alignSelf: 'center', fontSize: 10, color: T.muted, padding: '6px 0', fontWeight: 600 }}>
      {children}
    </div>
  )
}

export const PHOTOS = {
  jaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=70',
  vietnam: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=70',
}
