import { useState } from 'react'
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { cn } from '../../utils/cn'

export function SkillMatchWidget({ skillMatch, className }) {
  const [showFormula, setShowFormula] = useState(false)

  if (!skillMatch) return null

  const {
    matchScore = 0,
    matchLevel = 'Moderate Match',
    matchingSkills = [],
    missingSkills = [],
    suggestedImprovements = [],
    disclaimer = '',
  } = skillMatch

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 50) return 'text-indigo-600 dark:text-indigo-400'
    return 'text-amber-600 dark:text-amber-400'
  }

  const getProgressBarColor = (score) => {
    if (score >= 75) return 'bg-emerald-500'
    if (score >= 50) return 'bg-indigo-600'
    return 'bg-amber-500'
  }

  return (
    <Card className={cn('p-5 sm:p-6 space-y-5 border-slate-200/90 dark:border-[#282D4A]', className)}>
      {/* Header & Score Dial */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Skill Compatibility Analysis
            </h3>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium border-slate-300 dark:border-slate-700">
              Rule-Based Matcher
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deterministic keyword overlap between your profile and this role.
          </p>
        </div>

        {/* Score Badge */}
        <div className="text-right shrink-0">
          <div className={cn('text-2xl sm:text-3xl font-extrabold tracking-tight', getScoreColor(matchScore))}>
            {matchScore}%
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            {matchLevel}
          </span>
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="space-y-1.5">
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', getProgressBarColor(matchScore))}
            style={{ width: `${Math.max(5, matchScore)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{matchingSkills.length} of {matchingSkills.length + missingSkills.length} required skills matched</span>
          <button
            type="button"
            onClick={() => setShowFormula((prev) => !prev)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3" />
            {showFormula ? 'Hide calculation' : 'How it works'}
          </button>
        </div>
      </div>

      {/* Transparent Formula Explainer */}
      {showFormula && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1 animate-in fade-in duration-150">
          <div className="font-semibold text-slate-900 dark:text-white">
            Transparent Matching Formula:
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px] bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
            Match % = ({matchingSkills.length} Matching Skills / {matchingSkills.length + missingSkills.length} Total Required Skills) × 100 = {matchScore}%
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            Skill aliases are normalized before comparison (e.g. React.js = React, TS = TypeScript).
          </p>
        </div>
      )}

      {/* 1. Matching Skills */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Matching Skills ({matchingSkills.length})</span>
        </div>
        {matchingSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {matchingSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
              >
                <CheckCircle2 className="w-3 h-3" />
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            None of the required skills currently match your profile keywords.
          </p>
        )}
      </div>

      {/* 2. Missing Skills */}
      {missingSkills.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Missing Skills for this Role ({missingSkills.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/50"
              >
                • {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 3. Suggested Skills to Improve */}
      {suggestedImprovements.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            <span>Suggested Skills to Improve Readiness</span>
          </div>
          <div className="space-y-2">
            {suggestedImprovements.map((sug) => (
              <div
                key={sug.skill}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {sug.skill}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    ~{sug.estHours}h practice
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {sug.tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Non-AI & Accuracy Disclaimer */}
      <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
        <strong className="text-slate-700 dark:text-slate-300 block mb-0.5">
          ℹ️ Match Methodology Disclaimer:
        </strong>
        {disclaimer ||
          'This compatibility percentage is an algorithmic estimate based on exact keyword comparison between your profile and employer requirements. It does NOT use artificial intelligence and does not guarantee interview selection or job placement.'}
      </div>
    </Card>
  )
}
