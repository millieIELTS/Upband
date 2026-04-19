import { useRef, useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

// 흑백(그레이스케일) 팔레트 — IELTS 실제 시험지 스타일
const GRAY = ['#111827', '#6b7280', '#d1d5db', '#9ca3af', '#4b5563', '#e5e7eb']
// 라인 차트 구분용 스트로크 패턴
const DASH = ['0', '6 3', '2 2', '8 4 2 4']

function useContainerWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(500)
  useEffect(() => {
    if (!ref.current) return
    const obs = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, width]
}

// ───────────────────────────────────────────
// Q0: Bar chart #1 — University enrollment
// ───────────────────────────────────────────
function BarChartQ0() {
  const [ref, w] = useContainerWidth()
  // Dramatic swings: Business peaks mid-series then crashes, Engineering climbs steeply
  // after an initial dip, Art & Design drops sharply then rebounds and dips again.
  const data = [
    { year: '2015', Business: 450, Engineering: 380, 'Art & Design': 210 },
    { year: '2016', Business: 560, Engineering: 350, 'Art & Design': 140 },
    { year: '2017', Business: 620, Engineering: 320, 'Art & Design': 110 },
    { year: '2018', Business: 440, Engineering: 480, 'Art & Design': 260 },
    { year: '2019', Business: 330, Engineering: 560, 'Art & Design': 370 },
    { year: '2020', Business: 380, Engineering: 640, 'Art & Design': 290 },
  ]
  return (
    <div ref={ref}>
      <BarChart width={w} height={280} data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
        <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#111827' }} />
        <YAxis tick={{ fontSize: 12, fill: '#111827' }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Business" fill={GRAY[0]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
        <Bar dataKey="Engineering" fill={GRAY[1]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
        <Bar dataKey="Art & Design" fill={GRAY[2]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
      </BarChart>
    </div>
  )
}

// ───────────────────────────────────────────
// Q1: Line chart — Monthly average temperatures
// ───────────────────────────────────────────
function LineChartQ1() {
  const [ref, w] = useContainerWidth()
  const data = [
    { month: 'Jan', London: 5, Sydney: 26, Tokyo: 6 },
    { month: 'Feb', London: 5, Sydney: 26, Tokyo: 7 },
    { month: 'Mar', London: 8, Sydney: 24, Tokyo: 10 },
    { month: 'Apr', London: 11, Sydney: 21, Tokyo: 15 },
    { month: 'May', London: 15, Sydney: 17, Tokyo: 20 },
    { month: 'Jun', London: 18, Sydney: 14, Tokyo: 23 },
    { month: 'Jul', London: 20, Sydney: 13, Tokyo: 27 },
    { month: 'Aug', London: 20, Sydney: 14, Tokyo: 28 },
    { month: 'Sep', London: 17, Sydney: 17, Tokyo: 24 },
    { month: 'Oct', London: 13, Sydney: 20, Tokyo: 18 },
    { month: 'Nov', London: 8, Sydney: 22, Tokyo: 13 },
    { month: 'Dec', London: 5, Sydney: 25, Tokyo: 8 },
  ]
  return (
    <div ref={ref}>
      <LineChart width={w} height={280} data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#111827' }} />
        <YAxis tick={{ fontSize: 12, fill: '#111827' }} unit="°C" />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="London" stroke="#000" strokeWidth={2} strokeDasharray={DASH[0]} dot={{ r: 3, fill: '#000' }} isAnimationActive={false} />
        <Line type="monotone" dataKey="Sydney" stroke="#000" strokeWidth={2} strokeDasharray={DASH[1]} dot={{ r: 3, fill: '#000' }} isAnimationActive={false} />
        <Line type="monotone" dataKey="Tokyo" stroke="#000" strokeWidth={2} strokeDasharray={DASH[2]} dot={{ r: 3, fill: '#000' }} isAnimationActive={false} />
      </LineChart>
    </div>
  )
}

// ───────────────────────────────────────────
// Q2: Pie charts — Energy sources 1985 / 2000 / 2020
// ───────────────────────────────────────────
function PieChartQ2() {
  const [ref, w] = useContainerWidth()
  const pieW = Math.max(Math.floor(w / 3) - 8, 110)
  const r = Math.min(pieW / 2 - 22, 70)
  const years = [
    {
      year: '1985',
      data: [
        { name: 'Coal', value: 42 },
        { name: 'Oil', value: 35 },
        { name: 'Natural Gas', value: 15 },
        { name: 'Nuclear', value: 5 },
        { name: 'Renewables', value: 3 },
      ],
    },
    {
      year: '2000',
      data: [
        { name: 'Coal', value: 35 },
        { name: 'Oil', value: 30 },
        { name: 'Natural Gas', value: 20 },
        { name: 'Nuclear', value: 10 },
        { name: 'Renewables', value: 5 },
      ],
    },
    {
      year: '2020',
      data: [
        { name: 'Coal', value: 22 },
        { name: 'Oil', value: 22 },
        { name: 'Natural Gas', value: 26 },
        { name: 'Nuclear', value: 10 },
        { name: 'Renewables', value: 20 },
      ],
    },
  ]
  const h = pieW
  const cx = Math.floor(pieW / 2)
  const cy = Math.floor(h / 2)
  const renderLabel = ({ value }) => `${value}%`
  const shades = [GRAY[0], GRAY[1], GRAY[2], GRAY[3], GRAY[4]]
  return (
    <div ref={ref}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
        {years.map(({ year, data }, idx) => (
          <div key={year} style={{ textAlign: 'center' }}>
            <p className="text-sm font-semibold mb-1">{year}</p>
            <PieChart width={pieW} height={h}>
              <Pie data={data} cx={cx} cy={cy} outerRadius={r} innerRadius={0} dataKey="value" label={renderLabel} labelLine={false} fontSize={10} stroke="#000" strokeWidth={1} isAnimationActive={false}>
                {data.map((_, i) => <Cell key={`c${idx}-${i}`} fill={shades[i]} />)}
              </Pie>
            </PieChart>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 mt-2 text-xs flex-wrap">
        {['Coal', 'Oil', 'Natural Gas', 'Nuclear', 'Renewables'].map((name, i) => (
          <div key={name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 inline-block border border-black" style={{ backgroundColor: shades[i] }} />
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}

// ───────────────────────────────────────────
// Q3: Table — Household spending by country
// ───────────────────────────────────────────
function TableQ3() {
  const data = [
    { country: 'Japan', housing: 32, food: 24, transport: 12, education: 18, leisure: 14 },
    { country: 'UK', housing: 36, food: 18, transport: 15, education: 10, leisure: 21 },
    { country: 'Brazil', housing: 28, food: 30, transport: 10, education: 15, leisure: 17 },
    { country: 'Nigeria', housing: 22, food: 40, transport: 8, education: 20, leisure: 10 },
    { country: 'USA', housing: 38, food: 15, transport: 18, education: 8, leisure: 21 },
  ]
  const cols = ['Housing', 'Food', 'Transport', 'Education', 'Leisure']
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 font-semibold border border-black">Country</th>
            {cols.map(c => <th key={c} className="p-2 font-semibold border border-black text-center">{c} (%)</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.country} className="even:bg-gray-50">
              <td className="p-2 font-medium border border-black">{row.country}</td>
              <td className="p-2 text-center border border-black">{row.housing}</td>
              <td className="p-2 text-center border border-black">{row.food}</td>
              <td className="p-2 text-center border border-black">{row.transport}</td>
              <td className="p-2 text-center border border-black">{row.education}</td>
              <td className="p-2 text-center border border-black">{row.leisure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ───────────────────────────────────────────
// Q4: Bar chart #2 — International tourist arrivals
// ───────────────────────────────────────────
function BarChartQ4() {
  const [ref, w] = useContainerWidth()
  const data = [
    { country: 'France', 2010: 77, 2015: 85, 2020: 42 },
    { country: 'Spain', 2010: 53, 2015: 68, 2020: 36 },
    { country: 'USA', 2010: 60, 2015: 78, 2020: 19 },
    { country: 'China', 2010: 56, 2015: 57, 2020: 8 },
    { country: 'Italy', 2010: 44, 2015: 51, 2020: 25 },
  ]
  return (
    <div ref={ref}>
      <BarChart width={w} height={280} data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
        <XAxis dataKey="country" tick={{ fontSize: 12, fill: '#111827' }} />
        <YAxis tick={{ fontSize: 12, fill: '#111827' }} unit="m" />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="2010" fill={GRAY[0]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
        <Bar dataKey="2015" fill={GRAY[1]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
        <Bar dataKey="2020" fill={GRAY[2]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
      </BarChart>
    </div>
  )
}

// ───────────────────────────────────────────
// Q5: Process diagram — Chocolate production
// ───────────────────────────────────────────
function DiagramQ5() {
  const steps = [
    { label: '1. Cacao pods\nharvested', icon: 'pod' },
    { label: '2. Beans\nfermented', icon: 'basket' },
    { label: '3. Beans\nsun-dried', icon: 'sun' },
    { label: '4. Roasted\nat 150°C', icon: 'oven' },
    { label: '5. Cracked &\nwinnowed', icon: 'hammer' },
    { label: '6. Ground into\ncocoa mass', icon: 'grinder' },
    { label: '7. Mixed with\nsugar & milk', icon: 'bowl' },
    { label: '8. Tempered &\nmoulded', icon: 'bar' },
  ]

  const renderIcon = (type, cx, cy) => {
    switch (type) {
      case 'pod':
        // Cacao pod — oval with stem and ridges
        return (
          <g>
            <ellipse cx={cx} cy={cy} rx="12" ry="9" fill="#9ca3af" stroke="#000" strokeWidth="1" />
            <line x1={cx} y1={cy - 9} x2={cx + 2} y2={cy - 13} stroke="#000" strokeWidth="1.5" />
            <path d={`M ${cx - 10} ${cy - 2} Q ${cx} ${cy} ${cx + 10} ${cy - 2}`} fill="none" stroke="#4b5563" strokeWidth="0.7" />
            <path d={`M ${cx - 10} ${cy + 2} Q ${cx} ${cy + 4} ${cx + 10} ${cy + 2}`} fill="none" stroke="#4b5563" strokeWidth="0.7" />
          </g>
        )
      case 'basket':
        // Basket with beans on top
        return (
          <g>
            <circle cx={cx - 5} cy={cy - 6} r="1.8" fill="#111827" />
            <circle cx={cx} cy={cy - 7} r="1.8" fill="#111827" />
            <circle cx={cx + 5} cy={cy - 6} r="1.8" fill="#111827" />
            <circle cx={cx - 2} cy={cy - 4} r="1.8" fill="#111827" />
            <circle cx={cx + 3} cy={cy - 4} r="1.8" fill="#111827" />
            <path d={`M ${cx - 14} ${cy - 2} L ${cx + 14} ${cy - 2} L ${cx + 11} ${cy + 10} L ${cx - 11} ${cy + 10} Z`} fill="#e5e7eb" stroke="#000" strokeWidth="1" />
            <line x1={cx - 12} y1={cy + 2} x2={cx + 12} y2={cy + 2} stroke="#000" strokeWidth="0.5" />
            <line x1={cx - 12} y1={cy + 6} x2={cx + 12} y2={cy + 6} stroke="#000" strokeWidth="0.5" />
          </g>
        )
      case 'sun':
        // Sun with rays
        return (
          <g>
            <circle cx={cx} cy={cy} r="6" fill="#fff" stroke="#000" strokeWidth="1.2" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
              const rad = (a * Math.PI) / 180
              return (
                <line
                  key={a}
                  x1={cx + Math.cos(rad) * 8}
                  y1={cy + Math.sin(rad) * 8}
                  x2={cx + Math.cos(rad) * 12}
                  y2={cy + Math.sin(rad) * 12}
                  stroke="#000"
                  strokeWidth="1.2"
                />
              )
            })}
            <circle cx={cx - 2} cy={cy - 1} r="0.8" fill="#000" />
            <circle cx={cx + 2} cy={cy - 1} r="0.8" fill="#000" />
          </g>
        )
      case 'oven':
        // Oven with flame
        return (
          <g>
            <rect x={cx - 13} y={cy - 9} width="26" height="18" fill="#e5e7eb" stroke="#000" strokeWidth="1" />
            <line x1={cx - 13} y1={cy - 2} x2={cx + 13} y2={cy - 2} stroke="#000" strokeWidth="0.8" />
            <circle cx={cx - 9} cy={cy - 6} r="1" fill="#4b5563" />
            <circle cx={cx + 9} cy={cy - 6} r="1" fill="#4b5563" />
            <path d={`M ${cx - 3} ${cy + 6} Q ${cx - 3} ${cy} ${cx} ${cy - 2} Q ${cx + 3} ${cy} ${cx + 3} ${cy + 6} Q ${cx + 1} ${cy + 4} ${cx} ${cy + 7} Q ${cx - 1} ${cy + 4} ${cx - 3} ${cy + 6} Z`} fill="#6b7280" stroke="#000" strokeWidth="0.6" />
          </g>
        )
      case 'hammer':
        // Hammer cracking a bean
        return (
          <g>
            <rect x={cx - 3} y={cy - 10} width="14" height="5" fill="#4b5563" stroke="#000" strokeWidth="1" />
            <line x1={cx - 10} y1={cy} x2={cx + 2} y2={cy - 8} stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx={cx - 8} cy={cy + 6} rx="5" ry="3" fill="#9ca3af" stroke="#000" strokeWidth="0.8" />
            <line x1={cx - 12} y1={cy + 4} x2={cx - 4} y2={cy + 8} stroke="#000" strokeWidth="0.6" />
            <line x1={cx - 11} y1={cy + 9} x2={cx - 5} y2={cy + 3} stroke="#000" strokeWidth="0.6" />
          </g>
        )
      case 'grinder':
        // Mortar / grinder bowl with paste
        return (
          <g>
            <path d={`M ${cx - 13} ${cy - 3} Q ${cx - 13} ${cy + 9} ${cx} ${cy + 9} Q ${cx + 13} ${cy + 9} ${cx + 13} ${cy - 3} Z`} fill="#e5e7eb" stroke="#000" strokeWidth="1" />
            <ellipse cx={cx} cy={cy - 3} rx="13" ry="3" fill="#6b7280" stroke="#000" strokeWidth="0.8" />
            <line x1={cx + 5} y1={cy - 12} x2={cx + 2} y2={cy - 3} stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx={cx + 2} cy={cy - 3} r="2" fill="#4b5563" stroke="#000" strokeWidth="0.6" />
          </g>
        )
      case 'bowl':
        // Mixing bowl with spoon & droplets (sugar/milk)
        return (
          <g>
            <circle cx={cx - 9} cy={cy - 10} r="1.5" fill="#000" />
            <circle cx={cx + 9} cy={cy - 10} r="1.5" fill="#000" />
            <path d={`M ${cx - 13} ${cy - 2} Q ${cx - 13} ${cy + 9} ${cx} ${cy + 9} Q ${cx + 13} ${cy + 9} ${cx + 13} ${cy - 2} Z`} fill="#e5e7eb" stroke="#000" strokeWidth="1" />
            <line x1={cx - 13} y1={cy - 2} x2={cx + 13} y2={cy - 2} stroke="#000" strokeWidth="1" />
            <path d={`M ${cx + 5} ${cy - 11} L ${cx + 8} ${cy + 4}`} stroke="#000" strokeWidth="1.2" />
            <ellipse cx={cx + 5} cy={cy - 11} rx="2" ry="1.5" fill="#9ca3af" stroke="#000" strokeWidth="0.6" />
          </g>
        )
      case 'bar':
        // Chocolate bar — 4 segments
        return (
          <g>
            <rect x={cx - 14} y={cy - 6} width="28" height="12" fill="#6b7280" stroke="#000" strokeWidth="1" />
            <line x1={cx - 7} y1={cy - 6} x2={cx - 7} y2={cy + 6} stroke="#000" strokeWidth="0.7" />
            <line x1={cx} y1={cy - 6} x2={cx} y2={cy + 6} stroke="#000" strokeWidth="0.7" />
            <line x1={cx + 7} y1={cy - 6} x2={cx + 7} y2={cy + 6} stroke="#000" strokeWidth="0.7" />
            <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} stroke="#000" strokeWidth="0.7" />
            <rect x={cx - 13} y={cy - 5} width="2" height="1" fill="#d1d5db" />
          </g>
        )
      default:
        return null
    }
  }

  // Snake layout: row 0 left→right (steps 1–4), then drop down, row 1 right→left (steps 5–8)
  const BOX_W = 130
  const BOX_H = 105
  const boxX = (col) => 20 + col * 155
  const boxY = (row) => 30 + row * 160
  const colOf = (i) => (i < 4 ? i : 7 - i)
  const rowOf = (i) => (i < 4 ? 0 : 1)

  const arrowPairs = [
    [0, 1], [1, 2], [2, 3], // row 0 →
    [3, 4],                 // U-turn ↓ (same column)
    [4, 5], [5, 6], [6, 7], // row 1 ←
  ]

  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 640 360" width="100%" height="360" style={{ fontFamily: 'sans-serif', color: '#000' }}>
        <defs>
          <marker id="arrowhead-bw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#000" />
          </marker>
        </defs>
        {steps.map((step, i) => {
          const col = colOf(i)
          const row = rowOf(i)
          const x = boxX(col)
          const y = boxY(row)
          const iconCx = x + BOX_W / 2
          const iconCy = y + 28
          return (
            <g key={i}>
              <rect x={x} y={y} width={BOX_W} height={BOX_H} fill="#f3f4f6" stroke="#000" strokeWidth="1.2" />
              <line x1={x} y1={y + 52} x2={x + BOX_W} y2={y + 52} stroke="#000" strokeWidth="0.5" strokeDasharray="2 2" />
              {renderIcon(step.icon, iconCx, iconCy)}
              <foreignObject x={x} y={y + 54} width={BOX_W} height="50">
                <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 11, color: '#111', whiteSpace: 'pre-line', padding: '0 4px', lineHeight: 1.25 }}>
                  {step.label}
                </div>
              </foreignObject>
            </g>
          )
        })}
        {arrowPairs.map(([a, b], i) => {
          const cA = colOf(a), rA = rowOf(a)
          const cB = colOf(b), rB = rowOf(b)
          let x1, y1, x2, y2
          if (rA === rB) {
            // Horizontal arrow across the same row, centred vertically on the box.
            y1 = y2 = boxY(rA) + 52
            if (cA < cB) { x1 = boxX(cA) + BOX_W; x2 = boxX(cB) }
            else { x1 = boxX(cA); x2 = boxX(cB) + BOX_W }
          } else {
            // Vertical U-turn arrow down the shared column.
            x1 = x2 = boxX(cA) + BOX_W / 2
            y1 = boxY(rA) + BOX_H
            y2 = boxY(rB)
          }
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth="1.5" markerEnd="url(#arrowhead-bw)" />
        })}
      </svg>
      <p className="text-xs text-center mt-1 italic">The diagram shows the stages of chocolate production from cacao pods to finished bars.</p>
    </div>
  )
}

// ───────────────────────────────────────────
// Q6: Map — Brookfield town, 1990 vs 2020
// ───────────────────────────────────────────
function MapQ6() {
  const Label = ({ x, y, children, size = 9 }) => (
    <text x={x} y={y} fontSize={size} textAnchor="middle" fill="#000" fontFamily="sans-serif">{children}</text>
  )
  const Compass = ({ x, y }) => (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="0" r="11" fill="#fff" stroke="#000" strokeWidth="0.8" />
      <polygon points="0,-9 3,0 0,9 -3,0" fill="#000" />
      <text x="0" y="-13" fontSize="8" textAnchor="middle" fill="#000">N</text>
    </g>
  )
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* ========== 1990 ========== */}
        <div>
          <p className="text-xs font-semibold text-center mb-1">Brookfield — 1990</p>
          <svg viewBox="0 0 320 270" width="100%" style={{ maxHeight: 280 }}>
            <rect x="1" y="1" width="318" height="268" fill="#fff" stroke="#000" />
            <Compass x={298} y={22} />

            {/* Main road (horizontal) */}
            <rect x="0" y="128" width="320" height="14" fill="#e5e7eb" stroke="#000" strokeWidth="0.7" />
            <line x1="0" y1="135" x2="320" y2="135" stroke="#000" strokeDasharray="5 4" strokeWidth="0.5" />
            <Label x={40} y={124} size={9}>Main Road</Label>

            {/* Side road (vertical) */}
            <rect x="148" y="0" width="10" height="128" fill="#e5e7eb" stroke="#000" strokeWidth="0.7" />
            <rect x="148" y="142" width="10" height="128" fill="#e5e7eb" stroke="#000" strokeWidth="0.7" />

            {/* River with bridge */}
            <path d="M 245 0 Q 238 40 250 75 Q 260 105 248 128" fill="none" stroke="#000" strokeWidth="1.8" />
            <path d="M 248 142 Q 260 175 248 205 Q 238 235 252 270" fill="none" stroke="#000" strokeWidth="1.8" />
            <Label x={267} y={48} size={9}>River</Label>
            <rect x="242" y="126" width="14" height="18" fill="#fff" stroke="#000" strokeWidth="0.8" />
            <line x1="242" y1="130" x2="256" y2="130" stroke="#000" strokeWidth="0.5" />
            <line x1="242" y1="140" x2="256" y2="140" stroke="#000" strokeWidth="0.5" />

            {/* Church (top-left) */}
            <rect x="22" y="38" width="46" height="34" fill="#e5e7eb" stroke="#000" />
            <polygon points="22,38 45,18 68,38" fill="#9ca3af" stroke="#000" />
            <line x1="45" y1="18" x2="45" y2="10" stroke="#000" strokeWidth="0.8" />
            <line x1="42" y1="13" x2="48" y2="13" stroke="#000" strokeWidth="0.8" />
            <Label x={45} y={58}>Church</Label>

            {/* Woods (top-middle) */}
            <circle cx="85" cy="38" r="7" fill="#d1d5db" stroke="#000" strokeWidth="0.7" />
            <circle cx="98" cy="46" r="7" fill="#d1d5db" stroke="#000" strokeWidth="0.7" />
            <circle cx="111" cy="38" r="7" fill="#d1d5db" stroke="#000" strokeWidth="0.7" />
            <circle cx="124" cy="46" r="7" fill="#d1d5db" stroke="#000" strokeWidth="0.7" />
            <Label x={105} y={65}>Woods</Label>

            {/* Farmland (top-right) */}
            <rect x="170" y="22" width="68" height="90" fill="#fff" stroke="#000" strokeDasharray="3 3" />
            <line x1="170" y1="45" x2="238" y2="45" stroke="#9ca3af" strokeDasharray="2 3" />
            <line x1="170" y1="68" x2="238" y2="68" stroke="#9ca3af" strokeDasharray="2 3" />
            <line x1="170" y1="90" x2="238" y2="90" stroke="#9ca3af" strokeDasharray="2 3" />
            <Label x={204} y={62}>Farmland</Label>

            {/* School (bottom-left) */}
            <rect x="18" y="160" width="60" height="36" fill="#e5e7eb" stroke="#000" />
            <rect x="25" y="170" width="8" height="9" fill="#fff" stroke="#000" strokeWidth="0.5" />
            <rect x="40" y="170" width="8" height="9" fill="#fff" stroke="#000" strokeWidth="0.5" />
            <rect x="55" y="170" width="8" height="9" fill="#fff" stroke="#000" strokeWidth="0.5" />
            <rect x="40" y="184" width="10" height="12" fill="#9ca3af" stroke="#000" strokeWidth="0.5" />
            <Label x={48} y={212}>School</Label>

            {/* Houses (bottom-middle row) */}
            {[85, 108, 165].map((hx, i) => (
              <g key={i} transform={`translate(${hx}, 165)`}>
                <polygon points="0,10 10,0 20,10" fill="#9ca3af" stroke="#000" />
                <rect x="2" y="10" width="16" height="14" fill="#fff" stroke="#000" />
                <rect x="8" y="16" width="4" height="8" fill="#9ca3af" stroke="#000" strokeWidth="0.4" />
              </g>
            ))}
            <Label x={130} y={202}>Houses</Label>

            {/* Post Office (bottom-middle below houses) */}
            <rect x="88" y="220" width="50" height="30" fill="#f3f4f6" stroke="#000" />
            <rect x="108" y="232" width="10" height="18" fill="#9ca3af" stroke="#000" strokeWidth="0.5" />
            <Label x={113} y={245} size={8}>Post Office</Label>

            {/* Pond (bottom-right) */}
            <ellipse cx="195" cy="230" rx="28" ry="15" fill="#e5e7eb" stroke="#000" />
            <Label x={195} y={233}>Pond</Label>
          </svg>
        </div>

        {/* ========== 2020 ========== */}
        <div>
          <p className="text-xs font-semibold text-center mb-1">Brookfield — 2020</p>
          <svg viewBox="0 0 320 270" width="100%" style={{ maxHeight: 280 }}>
            <rect x="1" y="1" width="318" height="268" fill="#fff" stroke="#000" />
            <Compass x={298} y={22} />

            {/* Highway (widened) */}
            <rect x="0" y="122" width="320" height="24" fill="#d1d5db" stroke="#000" strokeWidth="0.7" />
            <line x1="0" y1="134" x2="320" y2="134" stroke="#fff" strokeDasharray="6 4" strokeWidth="1" />
            <Label x={40} y={118} size={9}>Highway</Label>

            {/* Roundabout at intersection */}
            <circle cx="153" cy="134" r="15" fill="#fff" stroke="#000" strokeWidth="1" />
            <circle cx="153" cy="134" r="6" fill="#d1d5db" stroke="#000" strokeWidth="0.5" />

            {/* Side road (still vertical) */}
            <rect x="148" y="0" width="10" height="119" fill="#e5e7eb" stroke="#000" strokeWidth="0.7" />
            <rect x="148" y="149" width="10" height="121" fill="#e5e7eb" stroke="#000" strokeWidth="0.7" />

            {/* River with widened bridge */}
            <path d="M 245 0 Q 238 40 250 75 Q 260 105 248 122" fill="none" stroke="#000" strokeWidth="1.8" />
            <path d="M 248 146 Q 260 175 248 205 Q 238 235 252 270" fill="none" stroke="#000" strokeWidth="1.8" />
            <Label x={267} y={48} size={9}>River</Label>
            <rect x="240" y="120" width="18" height="28" fill="#fff" stroke="#000" strokeWidth="0.8" />
            <line x1="240" y1="128" x2="258" y2="128" stroke="#000" strokeWidth="0.5" />
            <line x1="240" y1="140" x2="258" y2="140" stroke="#000" strokeWidth="0.5" />

            {/* Church (unchanged) */}
            <rect x="22" y="38" width="46" height="34" fill="#e5e7eb" stroke="#000" />
            <polygon points="22,38 45,18 68,38" fill="#9ca3af" stroke="#000" />
            <line x1="45" y1="18" x2="45" y2="10" stroke="#000" strokeWidth="0.8" />
            <line x1="42" y1="13" x2="48" y2="13" stroke="#000" strokeWidth="0.8" />
            <Label x={45} y={58}>Church</Label>

            {/* Car Park (replaces woods) */}
            <rect x="78" y="28" width="60" height="40" fill="#f3f4f6" stroke="#000" />
            {[0, 1, 2].map((i) => (
              <line key={i} x1={78 + 15 * (i + 1)} y1="28" x2={78 + 15 * (i + 1)} y2="68" stroke="#6b7280" strokeWidth="0.5" strokeDasharray="2 2" />
            ))}
            <line x1="78" y1="48" x2="138" y2="48" stroke="#6b7280" strokeWidth="0.4" strokeDasharray="1 2" />
            <Label x={108} y={54} size={8}>Car Park</Label>

            {/* Supermarket (replaces farmland top) */}
            <rect x="170" y="22" width="68" height="48" fill="#d1d5db" stroke="#000" />
            <rect x="180" y="55" width="20" height="15" fill="#fff" stroke="#000" strokeWidth="0.6" />
            <Label x={204} y={42} size={9}>Supermarket</Label>

            {/* Sports Centre (replaces lower farmland) */}
            <rect x="170" y="75" width="68" height="37" fill="#e5e7eb" stroke="#000" />
            <circle cx="190" cy="95" r="4" fill="none" stroke="#000" strokeWidth="0.8" />
            <rect x="210" y="88" width="20" height="14" fill="none" stroke="#000" strokeWidth="0.6" />
            <Label x={204} y={110} size={8}>Sports Centre</Label>

            {/* Apartments (replaces school) */}
            <rect x="18" y="160" width="60" height="55" fill="#9ca3af" stroke="#000" />
            {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => (
              <rect key={`a-${r}-${c}`} x={23 + c * 18} y={165 + r * 12} width="13" height="8" fill="#fff" stroke="#000" strokeWidth="0.3" />
            )))}
            <Label x={48} y={228} size={9}>Apartments</Label>

            {/* Bus Station (new, replaces houses) */}
            <rect x="85" y="160" width="55" height="32" fill="#f3f4f6" stroke="#000" />
            <rect x="90" y="178" width="45" height="10" fill="#d1d5db" stroke="#000" strokeWidth="0.5" />
            <circle cx="95" cy="191" r="2.5" fill="#000" />
            <circle cx="130" cy="191" r="2.5" fill="#000" />
            <Label x={112} y={172} size={7}>Bus Station</Label>

            {/* Café (replaces post office) */}
            <rect x="88" y="200" width="50" height="30" fill="#e5e7eb" stroke="#000" />
            <path d="M 95 208 L 125 208 L 125 216 L 95 216 Z" fill="#fff" stroke="#000" strokeWidth="0.5" />
            <Label x={113} y={244} size={8}>Café</Label>

            {/* Park (replaces pond) */}
            <rect x="163" y="158" width="75" height="85" fill="#f3f4f6" stroke="#000" />
            <circle cx="175" cy="175" r="5" fill="#6b7280" stroke="#000" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="5" fill="#6b7280" stroke="#000" strokeWidth="0.5" />
            <circle cx="220" cy="175" r="5" fill="#6b7280" stroke="#000" strokeWidth="0.5" />
            <circle cx="225" cy="220" r="5" fill="#6b7280" stroke="#000" strokeWidth="0.5" />
            <path d="M 168 225 Q 185 220 200 227 Q 220 232 234 225" fill="none" stroke="#9ca3af" strokeWidth="0.7" />
            <Label x={200} y={238}>Park</Label>
          </svg>
        </div>
      </div>
      <p className="text-xs text-center mt-1 italic">The maps show the town of Brookfield in 1990 and 2020.</p>
    </div>
  )
}

// ───────────────────────────────────────────
// Q7: Multi — Obese adults by age group (pie) + Obesity prevalence by country (table)
// ───────────────────────────────────────────
function MultiQ7() {
  const [ref, w] = useContainerWidth()
  const pieA = [
    { name: '20–34', value: 18 },
    { name: '35–49', value: 27 },
    { name: '50–64', value: 34 },
    { name: '65+', value: 21 },
  ]
  const tableRows = [
    { country: 'USA', 2000: 30, 2020: 42 },
    { country: 'UK', 2000: 21, 2020: 28 },
    { country: 'Brazil', 2000: 11, 2020: 22 },
    { country: 'France', 2000: 10, 2020: 17 },
    { country: 'Japan', 2000: 3, 2020: 5 },
  ]
  const pieSize = Math.min(260, w)
  return (
    <div ref={ref}>
      <p className="text-xs font-semibold mb-1">A. Share of obese adults in the UK by age group, 2020</p>
      <div className="flex justify-center">
        <PieChart width={pieSize} height={pieSize}>
          <Pie data={pieA} cx={pieSize / 2} cy={pieSize / 2} outerRadius={pieSize / 2 - 40} dataKey="value"
               label={({ name, value }) => `${name} ${value}%`} labelLine={true} fontSize={10} stroke="#000" strokeWidth={1} isAnimationActive={false}>
            {pieA.map((_, i) => <Cell key={`pq7a-${i}`} fill={GRAY[i]} />)}
          </Pie>
        </PieChart>
      </div>
      <p className="text-xs font-semibold mt-4 mb-1">B. Prevalence of adult obesity in five countries (%), 2000 vs 2020</p>
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 font-semibold border border-black">Country</th>
            <th className="p-2 font-semibold border border-black text-center">2000</th>
            <th className="p-2 font-semibold border border-black text-center">2020</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row) => (
            <tr key={row.country} className="even:bg-gray-50">
              <td className="p-2 font-medium border border-black">{row.country}</td>
              <td className="p-2 text-center border border-black">{row[2000]}</td>
              <td className="p-2 text-center border border-black">{row[2020]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ───────────────────────────────────────────
// Q8: Multi — Population aging (line) + Family types (table)
// ───────────────────────────────────────────
function MultiQ8() {
  const [ref, w] = useContainerWidth()
  const lineData = [
    { year: '1980', '65+': 11, '15–64': 65, '0–14': 24 },
    { year: '1990', '65+': 13, '15–64': 66, '0–14': 21 },
    { year: '2000', '65+': 15, '15–64': 67, '0–14': 18 },
    { year: '2010', '65+': 17, '15–64': 68, '0–14': 15 },
    { year: '2020', '65+': 20, '15–64': 67, '0–14': 13 },
  ]
  const tableRows = [
    { type: 'Nuclear family', 1980: 48, 2020: 29 },
    { type: 'Single-parent', 1980: 9, 2020: 17 },
    { type: 'Couple, no children', 1980: 20, 2020: 28 },
    { type: 'Single-person', 1980: 17, 2020: 22 },
    { type: 'Other', 1980: 6, 2020: 4 },
  ]
  return (
    <div ref={ref}>
      <p className="text-xs font-semibold mb-1">A. Age group shares in Japan (%), 1980–2020</p>
      <LineChart width={w} height={220} data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#111827' }} />
        <YAxis tick={{ fontSize: 11, fill: '#111827' }} unit="%" />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="65+" stroke="#000" strokeWidth={2} strokeDasharray={DASH[0]} dot={{ r: 3, fill: '#000' }} isAnimationActive={false} />
        <Line type="monotone" dataKey="15–64" stroke="#000" strokeWidth={2} strokeDasharray={DASH[1]} dot={{ r: 3, fill: '#000' }} isAnimationActive={false} />
        <Line type="monotone" dataKey="0–14" stroke="#000" strokeWidth={2} strokeDasharray={DASH[2]} dot={{ r: 3, fill: '#000' }} isAnimationActive={false} />
      </LineChart>
      <p className="text-xs font-semibold mt-3 mb-1">B. Share of household types in Japan (%)</p>
      <table className="w-full text-xs sm:text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 font-semibold border border-black">Household type</th>
            <th className="p-2 font-semibold border border-black text-center">1980</th>
            <th className="p-2 font-semibold border border-black text-center">2020</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map(row => (
            <tr key={row.type} className="even:bg-gray-50">
              <td className="p-2 font-medium border border-black">{row.type}</td>
              <td className="p-2 text-center border border-black">{row[1980]}</td>
              <td className="p-2 text-center border border-black">{row[2020]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ───────────────────────────────────────────
// Q9: Multi — Social media platform shares (pie) + Screen time (line)
// ───────────────────────────────────────────
function MultiQ9() {
  const [ref, w] = useContainerWidth()
  const pieData = [
    { name: 'YouTube', value: 34 },
    { name: 'TikTok', value: 26 },
    { name: 'Instagram', value: 22 },
    { name: 'Twitter/X', value: 10 },
    { name: 'Facebook', value: 8 },
  ]
  const lineData = [
    { year: '2015', Teens: 2.1, '20s': 2.7, '30s+': 2.2 },
    { year: '2017', Teens: 2.8, '20s': 3.0, '30s+': 2.4 },
    { year: '2019', Teens: 3.5, '20s': 3.4, '30s+': 2.6 },
    { year: '2021', Teens: 4.6, '20s': 3.9, '30s+': 3.0 },
    { year: '2023', Teens: 5.2, '20s': 4.3, '30s+': 3.2 },
  ]
  const pieSize = Math.min(260, w)
  return (
    <div ref={ref}>
      <p className="text-xs font-semibold mb-1">A. Share of teenagers using five social media platforms, 2023</p>
      <div className="flex justify-center">
        <PieChart width={pieSize} height={pieSize}>
          <Pie data={pieData} cx={pieSize / 2} cy={pieSize / 2} outerRadius={pieSize / 2 - 40} dataKey="value"
               label={({ name, value }) => `${name} ${value}%`} labelLine={true} fontSize={10} stroke="#000" strokeWidth={1} isAnimationActive={false}>
            {pieData.map((_, i) => <Cell key={`pq9-${i}`} fill={GRAY[i % GRAY.length]} />)}
          </Pie>
        </PieChart>
      </div>
      <p className="text-xs font-semibold mt-4 mb-1">B. Average daily screen time by age group (hours), 2015–2023</p>
      <LineChart width={w} height={200} data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#111827' }} />
        <YAxis tick={{ fontSize: 11, fill: '#111827' }} unit="h" />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="Teens" stroke="#000" strokeWidth={2} strokeDasharray={DASH[0]} dot={{ r: 3, fill: '#000' }} isAnimationActive={false} />
        <Line type="monotone" dataKey="20s" stroke="#000" strokeWidth={2} strokeDasharray={DASH[1]} dot={{ r: 3, fill: '#000' }} isAnimationActive={false} />
        <Line type="monotone" dataKey="30s+" stroke="#000" strokeWidth={2} strokeDasharray={DASH[2]} dot={{ r: 3, fill: '#000' }} isAnimationActive={false} />
      </LineChart>
    </div>
  )
}

const charts = [
  BarChartQ0,   // 0 — Bar #1 (Universities)
  LineChartQ1,  // 1 — Line (Temperatures)
  PieChartQ2,   // 2 — Pie (Energy 1985 vs 2010)
  TableQ3,      // 3 — Table (Household spending)
  BarChartQ4,   // 4 — Bar #2 (Tourism)
  DiagramQ5,    // 5 — Diagram (Chocolate production)
  MapQ6,        // 6 — Map (Brookfield 1990/2020)
  MultiQ7,      // 7 — Multi (Obesity bar + Food spending pie)
  MultiQ8,      // 8 — Multi (Aging line + Household table)
  MultiQ9,      // 9 — Multi (Social media bar + Screen time line)
]

export default function Task1Chart({ questionIndex }) {
  const Chart = charts[questionIndex]
  if (!Chart) return null
  return (
    <div className="bg-white rounded-lg border border-black p-4 mb-1" style={{ minWidth: 0, color: '#000' }}>
      <Chart />
    </div>
  )
}
