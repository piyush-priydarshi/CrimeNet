import { Suspense, lazy } from 'react'
import {
  ArrowRight,
  Shield,
  Network,
  MapPin,
  TrendingUp,
  AlertTriangle,
  GitFork,
  FileText,
  Layers,
  Database,
  Cpu,
  Sparkles,
  Building2,
  Activity,
  CheckCircle2,
} from 'lucide-react'

const LandingHero3D = lazy(() => import('./LandingHero3D'))

export default function LandingPage({ onLaunchDashboard }) {
  return (
    <div className="min-h-screen bg-[#14120F] text-[#E6E2DA] font-sans selection:bg-[#D97706]/30 selection:text-[#FBBF24] flex flex-col">
      {/* 1. Header (Fixed 64px height, standard container) */}
      <header className="border-b border-[#322E27] bg-[#1C1A16]/95 backdrop-blur-md sticky top-0 z-40 h-16 shrink-0 flex items-center">
        <div className="page-container flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#D97706]/15 border border-[#D97706]/40 flex items-center justify-center text-[#F59E0B] shrink-0">
              <Network size={18} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#F5F3EF] tracking-tight">CrimeNet AI</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#24211C] border border-[#322E27] text-[#D97706]">
                MHA / NCRB
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-[#A8A29E] font-medium">
            <a href="#about" className="hover:text-[#F5F3EF] transition-colors">About</a>
            <a href="#workflow" className="hover:text-[#F5F3EF] transition-colors">Workflow</a>
            <a href="#capabilities" className="hover:text-[#F5F3EF] transition-colors">Capabilities</a>
          </nav>

          <button
            onClick={onLaunchDashboard}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-[#14120F] font-semibold text-xs transition-all shadow-sm group select-none shrink-0"
          >
            <span>Launch platform</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* 2. Hero Section (Controlled 2-Column Normal Flow Grid, No Text Overlap) */}
      <section className="border-b border-[#322E27] bg-gradient-to-b from-[#1C1A16] via-[#171512] to-[#14120F] py-16 sm:py-20 lg:py-24">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Eyebrow, Controlled Heading (32-40px), Description, CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#24211C] border border-[#322E27] text-[#D97706] text-xs font-mono w-fit">
                <Shield size={13} className="shrink-0" />
                <span>Multi-Agency Criminal Network Intelligence</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#F5F3EF] tracking-tight leading-[1.18]">
                Unmask the hidden architecture of organized crime.
              </h1>

              <p className="text-sm sm:text-base text-[#A8A29E] leading-relaxed max-w-xl">
                CrimeNet AI transforms fragmented investigative reports into connected intelligence graphs — exposing shadow coordinators, financial pipelines, and cross-jurisdictional syndicate nexuses.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={onLaunchDashboard}
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-[#14120F] font-bold text-sm transition-all shadow-md group"
                >
                  <span>Enter platform</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href="#about"
                  className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-lg bg-[#24211C] hover:bg-[#2C2822] border border-[#322E27] text-[#F5F3EF] font-medium text-sm transition-colors"
                >
                  <span>About this project</span>
                </a>
              </div>

              {/* Key Highlights row */}
              <div className="pt-4 border-t border-[#322E27]/60 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-mono text-[#D97706] font-bold">100% AUTOMATED</div>
                  <div className="text-xs text-[#78716C] mt-0.5">Entity Resolution</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-[#2DD4BF] font-bold">MULTI-AGENCY</div>
                  <div className="text-xs text-[#78716C] mt-0.5">Cross-Case Links</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-[#F59E0B] font-bold">ALGORITHMIC</div>
                  <div className="text-xs text-[#78716C] mt-0.5">Betweenness Scoring</div>
                </div>
              </div>
            </div>

            {/* Right Column: Controlled 3D Visualization Container (No Overlap) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="h-[380px] sm:h-[420px] lg:h-[440px] w-full rounded-2xl border border-[#322E27] bg-[#1C1A16] overflow-hidden relative shadow-2xl flex flex-col justify-between">
                {/* 3D Header Bar inside the card */}
                <div className="absolute top-0 inset-x-0 z-10 px-4 py-3 bg-[#1C1A16]/90 backdrop-blur-md border-b border-[#322E27] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={15} className="text-[#D97706]" />
                    <span className="text-xs font-mono font-bold text-[#F5F3EF]">TOPOLOGY PREVIEW</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#2DD4BF] bg-[#2DD4BF]/10 px-2 py-0.5 rounded border border-[#2DD4BF]/30 font-semibold">
                    INTERACTIVE 3D
                  </span>
                </div>

                {/* 3D Canvas Canvas Body */}
                <div className="w-full h-full pt-10 pb-12">
                  <Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center text-[#A8A29E] text-xs font-mono">
                      Initializing topology...
                    </div>
                  }>
                    <LandingHero3D />
                  </Suspense>
                </div>

                {/* 3D Footer Bar inside the card */}
                <div className="absolute bottom-0 inset-x-0 z-10 px-4 py-2.5 bg-[#1C1A16]/90 backdrop-blur-md border-t border-[#322E27] flex items-center justify-between text-[11px] text-[#A8A29E]">
                  <span className="truncate">Rotate & drag to examine syndicate cluster</span>
                  <span className="font-mono text-[#D97706] shrink-0 font-semibold">31 Links</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About / Problem / Solution (3 Equal Cards in Clean Grid) */}
      <section id="about" className="py-20 border-b border-[#322E27] bg-[#14120F]">
        <div className="page-container space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D97706]">
              About This Project
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F3EF] tracking-tight">
              Solving the crisis of siloed investigative intelligence
            </h2>
            <p className="text-sm sm:text-base text-[#A8A29E] leading-relaxed">
              Criminal syndicates operate across state boundaries without jurisdiction limits, while investigative units maintain isolated case files.
            </p>
          </div>

          {/* Three Equal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: The Problem */}
            <div className="p-6 rounded-xl bg-[#1C1A16] border border-[#322E27] flex flex-col justify-between shadow-sm space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#D97706]/15 text-[#F59E0B] border border-[#D97706]/30 flex items-center justify-center">
                  <Database size={20} />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#F5F3EF]">The Problem</h3>
                <p className="text-sm text-[#A8A29E] leading-relaxed">
                  FIRs in Mumbai, Hawala transfer ledgers in Delhi, and burner phone intercepts in Hyderabad remain disconnected in legacy records management databases.
                </p>
              </div>
              <div className="pt-4 border-t border-[#322E27]/60 text-xs font-mono text-[#EF4444] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                <span>Information fragmentation</span>
              </div>
            </div>

            {/* Card 2: The AI Solution */}
            <div className="p-6 rounded-xl bg-[#1C1A16] border border-[#322E27] flex flex-col justify-between shadow-sm space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#2DD4BF]/15 text-[#2DD4BF] border border-[#2DD4BF]/30 flex items-center justify-center">
                  <Cpu size={20} />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#F5F3EF]">The AI Solution</h3>
                <p className="text-sm text-[#A8A29E] leading-relaxed">
                  Automated entity resolution links co-occurring persons, vehicles, phone numbers, and shell firms across cases, computing centrality scores to highlight leaders.
                </p>
              </div>
              <div className="pt-4 border-t border-[#322E27]/60 text-xs font-mono text-[#2DD4BF] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
                <span>Graph neural algorithms</span>
              </div>
            </div>

            {/* Card 3: Built for Law Enforcement */}
            <div className="p-6 rounded-xl bg-[#1C1A16] border border-[#322E27] flex flex-col justify-between shadow-sm space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#D97706]/15 text-[#F59E0B] border border-[#D97706]/30 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#F5F3EF]">Built for Law Enforcement</h3>
                <p className="text-sm text-[#A8A29E] leading-relaxed">
                  Tailored to the operational standards of the <span className="text-[#F5F3EF] font-semibold">Ministry of Home Affairs (MHA)</span> and <span className="text-[#F5F3EF] font-semibold">NCRB</span> for inter-state criminal syndicate disruption.
                </p>
              </div>
              <div className="pt-4 border-t border-[#322E27]/60 text-xs font-mono text-[#D97706] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                <span>Inter-agency protocol</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Operational Workflow (4 Equal Cards in Clean Grid) */}
      <section id="workflow" className="py-20 border-b border-[#322E27] bg-[#181613]">
        <div className="page-container space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D97706]">
              Operational Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F3EF] tracking-tight">
              From raw incident reports to syndicate takedowns
            </h2>
            <p className="text-sm text-[#A8A29E]">
              Four structured processing stages transform unstructured text into verified investigative leads.
            </p>
          </div>

          {/* Four Equal Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Ingest reports',
                desc: 'Unstructured incident logs, wire intercepts, FIR records, and field tips across multiple police jurisdictions.',
                icon: Database,
              },
              {
                step: '02',
                title: 'Extract entities',
                desc: 'NLP Named Entity Recognition extracts suspects, locations, organizations, phone numbers, and vehicle plates.',
                icon: Cpu,
              },
              {
                step: '03',
                title: 'Build network',
                desc: 'Entities are connected through weighted multi-case co-occurrences, merging duplicate actors into unified nodes.',
                icon: Network,
              },
              {
                step: '04',
                title: 'Surface insights',
                desc: 'Graph centrality algorithms highlight shadow coordinators, suspicious patterns, and actionable dossiers.',
                icon: Sparkles,
              },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-[#1C1A16] border border-[#322E27] hover:border-[#D97706]/50 transition-all flex flex-col justify-between shadow-sm space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#F59E0B]">
                        STEP {item.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[#24211C] border border-[#322E27] text-[#F59E0B] flex items-center justify-center">
                        <Icon size={16} />
                      </div>
                    </div>
                    <h3 className="font-bold text-base text-[#F5F3EF]">{item.title}</h3>
                    <p className="text-sm text-[#A8A29E] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. Intelligence Capabilities (3-Column Feature Grid) */}
      <section id="capabilities" className="py-20 border-b border-[#322E27] bg-[#14120F]">
        <div className="page-container space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#D97706]">
              Intelligence Capabilities
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F3EF] tracking-tight">
              Enterprise analysis tools built for investigative cells
            </h2>
            <p className="text-sm text-[#A8A29E]">
              Precision analytics and interactive visualizations tailored for crime intelligence desks.
            </p>
          </div>

          {/* 6 Equal Cards in 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: '3D Network Graph',
                desc: 'Explore interactive force-directed topologies with cluster repulsion, camera fly-to, and halo-highlighted key influencers.',
                icon: Layers,
                color: 'text-[#D97706]',
                tag: 'Force-Directed 3D',
              },
              {
                title: 'Geospatial Hotspots',
                desc: 'Radar pulse map of India identifying active criminal sectors, regional case density, and linked operatives.',
                icon: MapPin,
                color: 'text-[#2DD4BF]',
                tag: 'Multi-Jurisdiction',
              },
              {
                title: 'Key Influencer Scoring',
                desc: 'Algorithmic Betweenness Centrality, PageRank, and Degree scoring uncover the quiet shadow coordinators of syndicates.',
                icon: TrendingUp,
                color: 'text-[#D97706]',
                tag: 'Graph Analytics',
              },
              {
                title: 'Suspicious Pattern Alerts',
                desc: 'Real-time rule engines flag shared burner phones across suspects, multi-case transport, and recurring front organizations.',
                icon: AlertTriangle,
                color: 'text-[#EF4444]',
                tag: 'Rule Detectors',
              },
              {
                title: 'Link Tracer',
                desc: 'Pairwise path resolution evaluates shortest degrees of separation and shared bridges between any two selected suspects.',
                icon: GitFork,
                color: 'text-[#2DD4BF]',
                tag: 'Path Resolution',
              },
              {
                title: 'Auto-Generated Case Briefs',
                desc: 'Generate executive investigator summaries with critical findings, chronological case progression, and JSON dossier export.',
                icon: FileText,
                color: 'text-[#D97706]',
                tag: 'Automated Briefs',
              },
            ].map((feat, i) => {
              const Icon = feat.icon
              return (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-[#1C1A16] border border-[#322E27] hover:border-[#D97706]/40 transition-all flex flex-col justify-between shadow-sm space-y-4"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-[#24211C] border border-[#322E27] flex items-center justify-center ${feat.color}`}>
                        <Icon size={20} />
                      </div>
                      <span className="text-xs font-mono text-[#A8A29E] bg-[#24211C] px-2.5 py-1 rounded-md border border-[#322E27]">
                        {feat.tag}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#F5F3EF] mb-2">{feat.title}</h3>
                      <p className="text-sm text-[#A8A29E] leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#322E27]/60 flex items-center text-xs font-semibold text-[#D97706]">
                    <span>Command ready</span>
                    <ArrowRight size={13} className="ml-1.5" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* CTA Banner inside page-container */}
          <div className="p-8 sm:p-10 rounded-2xl bg-[#1C1A16] border border-[#322E27] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-lg">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-[#F5F3EF]">Ready to examine the intelligence network?</h3>
              <p className="text-sm text-[#A8A29E]">Load synthetic multi-case datasets and evaluate syndicate connections in real time.</p>
            </div>
            <button
              onClick={onLaunchDashboard}
              className="h-11 px-8 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-[#14120F] font-bold text-sm transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
            >
              <span>Launch dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer (Standard Container) */}
      <footer className="border-t border-[#322E27] py-8 bg-[#100E0C] mt-auto">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#D97706]" />
            <span className="text-[#E6E2DA] font-medium">CrimeNet AI · Law Enforcement Intelligence Decision Support</span>
          </div>
          <div className="font-mono text-[11px] text-[#A8A29E]">
            Smart India Hackathon · MHA / NCRB Standard · Synthetic Demonstration Data
          </div>
        </div>
      </footer>
    </div>
  )
}
