import { Outlet, Link } from 'react-router-dom'
import { Share2 } from 'lucide-react'
import { ThemeToggle } from '../components/ui/ThemeToggle'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0D14] flex flex-col font-sans transition-colors">
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left Hero Pane (Deep Navy Blue matching Figma Screenshot 001351) */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#16192E] p-10 xl:p-14 text-white flex-col justify-between relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-white no-underline relative z-10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <Share2 className="w-4 h-4 transform rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight">SkillBridge</span>
          </Link>

          {/* Main Hero Copy & Image Card */}
          <div className="my-auto py-10 relative z-10 max-w-lg">
            <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase block mb-3">
              A Little Ambition. A World of Possibility.
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Your first step. <br />
              Your next big thing.
            </h1>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Discover work that excites you, build skills that matter, and turn your potential into possibility.
            </p>

            {/* Visual Card representation */}
            <div className="mt-8 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-xs p-1">
              <div className="h-56 bg-gradient-to-tr from-slate-800 to-indigo-950/80 rounded-xl flex items-center justify-center p-6 text-center">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 mx-auto flex items-center justify-center mb-3">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Connecting Talent with Opportunity</h4>
                  <p className="text-xs text-slate-400 mt-1">Verified internships, fair stipends & modern recruitment.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="text-xs text-slate-500 relative z-10">
            © 2026 SkillBridge. All rights reserved.
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto relative">
          <div className="flex justify-between items-center lg:justify-end mb-6">
            <Link to="/" className="lg:hidden flex items-center gap-2 text-slate-900 dark:text-white no-underline">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <Share2 className="w-3.5 h-3.5 transform rotate-45" />
              </div>
              <span className="font-bold text-base">SkillBridge</span>
            </Link>
            <ThemeToggle />
          </div>
          <div className="w-full max-w-md mx-auto my-auto">
            <Outlet />
          </div>
          <div className="text-center text-xs text-slate-400 mt-6 lg:hidden">
            © 2026 SkillBridge. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}

