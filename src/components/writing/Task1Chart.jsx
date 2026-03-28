import { useRef, useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const COLORS = ['#5B5FC7', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899']

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

// Q0: Bar chart
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
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Business" fill={COLORS[0]} radius={[2, 2, 0, 0]} />
        <Bar dataKey="Engineering" fill={COLORS[1]} radius={[2, 2, 0, 0]} />
        <Bar dataKey="Art & Design" fill={COLORS[2]} radius={[2, 2, 0, 0]} />
      </BarChart>
    </div>
  )
}

// Q1: Pie charts — energy sources 1985 vs 2010
function PieChartQ1() {
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
  return (
    <div ref={ref}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        <div style={{ textAlign: 'center' }}>
          <p className="text-sm font-semibold text-text-secondary mb-1">1985</p>
          <PieChart width={pieW} height={h}>
            <Pie data={data1985} cx={cx} cy={cy} outerRadius={r} innerRadius={0} dataKey="value" label={renderLabel} labelLine={false} fontSize={11} isAnimationActive={false}>
              {data1985.map((_, i) => <Cell key={`c1-${i}`} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} />
          </PieChart>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p className="text-sm font-semibold text-text-secondary mb-1">2010</p>
          <PieChart width={pieW} height={h}>
            <Pie data={data2010} cx={cx} cy={cy} outerRadius={r} innerRadius={0} dataKey="value" label={renderLabel} labelLine={false} fontSize={11} isAnimationActive={false}>
              {data2010.map((_, i) => <Cell key={`c2-${i}`} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} />
          </PieChart>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-2 text-xs flex-wrap">
        {['Coal', 'Oil', 'Natural Gas', 'Nuclear', 'Renewables'].map((name, i) => (
          <div key={name} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: COLORS[i] }} />
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}

// Q2: Line graph — monthly temperatures
function LineChartQ2() {
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
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 12 }} unit="°C" />
        <Tooltip formatter={(v) => `${v}°C`} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="London" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="Sydney" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="Tokyo" stroke={COLORS[2]} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </div>
  )
}

// Q3: Table
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
          <tr className="bg-primary/10">
            <th className="text-left p-2 font-semibold border border-border">Country</th>
            {cols.map(c => <th key={c} className="p-2 font-semibold border border-border text-center">{c} (%)</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr key={row.country} className="even:bg-surface">
              <td className="p-2 font-medium border border-border">{row.country}</td>
              <td className="p-2 text-center border border-border">{row.housing}</td>
              <td className="p-2 text-center border border-border">{row.food}</td>
              <td className="p-2 text-center border border-border">{row.transport}</td>
              <td className="p-2 text-center border border-border">{row.education}</td>
              <td className="p-2 text-center border border-border">{row.leisure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const charts = [BarChartQ0, PieChartQ1, LineChartQ2, TableQ3]

export default function Task1Chart({ questionIndex }) {
  const Chart = charts[questionIndex]
  if (!Chart) return null
  return (
    <div className="bg-white rounded-lg border border-border p-4 mb-1" style={{ minWidth: 0 }}>
      <Chart />
    </div>
  )
}
