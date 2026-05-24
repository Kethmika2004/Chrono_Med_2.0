import { Outlet } from 'react-router-dom'
import { Activity } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 p-4 md:p-8 font-sans">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0D7A6B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      
      <div className="w-full max-w-5xl bg-slate-900/40 backdrop-blur-xl border border-teal-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side: Branding Banner */}
        <div className="md:w-1/2 bg-gradient-to-br from-teal-900 to-teal-950 p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center space-x-2 relative z-10">
            <Activity className="h-8 w-8 text-emerald-400 animate-pulse" />
            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">ChronoMed</span>
          </div>

          <div className="my-8 relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
              Your Time. <br/>
              Your Health. <br/>
              <span className="text-amber-400">Perfected.</span>
            </h1>
            <p className="text-teal-100/80 text-sm leading-relaxed max-w-sm">
              Experience the next generation medical queue and channeling platform. Empowering patients, doctors, and hospitals with real-time updates and seamless coordination.
            </p>
          </div>

          <div className="text-xs text-teal-300/50 relative z-10">
            &copy; {new Date().getFullYear()} ChronoMed. All rights reserved.
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-slate-950/80 border-t md:border-t-0 md:border-l border-teal-500/10">
          <div className="w-full max-w-md mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}