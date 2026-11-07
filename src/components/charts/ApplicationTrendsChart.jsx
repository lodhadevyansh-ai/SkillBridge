import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChevronRight, TrendingUp } from 'lucide-react'

// Custom tooltip
function CustomTrendsTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 dark:bg-[#11131F]/95 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[150px]">
        <div className="font-semibold text-slate-300 border-b border-slate-800/80 pb-1">
          {label}
        </div>
        {payload.map((item) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-slate-300">
                {item.name}
              </span>
            </div>
            <span className="font-bold text-white text-xs">{item.value} apps</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function ApplicationTrendsChart({
  data = [],
  month = 'October 2026',
  comparisonText = 'No historical application data recorded yet.',
}) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-12 px-4 text-center space-y-2.5 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl min-h-[220px]">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <TrendingUp className="w-4 h-4" />
        </div>
        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          No historical application data yet
        </p>
        <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
          Application volume trends will display here as candidates apply to your published roles.
        </p>
      </div>
    )
  }

  const chartData = data

  return (
    <div className="w-full space-y-4">
      {/* Top Legend & Month Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 shadow-2xs" />
            <span>This month</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-200 dark:bg-indigo-900/60" />
            <span>Last month</span>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-xs cursor-pointer"
        >
          <span>{month}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dual Bar Chart Container */}
      <div className="h-56 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barGap={4}
            barCategoryGap="24%"
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800/80"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              allowDecimals={false}
            />
            <Tooltip content={<CustomTrendsTooltip />} />
            <Bar
              dataKey="previous"
              name="Last month"
              fill="currentColor"
              className="text-indigo-200 dark:text-indigo-950"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="current"
              name="This month"
              fill="currentColor"
              className="text-indigo-600 dark:text-indigo-500"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
        {comparisonText}
      </div>
    </div>
  )
}
