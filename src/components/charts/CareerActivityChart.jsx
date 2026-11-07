import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChevronDown } from 'lucide-react'

// Custom tooltip matching Figma styling
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-[#11131F]/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[140px]">
        <div className="font-semibold text-slate-300 border-b border-slate-800/80 pb-1">
          {label}
        </div>
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-slate-300 capitalize">
                {item.name}
              </span>
            </div>
            <span className="font-bold text-white text-xs">{item.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function CareerActivityChart({ data = [] }) {
  const [selectedMonth, setSelectedMonth] = useState('October 2026')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const months = ['October 2026', 'September 2026', 'August 2026']

  return (
    <div className="w-full">
      {/* Top Legend & Month Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-2xs" />
            <span>Applications</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>Profile views</span>
          </div>
        </div>

        {/* Month Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer"
          >
            <span>{selectedMonth}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#161928] border border-slate-200 dark:border-[#282D4A] rounded-xl shadow-lg py-1 z-20 text-xs">
              {months.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setSelectedMonth(m)
                    setIsDropdownOpen(false)
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    m === selectedMonth
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recharts Area Chart Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800/60"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              domain={[0, 45]}
              ticks={[0, 10, 20, 30, 40]}
            />
            <Tooltip content={<CustomChartTooltip />} />
            {/* Profile Views line (Gray) */}
            <Area
              type="monotone"
              dataKey="profileViews"
              name="Profile views"
              stroke="#94A3B8"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorViews)"
            />
            {/* Applications line (Purple / Indigo) */}
            <Area
              type="monotone"
              dataKey="applications"
              name="Applications"
              stroke="#4F46E5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorApps)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

