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
  const data = [
    { year: '2015', Business: 450, Engineering: 380, 'Art & Design': 210 },
    { year: '2016', Business: 480, Engineering: 400, 'Art & Design': 195 },
    { year: '2017', Business: 520, Engineering: 430, 'Art & Design': 220 },
    { year: '2018', Business: 550, Engineering: 470, 'Art & Design': 250 },
    { year: '2019', Business: 530, Engineering: 510, 'Art & Design': 280 },
    { year: '2020', Business: 490, Engineering: 540, 'Art & Design': 310 },
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
// Q2: Pie charts — Energy sources 1985 vs 2010
// ───────────────────────────────────────────
function PieChartQ2() {
  const [ref, w] = useContainerWidth()
  const pieW = Math.max(Math.floor(w / 2) - 10, 150)
  const r = Math.min(pieW / 2 - 30, 80)
  const data1985 = [
    { name: 'Coal', value: 42 },
    { name: 'Oil', value: 35 },
    { name: 'Natural Gas', value: 15 },
    { name: 'Nuclear', value: 5 },
    { name: 'Renewables', value: 3 },
  ]
  const data2010 = [
    { name: 'Coal', value: 28 },
    { name: 'Oil', value: 25 },
    { name: 'Natural Gas', value: 22 },
    { name: 'Nuclear', value: 12 },
    { name: 'Renewables', value: 13 },
  ]
  const h = pieW
  const cx = Math.floor(pieW / 2)
  const cy = Math.floor(h / 2)
  const renderLabel = ({ value }) => `${value}%`
  const shades = [GRAY[0], GRAY[1], GRAY[2], GRAY[3], GRAY[4]]
  return (
    <div ref={ref}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        <div style={{ textAlign: 'center' }}>
          <p className="text-sm font-semibold mb-1">1985</p>
          <PieChart width={pieW} height={h}>
            <Pie data={data1985} cx={cx} cy={cy} outerRadius={r} innerRadius={0} dataKey="value" label={renderLabel} labelLine={false} fontSize={11} stroke="#000" strokeWidth={1} isAnimationActive={false}>
              {data1985.map((_, i) => <Cell key={`c1-${i}`} fill={shades[i]} />)}
            </Pie>
          </PieChart>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p className="text-sm font-semibold mb-1">2010</p>
          <PieChart width={pieW} height={h}>
            <Pie data={data2010} cx={cx} cy={cy} outerRadius={r} innerRadius={0} dataKey="value" label={renderLabel} labelLine={false} fontSize={11} stroke="#000" strokeWidth={1} isAnimationActive={false}>
              {data2010.map((_, i) => <Cell key={`c2-${i}`} fill={shades[i]} />)}
            </Pie>
          </PieChart>
        </div>
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
    '1. Cacao pods\nharvested',
    '2. Beans fermented\n(5–7 days)',
    '3. Beans\nsun-dried',
    '4. Roasted\nat 150°C',
    '5. Cracked &\nwinnowed',
    '6. Ground into\ncocoa mass',
    '7. Mixed with\nsugar & milk',
    '8. Tempered &\nmoulded',
  ]
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 640 340" width="100%" height="340" style={{ fontFamily: 'sans-serif', color: '#000' }}>
        <defs>
          <marker id="arrowhead-bw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#000" />
          </marker>
        </defs>
        {steps.map((label, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          const x = 20 + col * 155
          const y = 40 + row * 150
          return (
            <g key={i}>
              <rect x={x} y={y} width="130" height="90" fill="#f3f4f6" stroke="#000" strokeWidth="1.2" />
              <foreignObject x={x} y={y} width="130" height="90">
                <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 12, color: '#111', whiteSpace: 'pre-line', padding: 4 }}>
                  {label}
                </div>
              </foreignObject>
            </g>
          )
        })}
        {/* Arrows: 1→2, 2→3, 3→4, 4→5 (down-around), 5→6, 6→7, 7→8 */}
        {[[0,1],[1,2],[2,3],[4,5],[5,6],[6,7]].map(([a,b],i) => {
          const colA = a % 4, rowA = Math.floor(a / 4)
          const colB = b % 4, rowB = Math.floor(b / 4)
          const x1 = 20 + colA * 155 + 130
          const y1 = 40 + rowA * 150 + 45
          const x2 = 20 + colB * 155
          const y2 = 40 + rowB * 150 + 45
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#000" strokeWidth="1.5" markerEnd="url(#arrowhead-bw)" />
        })}
        {/* Arrow 4 → 5 (wrap to next row) */}
        <path d="M 610 85 Q 628 85 628 115 Q 628 160 610 190 L 155 190" fill="none" stroke="#000" strokeWidth="1.5" markerEnd="url(#arrowhead-bw)" />
      </svg>
      <p className="text-xs text-center mt-1 italic">The diagram shows the stages of chocolate production from cacao pods to finished bars.</p>
    </div>
  )
}

