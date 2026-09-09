import { useState, useEffect, Suspense, lazy } from 'react'
import { getGeo, simulateTip, getSampleData, processReports } from './api'
import { Btn, Spinner } from './components/ui'
import Dashboard from './components/Dashboard'
import InfluencerPanel from './components/InfluencerPanel'
import AlertPanel from './components/AlertPanel'
import QueryPanel from './components/QueryPanel'
import BriefPanel from './components/BriefPanel'
import HowItWorks from './components/HowItWorks'
import Ticker from './components/Ticker'
import GeoMap from './components/GeoMap'
import LandingPage from './components/LandingPage'
import IntakePage from './components/IntakePage'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import {
  Radio,
  Layers,
  MapPin,
  TrendingUp,
  AlertTriangle,
  GitFork,
  FileText,
  ChevronLeft,
  Network,
  RotateCcw,
  LogOut,
  User,
} from 'lucide-react'

const NetworkGraph = lazy(() => import('./components/NetworkGraph'))

const TABS = [
  { id: 'network', label: 'Network graph', icon: Layers },
  { id: 'geospatial', label: 'Geospatial hotspots', icon: MapPin },
  { id: 'influencers', label: 'Key influencers', icon: TrendingUp },
  { id: 'alerts', label: 'Suspicious alerts', icon: AlertTriangle },
  { id: 'query', label: 'Link tracer', icon: GitFork },
  { id: 'brief', label: 'Investigator dossier', icon: FileText },
]

