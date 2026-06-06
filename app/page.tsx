'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'

/* ═══════════════════════════════════════════════════════════════════════════
   INTERACTIVE COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */

// Animated counter that counts up when `active` is true
function AnimatedNumber({ target, suffix = '', prefix = '', decimals = 0, active = true }: {
  target: number; suffix?: string; prefix?: string; decimals?: number; active?: boolean
}) {
  const [val, setVal] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (!active || started.current) return
    started.current = true
    const duration = 1200
    const steps = 40
    const inc = target / steps
    let current = 0
    let step = 0
    const timer = setInterval(() => {
      step++
      current = Math.min(target, inc * step)
      setVal(current)
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [active, target])

  return <span>{prefix}{val.toFixed(decimals)}{suffix}</span>
}

// Animated bar that grows on mount
function AnimatedBar({ width, color, delay = 0, active = true }: {
  width: string; color: string; delay?: number; active?: boolean
}) {
  return (
    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
      {active && (
        <div
          className="h-full rounded-full transition-all ease-out"
          style={{
            width,
            backgroundColor: color,
            transitionDuration: '1s',
            transitionDelay: `${delay}ms`,
          }}
        />
      )}
    </div>
  )
}

// Interactive card that flips/expands on click
function FlipCard({ front, back, className = '' }: {
  front: React.ReactNode; back: React.ReactNode; className?: string
}) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div
      className={`relative cursor-pointer ${className}`}
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>{front}</div>
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{back}</div>
      </div>
    </div>
  )
}

// Hover tooltip
function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap tooltip-arrow z-50 animate-entrance">
          {text}
        </div>
      )}
    </div>
  )
}