// ───────────────────────────────────────────
// Q6: Map — Brookfield town, 1990 vs 2020
// ───────────────────────────────────────────
function MapQ6() {
  const Label = ({ x, y, children, size = 10 }) => (
    <text x={x} y={y} fontSize={size} textAnchor="middle" fill="#000" fontFamily="sans-serif">{children}</text>
  )
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {/* 1990 */}
        <div>
          <p className="text-xs font-semibold text-center mb-1">Brookfield — 1990</p>
          <svg viewBox="0 0 280 220" width="100%" height="200">
            <rect x="1" y="1" width="278" height="218" fill="#fff" stroke="#000" />
            {/* Road */}
            <line x1="0" y1="110" x2="280" y2="110" stroke="#000" strokeWidth="4" />
            <line x1="0" y1="110" x2="280" y2="110" stroke="#fff" strokeWidth="1" strokeDasharray="6 6" />
            <Label x={140} y={104}>Main Road</Label>
            {/* Church */}
            <rect x="40" y="40" width="50" height="40" fill="#e5e7eb" stroke="#000" />
            <polygon points="40,40 65,20 90,40" fill="#9ca3af" stroke="#000" />
            <Label x={65} y={62}>Church</Label>
            {/* Farmland */}
            <rect x="160" y="30" width="100" height="60" fill="#fff" stroke="#000" strokeDasharray="3 3" />
            <Label x={210} y={62}>Farmland</Label>
            {/* Houses */}
            <rect x="30" y="150" width="30" height="30" fill="#fff" stroke="#000" />
            <rect x="70" y="150" width="30" height="30" fill="#fff" stroke="#000" />
            <rect x="110" y="150" width="30" height="30" fill="#fff" stroke="#000" />
            <Label x={85} y={195}>Houses</Label>
            {/* Pond */}
            <ellipse cx="220" cy="165" rx="32" ry="18" fill="#e5e7eb" stroke="#000" />
            <Label x={220} y={168}>Pond</Label>
          </svg>
        </div>
        {/* 2020 */}
        <div>
          <p className="text-xs font-semibold text-center mb-1">Brookfield — 2020</p>
          <svg viewBox="0 0 280 220" width="100%" height="200">
            <rect x="1" y="1" width="278" height="218" fill="#fff" stroke="#000" />
            {/* Highway (widened) */}
            <line x1="0" y1="110" x2="280" y2="110" stroke="#000" strokeWidth="8" />
            <line x1="0" y1="110" x2="280" y2="110" stroke="#fff" strokeWidth="1" strokeDasharray="6 6" />
            <Label x={140} y={102}>Highway</Label>
            {/* Church (unchanged) */}
            <rect x="40" y="40" width="50" height="40" fill="#e5e7eb" stroke="#000" />
            <polygon points="40,40 65,20 90,40" fill="#9ca3af" stroke="#000" />
            <Label x={65} y={62}>Church</Label>
            {/* Supermarket (replaces farmland) */}
            <rect x="160" y="25" width="100" height="65" fill="#d1d5db" stroke="#000" />
            <Label x={210} y={62}>Supermarket</Label>
            {/* Apartments (replaces houses) */}
            <rect x="25" y="130" width="120" height="55" fill="#9ca3af" stroke="#000" />
            <Label x={85} y={163} size={11}>Apartments</Label>
            {/* Park (replaces pond+area) */}
            <rect x="170" y="125" width="95" height="70" fill="#f3f4f6" stroke="#000" />
            <circle cx="190" cy="150" r="6" fill="#6b7280" stroke="#000" />
            <circle cx="210" cy="175" r="6" fill="#6b7280" stroke="#000" />
            <circle cx="240" cy="155" r="6" fill="#6b7280" stroke="#000" />
            <Label x={217} y={193}>Park</Label>
          </svg>
        </div>
      </div>
      <p className="text-xs text-center mt-1 italic">The maps show the town of Brookfield in 1990 and 2020.</p>
    </div>
  )
}