export default function App() {
  // Auth state — check localStorage for existing session
  const [user, setUser] = useState(() => {
    try {
      const session = localStorage.getItem('crimenet_session')
      return session ? JSON.parse(session) : null
    } catch { return null }
  })
  const [authPage, setAuthPage] = useState('login') // 'login' | 'signup'

  const [route, setRoute] = useState(() => {
    const p = window.location.pathname
    if (['/dashboard', '/intake', '/login', '/signup'].includes(p)) return p
    return '/'
  })
  const [tab, setTab] = useState('network')
  const [graphData, setGraphData] = useState(null)
  const [geoData, setGeoData] = useState([])
  const [stats, setStats] = useState(null)
  const [processed, setProcessed] = useState(false)
  const [simLoading, setSimLoading] = useState(false)
  const [simMsg, setSimMsg] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Listen to browser history forward/back
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname
      setRoute(['/dashboard', '/intake', '/login', '/signup'].includes(p) ? p : '/')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Auto-populate dashboard if accessed directly at /dashboard
  useEffect(() => {
    if (route === '/dashboard' && !processed && !graphData) {
      getSampleData()
        .then(d => {
          if (d?.reports?.length) {
            return processReports(d.reports)
          }
        })
        .then(res => {
          if (res) handleProcessed(res)
        })
        .catch(console.error)
    }
  }, [route, processed, graphData])

  const navigateTo = (path) => {
    window.history.pushState({}, '', path)
    setRoute(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleProcessed = (result) => {
    setGraphData(result.graph)
    setProcessed(true)
    setRefreshKey(k => k + 1)
    computeStats(result)
    getGeo().then(d => setGeoData(d.locations || []))
  }

  const computeStats = (result) => {
    const g = result.graph
    const exts = result.extractions || []
    const locSet = new Set()
    exts.forEach(e => e.locations?.forEach(l => locSet.add(l)))
    const communities = new Set((g?.nodes || []).map(n => n.community))
    setStats({
      reports: result.reports_processed,
      entities: g?.nodes?.length ?? 0,
      relationships: g?.links?.length ?? 0,
      flagged: (g?.nodes || []).filter(n => (n.betweenness || 0) > 0.08 || (n.reports || []).length > 1).length,
      locations: locSet.size,
      clusters: communities.size,
    })
  }

  const runSimulation = async () => {
    setSimLoading(true)
    setSimMsg(null)
    try {
      const result = await simulateTip()
      setGraphData(result.graph)
      setSimMsg(`Tip-off received: ${result.tip.title} — ${result.extraction.persons?.length || 0} suspects, ${result.extraction.phones?.length || 0} phones ingested into graph.`)
      setRefreshKey(k => k + 1)
      setStats(s => s ? ({
        ...s,
        entities: result.graph?.nodes?.length ?? s.entities,
        relationships: result.graph?.links?.length ?? s.relationships,
      }) : s)
    } finally {
      setSimLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('crimenet_session')
    setUser(null)
    setAuthPage('login')
    navigateTo('/')
  }

  const handleAuthSuccess = (u) => {
    setUser(u)
    navigateTo('/intake')
  }

  // 1. Landing Page — always public
  if (route === '/') {
    return <LandingPage onLaunchDashboard={() => navigateTo(user ? '/intake' : '/login')} />
  }

  // 2. Login page
  if (route === '/login') {
    if (user) { navigateTo('/intake'); return null }
    return (
      <LoginPage
        onLogin={handleAuthSuccess}
        onGoToSignup={() => navigateTo('/signup')}
        onGoHome={() => navigateTo('/')}
      />
    )
  }

  // 3. Signup page
  if (route === '/signup') {
    if (user) { navigateTo('/intake'); return null }
    return (
      <SignupPage
        onSignup={handleAuthSuccess}
        onGoToLogin={() => navigateTo('/login')}
        onGoHome={() => navigateTo('/')}
      />
    )
  }

  // 4. Auth-gated: Intake
  if (route === '/intake') {
    if (!user) { navigateTo('/login'); return null }
    return <IntakePage onNavigate={navigateTo} onProcessed={handleProcessed} />
  }

  // 5. Auth-gated: Dashboard (falls through below)
  if (!user) { navigateTo('/login'); return null }

  // 3. Render Main Results Dashboard Workspace at "/dashboard"
  return (
    <div className="min-h-screen bg-[#14120F] text-[#E6E2DA] flex flex-col font-sans selection:bg-[#D97706]/30 selection:text-[#FBBF24]">
      {/* App Header with fixed 64px height and standard container */}
      {/* App Header with fixed 64px height and standard container */}
      <header className="border-b border-[#322E27] bg-[#1C1A16]/95 backdrop-blur-md sticky top-0 z-30 shadow-sm h-16 shrink-0 flex items-center">
        <div className="page-container flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Return to landing page button */}
            <button
              onClick={() => navigateTo('/')}
              title="Return to Home"
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-[#322E27] bg-[#24211C] text-xs font-medium text-[#A8A29E] hover:text-[#F5F3EF] hover:bg-[#2C2822] hover:border-[#443E35] transition-all shadow-sm shrink-0"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Home</span>
            </button>

            <div className="h-4 w-px bg-[#322E27] hidden sm:block" />

            <div
              onClick={() => navigateTo('/')}
              className="flex items-center gap-3 cursor-pointer group min-w-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[#D97706]/15 border border-[#D97706]/40 flex items-center justify-center text-[#F59E0B] shrink-0 group-hover:border-[#D97706] transition-colors shadow-sm">
                <Network size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-white flex items-center gap-2.5">
                  <span className="truncate text-white">CrimeNet</span>
                  <span className="text-[10px] font-mono font-bold bg-[#24211C] text-[#D97706] border border-[#322E27] px-2 py-0.5 rounded uppercase shrink-0">
                    MHA / NCRB
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Load different data button routing back to /intake */}
            <button
              onClick={() => navigateTo('/intake')}
              title="Load different intelligence data"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#322E27] bg-[#24211C] text-[#E6E2DA] hover:bg-[#2C2822] hover:border-[#443E35] hover:text-white text-xs font-medium transition-all shadow-sm"
            >
              <RotateCcw size={14} className="text-[#D97706]" />
              <span className="hidden sm:inline">Load different data</span>
              <span className="sm:hidden">Intake</span>
            </button>

            {processed && (
              <button
                type="button"
                onClick={runSimulation}
                disabled={simLoading}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#EF4444]/15 hover:bg-[#EF4444]/25 border border-[#EF4444]/40 text-[#EF4444] text-xs font-semibold transition-all shadow-sm disabled:opacity-40 select-none"
              >
                <Radio size={14} className={simLoading ? 'animate-spin' : 'animate-pulse'} />
                <span className="hidden sm:inline">{simLoading ? 'Ingesting...' : 'Simulate tip-off'}</span>
                <span className="sm:hidden">Simulate</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-[#1C1A16] border border-[#322E27] px-3.5 h-10 rounded-lg shadow-sm">
              <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse" />
              <span className="text-xs font-mono text-[#E6E2DA] font-semibold">LIVE INTEL</span>
            </div>

            {/* User badge + Logout */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 bg-[#24211C] border border-[#322E27] px-3 h-10 rounded-lg">
                  <User size={14} className="text-[#D97706]" />
                  <span className="text-xs text-[#E6E2DA] font-medium truncate max-w-[120px]">{user.name || user.caseId}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-[#322E27] bg-[#24211C] text-[#A8A29E] hover:text-[#EF4444] hover:bg-[#EF4444]/10 hover:border-[#EF4444]/30 text-xs font-medium transition-all shadow-sm"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Intelligence ticker */}
      <Ticker />

      {/* Alert toast for simulated tip */}
      {simMsg && (
        <div className="page-container pt-4">
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-[#EF4444] shadow-md">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle size={15} className="text-[#EF4444] shrink-0" />
              <span className="truncate">{simMsg}</span>
            </div>
            <button
              onClick={() => setSimMsg(null)}
              className="text-[#A8A29E] hover:text-white ml-4 text-sm font-bold shrink-0 p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Main Container (1440px max-width, standard page padding) */}
      <main className="flex-1 page-container py-8 sm:py-10 flex flex-col gap-8">
        {/* Stat Cards Grid (6 equal cards) */}
        <Dashboard stats={stats} />

        {/* Full-Width Visualization & Analysis Tabs Panel */}
        <div className="w-full flex flex-col bg-[#1C1A16] border border-[#322E27] rounded-2xl overflow-hidden shadow-sm">
          {/* Tab Navigation Bar — Standard 40px height buttons, clear icons + labels, amber active indicator */}
          <div className="p-2.5 bg-[#181613] border-b border-[#322E27] overflow-x-auto">
            <nav className="flex items-center gap-2.5 min-w-max">
              {TABS.map(t => {
                const Icon = t.icon
                const isActive = tab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`h-10 px-4 sm:px-5 text-xs sm:text-sm font-sans rounded-lg transition-all duration-150 flex items-center gap-2 whitespace-nowrap shadow-sm select-none ${
                      isActive
                        ? 'bg-[#D97706] text-[#14120F] font-bold border border-[#D97706] shadow-sm'
                        : 'bg-[#1C1A16] text-[#A8A29E] hover:text-white hover:bg-[#24211C] border border-[#322E27]'
                    }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? 'text-[#14120F]' : 'text-[#D97706]'}
                    />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Viewport with defined height (620px) */}
          <div className="min-h-[620px] relative overflow-hidden bg-[#14120F]">
            {tab === 'network' && (
              <div className="h-[620px] w-full relative">
                <Suspense fallback={<Spinner />}>
                  <NetworkGraph graphData={graphData} />
                </Suspense>
              </div>
            )}
            {tab === 'geospatial' && (
              <div className="h-[620px] w-full relative">
                <GeoMap locations={geoData} />
              </div>
            )}
            {tab === 'influencers' && (
              <div className="p-5 sm:p-6 min-h-[620px] overflow-auto">
                <InfluencerPanel refresh={refreshKey} />
              </div>
            )}
            {tab === 'alerts' && (
              <div className="p-5 sm:p-6 min-h-[620px] overflow-auto">
                <AlertPanel refresh={refreshKey} />
              </div>
            )}
            {tab === 'query' && (
              <div className="p-5 sm:p-6 min-h-[620px] overflow-auto">
                <QueryPanel enabled={processed || !!graphData} />
              </div>
            )}
            {tab === 'brief' && (
              <div className="p-5 sm:p-6 min-h-[620px] overflow-auto">
                <BriefPanel enabled={processed || !!graphData} />
              </div>
            )}
          </div>
        </div>

        {/* How it works collapsible section */}
        <HowItWorks />
      </main>

      {/* Footer in page-container */}
      <footer className="border-t border-[#322E27] py-6 text-center text-xs text-[#78716C] font-sans bg-[#181613]">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>CrimeNet · Multi-Agency Syndicate Intelligence Platform</span>
          <span className="font-mono text-[11px] text-[#A8A29E]">Specification: Ministry of Home Affairs / NCRB</span>
        </div>
      </footer>
    </div>
  )
}