// Staggered entrance wrapper
function Stagger({ children, delay = 0, active = true }: {
  children: React.ReactNode; delay?: number; active?: boolean
}) {
  return (
    <div
      className={active ? 'animate-entrance' : 'opacity-0'}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// Interactive donut chart (SVG)
function DonutChart({ segments, active = true }: {
  segments: { label: string; value: number; color: string }[]
  active?: boolean
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const r = 54
  const circumference = 2 * Math.PI * r
  let accumulated = 0

  return (
    <svg viewBox="0 0 140 140" className="w-full max-w-[200px]">
      {segments.map((seg, i) => {
        const pct = seg.value / total
        const dashLen = circumference * pct
        const offset = circumference * accumulated
        accumulated += pct
        return (
          <circle
            key={i}
            cx="70" cy="70" r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="20"
            strokeDasharray={`${active ? dashLen : 0} ${circumference - dashLen}`}
            strokeDashoffset={-offset}
            className="transition-all duration-1000 ease-out"
            style={{ transitionDelay: `${i * 200}ms` }}
          />
        )
      })}
      <text x="70" y="66" textAnchor="middle" className="fill-slate-800 font-bold text-lg">{total}</text>
      <text x="70" y="82" textAnchor="middle" className="fill-slate-400 text-[10px]">users</text>
    </svg>
  )
}

// Interactive bar chart
function BarChart({ data, active = true, maxVal }: {
  data: { label: string; value: number; color: string }[]
  active?: boolean
  maxVal?: number
}) {
  const max = maxVal || Math.max(...data.map(d => d.value))
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <Tooltip text={`${d.label}: ${d.value.toLocaleString()}`}>
            <div
              className="w-full rounded-t-lg transition-all duration-700 ease-out cursor-pointer hover:opacity-80"
              style={{
                height: active ? `${(d.value / max) * 100}%` : '0%',
                backgroundColor: d.color,
                transitionDelay: `${i * 150}ms`,
              }}
            />
          </Tooltip>
          <span className="text-[10px] text-slate-500 text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// Interactive table with row hover details
function InteractiveTable({ headers, rows, onRowClick }: {
  headers: string[]
  rows: (string | React.ReactNode)[][]
  onRowClick?: (idx: number) => void
}) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-4 py-2.5 font-semibold text-slate-700 text-xs uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={`border-b border-slate-50 transition-all duration-200 cursor-pointer ${
                hoveredRow === ri ? 'bg-blue-50/50 scale-[1.005] shadow-sm' : ''
              }`}
              onMouseEnter={() => setHoveredRow(ri)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => onRowClick?.(ri)}
            >
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-2.5 text-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Interactive expandable insight card
function InsightCard({ num, title, desc, color, icon, delay, active }: {
  num: string; title: string; desc: string; color: string; icon: string; delay: number; active: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const borderColor = { green: 'border-green-200 hover:border-green-300', blue: 'border-blue-200 hover:border-blue-300', purple: 'border-purple-200 hover:border-purple-300', amber: 'border-amber-200 hover:border-amber-300' }[color]
  const bgHover = { green: 'hover:bg-green-50/50', blue: 'hover:bg-blue-50/50', purple: 'hover:bg-purple-50/50', amber: 'hover:bg-amber-50/50' }[color]

  return (
    <Stagger delay={delay} active={active}>
      <div
        className={`bg-white rounded-2xl p-5 shadow-sm border ${borderColor} ${bgHover} transition-all duration-300 cursor-pointer click-bounce ${
          expanded ? 'ring-2 ring-blue-200 shadow-md' : 'hover:shadow-md'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-slate-400">{num}</span>
              <h3 className="font-semibold text-slate-800">{title}</h3>
            </div>
            <p className="text-sm text-slate-600">{desc}</p>
            {expanded && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 animate-entrance">
                {num === '01' && 'This is a strong retention signal. Even though message volume dropped, users haven\'t abandoned the platform — suggesting OCA is embedded in their daily operations.'}
                {num === '02' && 'January peak is likely driven by post-New Year marketing campaigns and pre-Ramadan preparation. Q2 data will confirm whether this was a one-time spike or a seasonal pattern.'}
                {num === '03' && 'CV Jalan Mandiri (Travel) and PT Edu Mandiri (Education) held steady while all others declined. Understanding their use case could reveal best practices for other clients.'}
                {num === '04' && 'The 25–32% decline range is remarkably tight. If each user declined for different reasons, we\'d expect a much wider spread. This points to a shared external factor — likely seasonality.'}
              </div>
            )}
          </div>
          <span className={`text-xs transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </div>
    </Stagger>
  )
}

// Interactive recommendation row
function RecommendationRow({ segment, priority, action, users, color, delay, active }: {
  segment: string; priority: string; action: string; users: string; color: string; delay: number; active: boolean
}) {
  const [open, setOpen] = useState(false)
  const colorMap: Record<string, { bg: string; badge: string; border: string }> = {
    red:    { bg: 'bg-red-500', badge: 'bg-red-50 border-red-200', border: 'border-red-200 hover:border-red-300' },
    amber:  { bg: 'bg-amber-500', badge: 'bg-amber-50 border-amber-200', border: 'border-amber-200 hover:border-amber-300' },
    orange: { bg: 'bg-orange-500', badge: 'bg-orange-50 border-orange-200', border: 'border-orange-200 hover:border-orange-300' },
    green:  { bg: 'bg-green-500', badge: 'bg-green-50 border-green-200', border: 'border-green-200 hover:border-green-300' },
  }
  const c = colorMap[color] || colorMap.green

  return (
    <Stagger delay={delay} active={active}>
      <div
        className={`bg-white rounded-2xl p-5 shadow-sm border ${c.border} transition-all duration-300 cursor-pointer click-bounce ${
          open ? 'ring-2 ring-blue-200 shadow-md' : 'hover:shadow-md'
        }`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${c.bg}`}>
            {priority}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-800">{segment}</h3>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">{users}</span>
            </div>
            <p className="text-sm text-slate-600">{action}</p>
          </div>
          <span className={`text-xs transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
        {open && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-entrance">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`${c.badge} border rounded-xl p-3`}>
                <div className="font-semibold text-slate-700 mb-1">Timeline</div>
                <div className="text-slate-600">
                  {priority === 'Protect' && 'Within 24 hours'}
                  {priority === 'Stabilize' && 'Within 1 week'}
                  {priority === 'Recover' && 'Within 30 days'}
                  {priority === 'Watch' && 'Next quarterly review'}
                </div>
              </div>
              <div className={`${c.badge} border rounded-xl p-3`}>
                <div className="font-semibold text-slate-700 mb-1">Owner</div>
                <div className="text-slate-600">
                  {priority === 'Protect' && 'Senior AM + Management'}
                  {priority === 'Stabilize' && 'Account Manager'}
                  {priority === 'Recover' && 'Automated + AM review'}
                  {priority === 'Watch' && 'CSM / Product team'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Stagger>
  )
}

// Interactive T-V Matrix
function TVMatrix({ active }: { active: boolean }) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const matrix = [
    { t: 3, v: 3, label: 'Rising', color: 'bg-green-100 border-green-300 text-green-800', count: 0 },
    { t: 3, v: 2, label: 'Rising', color: 'bg-green-100 border-green-300 text-green-800', count: 0 },
    { t: 3, v: 1, label: 'Momentum', color: 'bg-emerald-100 border-emerald-300 text-emerald-800', count: 0 },
    { t: 2, v: 3, label: 'Steady', color: 'bg-amber-100 border-amber-300 text-amber-800', count: 0 },
    { t: 2, v: 2, label: 'Steady', color: 'bg-amber-100 border-amber-300 text-amber-800', count: 0 },
    { t: 2, v: 1, label: 'Resilient', color: 'bg-teal-100 border-teal-300 text-teal-800', count: 2 },
    { t: 1, v: 3, label: 'Anchor at Risk', color: 'bg-red-100 border-red-300 text-red-800', count: 3 },
    { t: 1, v: 2, label: 'Significant at Risk', color: 'bg-orange-100 border-orange-300 text-orange-800', count: 5 },
    { t: 1, v: 1, label: 'Emerging at Risk', color: 'bg-amber-50 border-amber-200 text-amber-700', count: 10 },
  ]

  return (
    <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
      {matrix.map((cell) => {
        const key = `${cell.t}-${cell.v}`
        const isHovered = hoveredCell === key
        const hasUsers = cell.count > 0
        return (
          <div
            key={key}
            className={`rounded-xl border-2 p-3 text-center transition-all duration-300 cursor-pointer ${
              active ? cell.color : 'bg-slate-50 border-slate-200 text-slate-400'
            } ${isHovered ? 'scale-105 shadow-lg ring-2 ring-blue-300' : ''} ${hasUsers && active ? 'hover:shadow-md' : 'opacity-40'}`}
            onMouseEnter={() => setHoveredCell(key)}
            onMouseLeave={() => setHoveredCell(null)}
          >
            <div className="text-[10px] font-mono text-slate-400 mb-1">T={cell.t} V={cell.v}</div>
            <div className="text-xs font-semibold">{cell.label}</div>
            {hasUsers && active && (
              <div className="mt-1 text-lg font-bold">{cell.count}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Floating particles for intro
function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 6,
      opacity: 0.1 + Math.random() * 0.15,
      color: ['bg-blue-400', 'bg-cyan-400', 'bg-purple-400', 'bg-green-400'][i % 4],
    }))
  , [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.color} animate-float`}
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SLIDES DATA
   ═══════════════════════════════════════════════════════════════════════════ */

const SLIDES = [
  // ─── 1. INTRO ───────────────────────────────────────────────
  {
    id: 1, section: 'INTRO', title: 'Title',
    render: (active: boolean) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 relative">
        <Particles />
        <Stagger delay={0} active={active}>
          <p className="text-sm font-medium text-blue-600 tracking-widest uppercase mb-4">RevoU x Telkom Indonesia — Project 2</p>
        </Stagger>
        <Stagger delay={100} active={active}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 leading-tight">
            Active User Behavior<br />&amp; Segmentation
          </h1>
        </Stagger>
        <Stagger delay={200} active={active}>
          <p className="text-lg md:text-xl text-slate-500 mb-8 max-w-2xl">
            Rule-based T-V framework for churn detection and upsell strategy across 20 OCA clients
          </p>
        </Stagger>
        <Stagger delay={350} active={active}>
          <div className="flex gap-3 flex-wrap justify-center">
            {[
              { text: 'Q1 2025 Analysis', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
              { text: '20 Users', bg: 'bg-green-50 text-green-700 border-green-200' },
              { text: '4 Channels', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
              { text: '122K+ Transactions', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
            ].map((b) => (
              <span key={b.text} className={`px-4 py-2 rounded-full text-sm font-medium border ${b.bg} transition-all duration-300 hover:scale-105 hover:shadow-md cursor-default`}>
                {b.text}
              </span>
            ))}
          </div>
        </Stagger>
        <Stagger delay={500} active={active}>
          <div className="mt-10 animate-bounce text-slate-400 text-sm">↓ Click Next or press → to begin</div>
        </Stagger>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-blue-50',
  },

  // ─── 2. BUSINESS BACKGROUND ─────────────────────────────────
  {
    id: 2, section: 'CONTEXT', title: 'Business Background',
    render: (active: boolean) => (
      <div className="h-full flex flex-col justify-center px-6 md:px-16">
        <Stagger delay={0} active={active}>
          <p className="text-sm font-medium text-blue-600 tracking-widest uppercase mb-2">Business Background</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">What is OCA Blast?</h2>
        </Stagger>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: '📡', title: 'CPaaS Platform', desc: 'Communication Platform-as-a-Service owned by Telkom Indonesia, enabling businesses to send messages at scale.', delay: 100 },
            { icon: '🔗', title: 'Multi-Channel', desc: '4 messaging channels: WhatsApp, SMS, Email, and Voice Call (IVR).', delay: 200, extra: (
              <div className="flex gap-2 flex-wrap mt-3">
                {['WhatsApp', 'SMS', 'Email', 'Voice Call'].map((ch) => (
                  <Tooltip key={ch} text={`${ch} channel`}>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-all cursor-pointer">
                      {ch}
                    </span>
                  </Tooltip>
                ))}
              </div>
            )},
            { icon: '📊', title: 'Platform Scale', desc: '20 business clients across 9 industries.', delay: 300, extra: (
              <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                <Tooltip text="Active business accounts">
                  <div className="cursor-pointer"><div className="text-2xl font-bold text-blue-600"><AnimatedNumber target={20} active={active} /></div><div className="text-xs text-slate-500">Users</div></div>
                </Tooltip>
                <Tooltip text="Q1 2025 transactions">
                  <div className="cursor-pointer"><div className="text-2xl font-bold text-green-600"><AnimatedNumber target={122} suffix="K+" active={active} /></div><div className="text-xs text-slate-500">Transactions</div></div>
                </Tooltip>
                <Tooltip text="Different business sectors">
                  <div className="cursor-pointer"><div className="text-2xl font-bold text-purple-600"><AnimatedNumber target={9} active={active} /></div><div className="text-xs text-slate-500">Industries</div></div>
                </Tooltip>
              </div>
            )},
            { icon: '📅', title: 'Data Period', desc: 'Q1 2025 (January — March). 3 months of multi-channel transaction data.', delay: 400 },
          ].map((card) => (
            <Stagger key={card.title} delay={card.delay} active={active}>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300 hover:-translate-y-0.5 h-full">
                <div className="text-2xl mb-2">{card.icon}</div>
                <h3 className="font-semibold text-lg text-slate-800 mb-1">{card.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{card.desc}</p>
                {card.extra}
              </div>
            </Stagger>
          ))}
        </div>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-blue-50',
  },

  // ─── 3. BUSINESS PROBLEM ────────────────────────────────────
  {
    id: 3, section: 'PROBLEM', title: 'Business Problem',
    render: (active: boolean) => (
      <div className="h-full flex flex-col justify-center px-6 md:px-16">
        <Stagger delay={0} active={active}>
          <p className="text-sm font-medium text-red-600 tracking-widest uppercase mb-2">Business Problem</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">Why This Analysis Matters</h2>
        </Stagger>
        <Stagger delay={100} active={active}>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100 mb-5 hover:shadow-md transition-shadow">
            <blockquote className="text-base text-slate-700 italic border-l-4 border-red-400 pl-4">
              &ldquo;Segment OCA&apos;s 20 users by behavior patterns using T-V scoring to identify churn risk and upsell opportunities, enabling targeted account management actions.&rdquo;
            </blockquote>
          </div>
        </Stagger>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '🚨', title: 'Revenue Concentration', desc: '3 users = 59.9% of platform revenue. All 3 declining.', color: 'red', delay: 200 },
            { icon: '📉', title: 'Universal Decline', desc: '18 of 20 users (90%) showed declining volume Jan→Mar 2025.', color: 'amber', delay: 300 },
            { icon: '🎯', title: 'No Action Framework', desc: 'Without segmentation, Account Managers cannot prioritize outreach.', color: 'blue', delay: 400 },
          ].map((item) => (
            <Stagger key={item.title} delay={item.delay} active={active}>
              <Tooltip text={`Click to learn more about ${item.title.toLowerCase()}`}>
                <div className={`bg-${item.color}-50 rounded-2xl p-5 border border-${item.color}-200 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full`}>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <h3 className={`font-semibold text-${item.color}-800 mb-1`}>{item.title}</h3>
                  <p className={`text-sm text-${item.color}-700`}>{item.desc}</p>
                </div>
              </Tooltip>
            </Stagger>
          ))}
        </div>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-red-50',
  },

  // ─── 4. ANALYSIS OBJECTIVES ─────────────────────────────────
  {
    id: 4, section: 'OBJECTIVES', title: 'Analysis Objectives',
    render: (active: boolean) => (
      <div className="h-full flex flex-col justify-center px-6 md:px-16">
        <Stagger delay={0} active={active}>
          <p className="text-sm font-medium text-indigo-600 tracking-widest uppercase mb-2">Analysis Objectives</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">What This Analysis Supports</h2>
        </Stagger>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: '🔍', title: 'Churn Detection', desc: 'Identify which users are declining and how much revenue is at stake', color: 'red', delay: 100 },
            { icon: '📈', title: 'Upsell Opportunities', desc: 'Find stable or growing users with headroom to expand usage', color: 'green', delay: 200 },
            { icon: '🛡️', title: 'Anchor Protection', desc: 'Protect high-volume users representing critical platform revenue', color: 'blue', delay: 300 },
            { icon: '🎯', title: 'Targeted Action', desc: 'Give Account Managers a clear prioritization framework for outreach', color: 'purple', delay: 400 },
          ].map((item) => (
            <Stagger key={item.title} delay={item.delay} active={active}>
              <div className={`bg-white rounded-2xl p-5 shadow-sm border border-${item.color}-100 hover:shadow-lg hover:border-${item.color}-200 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full`}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-lg text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </div>
            </Stagger>
          ))}
        </div>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-indigo-50',
  },

  // ─── 5. DATASET SCOPE ──────────────────────────────────────
  {
    id: 5, section: 'DATA', title: 'Dataset Scope',
    render: (active: boolean) => (
      <div className="h-full flex flex-col justify-center px-6 md:px-16">
        <Stagger delay={0} active={active}>
          <p className="text-sm font-medium text-purple-600 tracking-widest uppercase mb-2">Dataset Scope</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">Data Overview</h2>
        </Stagger>
        <div className="grid md:grid-cols-2 gap-5">
          <Stagger delay={100} active={active}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-slate-800 mb-4">Transaction Volume by Channel</h3>
              <BarChart
                active={active}
                data={[
                  { label: 'WhatsApp', value: 50000, color: '#22c55e' },
                  { label: 'Email', value: 40000, color: '#a855f7' },
                  { label: 'SMS', value: 20000, color: '#3b82f6' },
                  { label: 'Call', value: 12749, color: '#f97316' },
                ]}
              />
              <div className="mt-3 flex gap-3 flex-wrap">
                {[
                  { label: 'WhatsApp', color: 'bg-green-500' },
                  { label: 'Email', color: 'bg-purple-500' },
                  { label: 'SMS', color: 'bg-blue-500' },
                  { label: 'Call', color: 'bg-orange-500' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          </Stagger>
          <div className="space-y-4">
            <Stagger delay={200} active={active}>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-slate-800 mb-3">User Profile</h3>
                <div className="space-y-2.5">
                  {[
                    { label: 'Total Users', value: '20 companies', tip: 'All from Indonesia' },
                    { label: 'Industries', value: '9 sectors', tip: 'Education, Finance, Travel, etc.' },
                    { label: 'Active Days', value: '90 / 90', tip: 'Every user active every day' },
                    { label: 'Channel Mix', value: 'All multi-channel', tip: 'No mono-channel users' },
                  ].map((row) => (
                    <Tooltip key={row.label} text={row.tip}>
                      <div className="flex items-center justify-between cursor-help">
                        <span className="text-sm text-slate-600">{row.label}</span>
                        <span className="font-semibold text-slate-800 text-sm">{row.value}</span>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </Stagger>
            <Stagger delay={350} active={active}>
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 hover:shadow-md transition-shadow">
                <p className="text-sm text-amber-700"><strong>Key Finding:</strong> All 20 users are active every single day (90/90). Volume is declining but engagement is not.</p>
              </div>
            </Stagger>
          </div>
        </div>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-purple-50',
  },

  // ─── 6. METHODOLOGY — T-V FRAMEWORK ─────────────────────────
  {
    id: 6, section: 'METHODOLOGY', title: 'T-V Framework',
    render: (active: boolean) => (
      <div className="h-full flex flex-col justify-center px-6 md:px-16">
        <Stagger delay={0} active={active}>
          <p className="text-sm font-medium text-green-600 tracking-widest uppercase mb-2">Methodology</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">The T-V Scoring Framework</h2>
        </Stagger>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Stagger delay={100} active={active}>
            <FlipCard
              className="h-52"
              front={
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-green-200 text-center h-full flex flex-col justify-center hover:shadow-md transition-shadow">
                  <div className="text-5xl font-bold text-green-600 mb-2">T</div>
                  <h3 className="font-semibold text-slate-800 mb-1">Trend Score</h3>
                  <p className="text-sm text-slate-500">Is monthly usage growing, stable, or declining?</p>
                  <p className="text-xs text-slate-400 mt-2">Click to flip →</p>
                </div>
              }
              back={
                <div className="bg-green-50 rounded-2xl p-5 border border-green-200 h-full flex flex-col justify-center">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center font-bold text-xs">3</span><span className="text-green-700 font-semibold">Growing</span><span className="text-slate-500 text-xs">— consecutive increase</span></div>
                    <div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">2</span><span className="text-amber-700 font-semibold">Stable</span><span className="text-slate-500 text-xs">— within ±25%</span></div>
                    <div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold text-xs">1</span><span className="text-red-700 font-semibold">Declining</span><span className="text-slate-500 text-xs">— net drop &gt;25%</span></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">← Click to flip back</p>
                </div>
              }
            />
          </Stagger>
          <Stagger delay={200} active={active}>
            <FlipCard
              className="h-52"
              front={
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-200 text-center h-full flex flex-col justify-center hover:shadow-md transition-shadow">
                  <div className="text-5xl font-bold text-purple-600 mb-2">V</div>
                  <h3 className="font-semibold text-slate-800 mb-1">Volume Score</h3>
                  <p className="text-sm text-slate-500">How large is this user relative to others?</p>
                  <p className="text-xs text-slate-400 mt-2">Click to flip →</p>
                </div>
              }
              back={
                <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200 h-full flex flex-col justify-center">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center font-bold text-xs">3</span><span className="text-purple-700 font-semibold">High</span><span className="text-slate-500 text-xs">— &gt;20K msgs</span></div>
                    <div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs">2</span><span className="text-blue-700 font-semibold">Mid</span><span className="text-slate-500 text-xs">— 5K–20K msgs</span></div>
                    <div className="flex items-center gap-2"><span className="w-8 h-8 rounded-lg bg-slate-400 text-white flex items-center justify-center font-bold text-xs">1</span><span className="text-slate-700 font-semibold">Low</span><span className="text-slate-500 text-xs">— ≤5K msgs</span></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 text-center">← Click to flip back</p>
                </div>
              }
            />
          </Stagger>
        </div>
        <Stagger delay={350} active={active}>
          <div className="bg-slate-900 rounded-2xl p-5 text-green-400 font-mono text-xs leading-relaxed hover:bg-slate-800 transition-colors">
            <div className="text-slate-400 mb-2">// Interactive Decision Tree — hover cells below</div>
            <TVMatrix active={active} />
          </div>
        </Stagger>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-green-50',
  },

  // ─── 7. SEGMENTATION RESULTS ────────────────────────────────
  {
    id: 7, section: 'RESULTS', title: 'Segmentation Results',
    render: (active: boolean) => (
      <div className="h-full flex flex-col justify-center px-6 md:px-16">
        <Stagger delay={0} active={active}>
          <p className="text-sm font-medium text-blue-600 tracking-widest uppercase mb-2">Segmentation Results</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Q1 2025 Segment Distribution</h2>
        </Stagger>
        <Stagger delay={100} active={active}>
          <div className="flex justify-center mb-4">
            <DonutChart
              active={active}
              segments={[
                { label: 'Anchor at Risk', value: 3, color: '#ef4444' },
                { label: 'Significant at Risk', value: 5, color: '#f59e0b' },
                { label: 'Emerging at Risk', value: 10, color: '#f97316' },
                { label: 'Resilient', value: 2, color: '#14b8a6' },
              ]}
            />
          </div>
        </Stagger>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[
            { group: 'Declining (T=1)', count: 18, color: 'red', items: [
              { name: 'Anchor at Risk', detail: 'V=3 · 3 users · 59.9% revenue', bold: true, dim: false },
              { name: 'Significant at Risk', detail: 'V=2 · 5 users · 25.1% revenue', bold: false, dim: false },
              { name: 'Emerging at Risk', detail: 'V=1 · 10 users · 12.5% revenue', bold: false, dim: false },
            ], delay: 200 },
            { group: 'Stable (T=2)', count: 2, color: 'amber', items: [
              { name: 'Steady', detail: 'V≥2 · 0 users', bold: false, dim: false },
              { name: 'Resilient', detail: 'V=1 · 2 users · 2.5% revenue', bold: true, dim: false },
            ], delay: 300 },
            { group: 'Growing (T=3)', count: 0, color: 'green', items: [
              { name: 'Rising', detail: 'V≥2 · 0 users', bold: false, dim: true },
              { name: 'Momentum', detail: 'V=1 · 0 users', bold: false, dim: true },
            ], delay: 400 },
          ].map((col) => (
            <Stagger key={col.group} delay={col.delay} active={active}>
              <div className={`bg-${col.color}-50 rounded-2xl p-4 border border-${col.color}-200`}>
                <h3 className={`font-semibold text-${col.color}-800 text-sm mb-2`}>{col.group} — {col.count} users</h3>
                <div className="space-y-2">
                  {col.items.map((item) => (
                    <Tooltip key={item.name} text={item.detail}>
                      <div className={`bg-white rounded-xl p-3 border border-${col.color}-100 hover:shadow-sm transition-all cursor-pointer ${item.dim ? 'opacity-40' : ''}`}>
                        <div className={`font-semibold text-sm ${item.bold ? `text-${col.color}-700` : 'text-slate-700'}`}>{item.name}</div>
                        <div className="text-xs text-slate-500">{item.detail}</div>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </Stagger>
          ))}
        </div>
        <Stagger delay={500} active={active}>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-slate-700"><strong>Key Insight:</strong> 3 anchor users represent 59.9% of platform revenue. All declining. Revenue concentration is an independent business risk.</p>
            </div>
          </div>
        </Stagger>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-blue-50',
  },

  // ─── 8. ANCHOR USERS AT RISK ────────────────────────────────
  {
    id: 8, section: 'RESULTS', title: 'Anchor Users at Risk',
    render: (active: boolean) => (
      <div className="h-full flex flex-col justify-center px-6 md:px-16">
        <Stagger delay={0} active={active}>
          <p className="text-sm font-medium text-red-600 tracking-widest uppercase mb-2">Critical Finding</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Anchor Users at Risk</h2>
        </Stagger>
        <Stagger delay={100} active={active}>
          <InteractiveTable
            headers={['User', 'Industry', 'Avg Daily', 'Decline', 'Revenue', 'Seasonal']}
            rows={[
              ['CV Wisata Indo', 'Travel', <span key="1" className="font-mono">282.2</span>, <span key="2" className="font-mono text-red-600">-25.3%</span>, <span key="3" className="font-mono">20.1%</span>, <span key="4"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">Yes</span></span>],
              ['PT Dana Nusantara', 'Finance', <span key="1" className="font-mono">281.2</span>, <span key="2" className="font-mono text-red-600">-29.7%</span>, <span key="3" className="font-mono">20.0%</span>, <span key="4"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">No</span></span>],
              ['CV Land Sejahtera', 'Real Estate', <span key="1" className="font-mono">279.3</span>, <span key="2" className="font-mono text-red-600">-26.2%</span>, <span key="3" className="font-mono">19.8%</span>, <span key="4"><span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">No</span></span>],
            ]}
          />
        </Stagger>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          {[
            { title: 'Priority: Protect', desc: 'AM personal call within 24 hours. Escalate if no response in 48h.', color: 'red', delay: 250 },
            { title: 'Decline Pattern', desc: '25–30% decline across all 3. Uniform pattern suggests shared external cause.', color: 'amber', delay: 350 },
            { title: 'Revenue Impact', desc: 'Combined 59.9% of platform revenue. Single churn = visible quarterly impact.', color: 'blue', delay: 450 },
          ].map((item) => (
            <Stagger key={item.title} delay={item.delay} active={active}>
              <div className={`bg-${item.color}-50 rounded-2xl p-4 border border-${item.color}-200 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer`}>
                <h4 className={`font-semibold text-${item.color}-800 text-sm mb-1`}>{item.title}</h4>
                <p className={`text-xs text-${item.color}-600`}>{item.desc}</p>
              </div>
            </Stagger>
          ))}
        </div>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-red-50',
  },

  // ─── 9. KEY INSIGHTS ────────────────────────────────────────
  {
    id: 9, section: 'INSIGHTS', title: 'Key Insights',
    render: (active: boolean) => (
      <div className="h-full flex flex-col justify-center px-6 md:px-16">
        <Stagger delay={0} active={active}>
          <p className="text-sm font-medium text-green-600 tracking-widest uppercase mb-2">Insights</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">Key Findings <span className="text-base font-normal text-slate-400">(click to expand)</span></h2>
        </Stagger>
        <div className="grid md:grid-cols-2 gap-3">
          <InsightCard num="01" title="Platform Stickiness is Real" desc="All 20 users active every day for 90 consecutive days. Volume declining but engagement is not." color="green" icon="✅" delay={100} active={active} />
          <InsightCard num="02" title="January Was the Peak" desc="Every single user peaked in January. Post-New Year + pre-Ramadan seasonality likely driver." color="blue" icon="📊" delay={200} active={active} />
          <InsightCard num="03" title="Two Users Bucked the Trend" desc="CV Jalan Mandiri (Steady) and PT Edu Mandiri (Resilient) held volume while 18 others declined." color="purple" icon="🌟" delay={300} active={active} />
          <InsightCard num="04" title="Decline is Nearly Uniform" desc="15 of 18 declining users fell 25–32%. Uniform rates suggest shared external cause." color="amber" icon="🔍" delay={400} active={active} />
        </div>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-green-50',
  },

  // ─── 10. RECOMMENDATIONS ────────────────────────────────────
  {
    id: 10, section: 'RECOMMENDATIONS', title: 'Recommendations',
    render: (active: boolean) => (
      <div className="h-full flex flex-col justify-center px-6 md:px-16">
        <Stagger delay={0} active={active}>
          <p className="text-sm font-medium text-purple-600 tracking-widest uppercase mb-2">Recommendations</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5">Action Plan by Segment <span className="text-base font-normal text-slate-400">(click to expand)</span></h2>
        </Stagger>
        <div className="space-y-3">
          <RecommendationRow segment="Anchor at Risk" priority="Protect" action="AM personal call within 24h. Identify root cause. Offer contractual incentives." users="3 users (59.9% revenue)" color="red" delay={100} active={active} />
          <RecommendationRow segment="Significant at Risk" priority="Stabilize" action="AM review within 1 week. Check seasonality flag before escalating urgency." users="5 users (25.1% revenue)" color="amber" delay={200} active={active} />
          <RecommendationRow segment="Emerging at Risk" priority="Recover" action="Automated check-in. Offer onboarding resources. Investigate group patterns." users="10 users (12.5% revenue)" color="orange" delay={300} active={active} />
          <RecommendationRow segment="Resilient" priority="Watch" action="Low-touch maintenance. Share product updates. Offer product walkthrough." users="2 users (2.5% revenue)" color="green" delay={400} active={active} />
        </div>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-purple-50',
  },

  // ─── 11. DISCLAIMER ─────────────────────────────────────────
  {
    id: 11, section: 'DISCLAIMER', title: 'Disclaimer',
    render: (active: boolean) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 md:px-16">
        <Stagger delay={0} active={active}>
          <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200 max-w-2xl hover:shadow-lg transition-shadow duration-300">
            <div className="text-5xl mb-4 animate-bounce">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Important Disclaimer</h2>
            <p className="text-slate-700 leading-relaxed">
              The data provided is a representation of the original data which amount has been adjusted. The data used is <strong>NOT</strong> representation of original data, adjusted for educational purposes and does not reflect the actual business condition of the company.
            </p>
          </div>
        </Stagger>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-amber-50',
  },

  // ─── 12. CONTACT ────────────────────────────────────────────
  {
    id: 12, section: 'CONTACT', title: 'Contact',
    render: (active: boolean) => (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 md:px-16">
        <Stagger delay={0} active={active}>
          <p className="text-sm font-medium text-blue-600 tracking-widest uppercase mb-3">Get in Touch</p>
        </Stagger>
        <Stagger delay={100} active={active}>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">Thank You</h1>
        </Stagger>
        <Stagger delay={200} active={active}>
          <p className="text-lg text-slate-500 mb-8 max-w-lg">Let&apos;s connect and discuss how data-driven segmentation can drive better business outcomes.</p>
        </Stagger>
        <div className="grid md:grid-cols-3 gap-5 max-w-2xl w-full">
          {[
            { icon: '💬', title: 'WhatsApp', detail: '0851-6178-7119', href: 'https://wa.me/6285161787119', color: 'green', delay: 300 },
            { icon: '📧', title: 'Email', detail: 'Laurensiush.0711@gmail.com', href: 'mailto:Laurensiush.0711@gmail.com', color: 'blue', delay: 400 },
            { icon: '💼', title: 'LinkedIn', detail: 'Laurensius Haryo', href: 'https://www.linkedin.com/in/laurensius-haryo-radyobaskoro-p-373146177', color: 'blue', delay: 500 },
          ].map((card) => (
            <Stagger key={card.title} delay={card.delay} active={active}>
              <a href={card.href} target="_blank" rel="noopener noreferrer"
                className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-${card.color}-200 hover:-translate-y-1 transition-all duration-300 group block`}>
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                <h3 className={`font-semibold text-slate-800 text-sm mb-1 group-hover:text-${card.color}-600 transition-colors`}>{card.title}</h3>
                <p className="text-xs text-slate-500 break-all">{card.detail}</p>
              </a>
            </Stagger>
          ))}
        </div>
        <Stagger delay={650} active={active}>
          <div className="mt-8 text-xs text-slate-400">
            Telkom OCA · Project 2 · Active User Behavior &amp; Segmentation · Q1 2025
          </div>
        </Stagger>
      </div>
    ),
    bg: 'bg-gradient-to-br from-slate-50 via-white to-blue-50',
  },
]

const SECTIONS = ['ALL', 'INTRO', 'CONTEXT', 'PROBLEM', 'OBJECTIVES', 'DATA', 'METHODOLOGY', 'RESULTS', 'INSIGHTS', 'RECOMMENDATIONS', 'DISCLAIMER', 'CONTACT']

export default function SlidePresentation() {
  const [current, setCurrent] = useState(0)
  const [section, setSection] = useState('ALL')
  const [transitioning, setTransitioning] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const [slideActive, setSlideActive] = useState(true)

  const filtered = section === 'ALL' ? SLIDES : SLIDES.filter((s) => s.section === section)

  const go = useCallback((idx: number, dir: 'left' | 'right') => {
    if (transitioning || idx === current) return
    setDirection(dir)
    setSlideActive(false)
    setTransitioning(true)
    setTimeout(() => {
      setCurrent(idx)
      setTransitioning(false)
      // Small delay then activate entrance animations
      requestAnimationFrame(() => setSlideActive(true))
    }, 250)
  }, [current, transitioning])

  const next = useCallback(() => {
    if (current < filtered.length - 1) go(current + 1, 'right')
  }, [current, filtered.length, go])

  const prev = useCallback(() => {
    if (current > 0) go(current - 1, 'left')
  }, [current, go])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev() }
    setTouchStart(null)
  }

  const slide = filtered[current]

  return (
    <div
      className={`fixed inset-0 ${slide?.bg || 'bg-slate-50'} transition-colors duration-500`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Logo — top-left on every slide */}
      <div className="fixed top-4 left-5 z-50 hover:scale-105 transition-transform duration-300 cursor-pointer">
        <Image src="/logo.png" alt="RevoU x OCA x Telkom" width={120} height={40} className="h-10 w-auto" priority />
      </div>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200/60 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out"
          style={{ width: `${((current + 1) / filtered.length) * 100}%` }}
        />
      </div>

      {/* Section filter — top-right */}
      <div className="fixed top-3 right-5 z-50 flex gap-1 bg-white/80 backdrop-blur-md rounded-full px-2 py-1 shadow-lg border border-slate-200/50 max-w-[70vw] overflow-x-auto">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setSection(s); setCurrent(0); setSlideActive(false); requestAnimationFrame(() => setSlideActive(true)) }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
              section === s ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Slide content */}
      <div
        className={`h-full transition-all duration-300 ease-out ${
          transitioning
            ? direction === 'right' ? 'opacity-0 translate-x-12 scale-[0.98]' : 'opacity-0 -translate-x-12 scale-[0.98]'
            : 'opacity-100 translate-x-0 scale-100'
        }`}
        key={`${section}-${current}`}
      >
        <div className="h-full pt-16 pb-20 overflow-y-auto">
          {slide?.render(slideActive)}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-md border-t border-slate-200/50">
          <button
            onClick={prev}
            disabled={current === 0}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 hover:shadow-sm text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium active:scale-95"
          >
            ← Prev
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 font-medium tabular-nums">
              {current + 1} / {filtered.length}
            </span>
            <div className="flex gap-1.5">
              {filtered.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i, i > current ? 'right' : 'left')}
                  className={`rounded-full transition-all duration-300 hover:scale-125 ${
                    i === current ? 'bg-blue-500 w-6 h-2.5 shadow-md' : 'bg-slate-300 hover:bg-slate-400 w-2.5 h-2.5'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={next}
            disabled={current === filtered.length - 1}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 hover:shadow-lg text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium active:scale-95"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="fixed bottom-16 right-5 z-30 text-[11px] text-slate-400 space-y-0.5 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2">
        <div>← → Navigate</div>
        <div>Space to advance</div>
        <div>Swipe on mobile</div>
      </div>
    </div>
  )
}