// ───────────────────────────────────────────
// Q7: Multi — Obesity rates (bar) + Food spending (pie)
// ───────────────────────────────────────────
function MultiQ7() {
  const [ref, w] = useContainerWidth()
  const barData = [
    { year: '2000', Men: 18, Women: 20, Children: 8 },
    { year: '2005', Men: 22, Women: 23, Children: 11 },
    { year: '2010', Men: 26, Women: 26, Children: 14 },
    { year: '2015', Men: 30, Women: 29, Children: 17 },
    { year: '2020', Men: 35, Women: 33, Children: 20 },
  ]
  const pieData = [
    { name: 'Fast food', value: 38 },
    { name: 'Processed', value: 27 },
    { name: 'Fresh produce', value: 20 },
    { name: 'Dairy', value: 15 },
  ]
  const barW = w
  const pieSize = Math.min(260, w)
  return (
    <div ref={ref}>
      <p className="text-xs font-semibold mb-1">A. Obesity rates in the UK (%), 2000–2020</p>
      <BarChart width={barW} height={220} data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#111827' }} />
        <YAxis tick={{ fontSize: 11, fill: '#111827' }} unit="%" />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Men" fill={GRAY[0]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
        <Bar dataKey="Women" fill={GRAY[1]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
        <Bar dataKey="Children" fill={GRAY[2]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
      </BarChart>
      <p className="text-xs font-semibold mt-4 mb-1">B. Share of household food spending, 2020</p>
      <div className="flex justify-center">
        <PieChart width={pieSize} height={pieSize}>
          <Pie data={pieData} cx={pieSize/2} cy={pieSize/2} outerRadius={pieSize/2 - 40} dataKey="value"
               label={({ name, value }) => `${name} ${value}%`} labelLine={true} fontSize={10} stroke="#000" strokeWidth={1} isAnimationActive={false}>
            {pieData.map((_, i) => <Cell key={`pq7-${i}`} fill={GRAY[i]} />)}
          </Pie>
        </PieChart>
      </div>
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
// Q9: Multi — Social media usage (bar) + Screen time (line)
// ───────────────────────────────────────────
function MultiQ9() {
  const [ref, w] = useContainerWidth()
  const barData = [
    { platform: 'YouTube', Teens: 95, '20s': 88, '30s+': 70 },
    { platform: 'Instagram', Teens: 78, '20s': 82, '30s+': 45 },
    { platform: 'TikTok', Teens: 80, '20s': 60, '30s+': 20 },
    { platform: 'Twitter/X', Teens: 42, '20s': 55, '30s+': 35 },
    { platform: 'Facebook', Teens: 30, '20s': 50, '30s+': 70 },
  ]
  const lineData = [
    { year: '2015', daily_hours: 2.1 },
    { year: '2017', daily_hours: 2.8 },
    { year: '2019', daily_hours: 3.5 },
    { year: '2021', daily_hours: 4.6 },
    { year: '2023', daily_hours: 5.2 },
  ]
  return (
    <div ref={ref}>
      <p className="text-xs font-semibold mb-1">A. Share of users by platform and age group (%)</p>
      <BarChart width={w} height={220} data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
        <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#111827' }} />
        <YAxis tick={{ fontSize: 11, fill: '#111827' }} unit="%" />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="Teens" fill={GRAY[0]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
        <Bar dataKey="20s" fill={GRAY[1]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
        <Bar dataKey="30s+" fill={GRAY[2]} stroke="#000" strokeWidth={0.5} isAnimationActive={false} />
      </BarChart>
      <p className="text-xs font-semibold mt-4 mb-1">B. Average daily screen time of teenagers (hours)</p>
      <LineChart width={w} height={180} data={lineData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#111827' }} />
        <YAxis tick={{ fontSize: 11, fill: '#111827' }} unit="h" />
        <Line type="monotone" dataKey="daily_hours" stroke="#000" strokeWidth={2} dot={{ r: 4, fill: '#000' }} isAnimationActive={false} />
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
