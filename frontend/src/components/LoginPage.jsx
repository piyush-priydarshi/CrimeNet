import { useState } from 'react'
import { Network, LogIn, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage({ onLogin, onGoToSignup }) {
  const [caseId, setCaseId] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!caseId.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)

    // Simulate a brief loading state for demo feel
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('crimenet_users') || '[]')
      const user = users.find(u => u.caseId === caseId.trim() && u.password === password)

      if (user) {
        localStorage.setItem('crimenet_session', JSON.stringify({ caseId: user.caseId, name: user.name, loggedInAt: Date.now() }))
        onLogin(user)
      } else {
        setError('Invalid Case ID or password. Please try again.')
      }
      setLoading(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#14120F] flex flex-col font-sans selection:bg-[#D97706]/30 selection:text-[#FBBF24]">
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(217,119,6,0.04) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-[#D97706]/[0.03] blur-[120px]" />
      </div>

      {/* Header */}
      <header className="border-b border-[#322E27] bg-[#1C1A16]/95 backdrop-blur-md h-16 shrink-0 flex items-center relative z-10">
        <div className="page-container flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#D97706]/15 border border-[#D97706]/40 flex items-center justify-center text-[#F59E0B] shrink-0">
            <Network size={19} />
          </div>
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-base text-white tracking-tight">CrimeNet</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#24211C] border border-[#322E27] text-[#D97706]">
              MHA / NCRB
            </span>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-[#1C1A16] border border-[#322E27] rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black/40">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-[#D97706]/10 border border-[#D97706]/30 flex items-center justify-center text-[#F59E0B]">
                <LogIn size={26} />
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-sm text-[#A8A29E]">Sign in to access the CrimeNet Intelligence Platform</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Case ID */}
              <div className="flex flex-col gap-2">
                <label htmlFor="caseId" className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">
                  Case ID
                </label>
                <input
                  id="caseId"
                  type="text"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="e.g. CASE-2026-001"
                  autoComplete="username"
                  className="h-11 px-4 rounded-lg bg-[#14120F] border border-[#322E27] text-sm text-[#F5F3EF] placeholder-[#78716C] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition-all"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-xs font-semibold text-[#A8A29E] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full h-11 px-4 pr-11 rounded-lg bg-[#14120F] border border-[#322E27] text-sm text-[#F5F3EF] placeholder-[#78716C] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706]/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#A8A29E] transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="h-11 mt-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-[#14120F] font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 select-none group"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#14120F]/30 border-t-[#14120F] rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#322E27]" />
              <span className="text-[11px] text-[#78716C] font-medium">OR</span>
              <div className="flex-1 h-px bg-[#322E27]" />
            </div>

            {/* Sign Up link */}
            <p className="text-center text-sm text-[#A8A29E]">
              Don't have an account?{' '}
              <button
                onClick={onGoToSignup}
                className="text-[#D97706] hover:text-[#FBBF24] font-semibold transition-colors"
              >
                Create Account
              </button>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-center text-[11px] text-[#78716C] mt-6">
            Ministry of Home Affairs · National Crime Records Bureau
          </p>
        </div>
      </main>
    </div>
  )
}
