import { useState, useEffect } from 'react'
import { Panel, Btn, Spinner } from './ui'
import { getBrief } from '../api'
import { FileText, Download, Calendar, Copy, Check, ShieldAlert, Sparkles, UserCheck, AlertTriangle } from 'lucide-react'

export default function BriefPanel({ enabled }) {
  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dossier')
  const [copied, setCopied] = useState(false)

  // Automatically generate brief on load if enabled and not generated yet
  useEffect(() => {
    if (enabled && !brief && !loading) {
      generate()
    }
  }, [enabled])

  const generate = async () => {
    setLoading(true)
    try {
      const data = await getBrief()
      setBrief(data)
    } finally {
      setLoading(false)
    }
  }

  const exportJson = () => {
    if (!brief) return
    const blob = new Blob([JSON.stringify(brief, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `crimenet_dossier_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copySummary = () => {
    if (!brief) return
    const text = `CRIMENET - INTELLIGENCE BRIEF\n\nGenerated: ${brief.generated_at}\n\nSUMMARY:\n${brief.summary}\n\nKEY FINDING:\n${brief.key_finding}\n\nTOP SUSPECTS:\n${(brief.top_suspects || []).join('\n')}\n\nRECOMMENDATIONS:\n${brief.recommendation}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Panel
      title="Investigator dossier & chronological timeline"
      icon={<FileText size={16} />}
      className="w-full h-full"
      action={
        <div className="flex items-center gap-2 flex-wrap">
          <Btn onClick={generate} variant="primary" size="sm" disabled={!enabled || loading}>
            <FileText size={14} />
            <span>{brief ? 'Regenerate dossier' : 'Generate dossier'}</span>
          </Btn>
          {brief && (
            <>
              <Btn onClick={exportJson} variant="secondary" size="sm" title="Download JSON dossier">
                <Download size={14} />
                <span>JSON</span>
              </Btn>
              <Btn onClick={copySummary} variant="secondary" size="sm" title="Copy summary text">
                {copied ? <Check size={14} className="text-[#2DD4BF]" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy brief'}</span>
              </Btn>
            </>
          )}
        </div>
      }
    >
      {loading && <Spinner />}

      {!brief && !loading && (
        <div className="py-20 px-6 flex flex-col items-center justify-center text-center space-y-3 font-sans">
          <div className="w-12 h-12 rounded-xl bg-[#24211C] border border-[#322E27] flex items-center justify-center text-[#A8A29E] shadow-sm">
            <FileText size={24} className="text-[#D97706]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[#F5F3EF]">No intelligence dossier generated</h4>
            <p className="text-sm text-[#A8A29E] max-w-md leading-relaxed">
              Click &ldquo;Generate dossier&rdquo; to compile an automated strategic summary with threat findings and case progression.
            </p>
          </div>
          <div className="pt-2">
            <Btn onClick={generate} variant="primary" size="md">
              <Sparkles size={15} />
              <span>Generate intelligence dossier now</span>
            </Btn>
          </div>
        </div>
      )}

      {brief && !loading && (
        <div className="space-y-6 animate-fade-in w-full">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#322E27] pb-4">
            <div className="space-y-1">
              <div className="font-sans text-base sm:text-lg font-bold text-[#F59E0B]">{brief.title}</div>
              <div className="font-mono text-xs text-[#78716C]">Assessment timestamp: {brief.generated_at} · Law Enforcement Intelligence Division</div>
            </div>

            {/* Standard Tab Switchers */}
            <div className="flex items-center gap-1.5 p-1 bg-[#24211C] rounded-lg border border-[#322E27] shrink-0 h-10">
              <button
                onClick={() => setActiveTab('dossier')}
                className={`h-8 px-3.5 text-xs font-sans rounded-md transition-all flex items-center gap-2 ${
                  activeTab === 'dossier'
                    ? 'bg-[#D97706] text-[#14120F] font-bold shadow-sm'
                    : 'text-[#A8A29E] hover:text-[#F5F3EF]'
                }`}
              >
                <FileText size={14} />
                <span>Executive Dossier</span>
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`h-8 px-3.5 text-xs font-sans rounded-md transition-all flex items-center gap-2 ${
                  activeTab === 'timeline'
                    ? 'bg-[#D97706] text-[#14120F] font-bold shadow-sm'
                    : 'text-[#A8A29E] hover:text-[#F5F3EF]'
                }`}
              >
                <Calendar size={14} />
                <span>Case Timeline ({brief.timeline?.length || 0})</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Dossier View — 2-Column Grid */}
          {activeTab === 'dossier' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
              {/* Left Column (5 of 12 cols): Threat Linkage, Suspects, Directives */}
              <div className="lg:col-span-5 space-y-5">
                {/* Critical Threat Linkage */}
                <div className="p-5 sm:p-6 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#EF4444] uppercase tracking-wider">
                    <ShieldAlert size={15} />
                    <span>Critical Threat Linkage</span>
                  </div>
                  <p className="text-sm sm:text-base text-[#EF4444] leading-relaxed font-semibold">
                    {brief.key_finding}
                  </p>
                </div>

                {/* High-Centrality Entities */}
                <div className="p-5 sm:p-6 bg-[#24211C] border border-[#322E27] rounded-xl space-y-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D97706] uppercase tracking-wider">
                    <UserCheck size={15} />
                    <span>High-Centrality Entities of Interest</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {brief.top_suspects?.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 p-3 bg-[#1C1A16] rounded-lg border border-[#322E27] shadow-sm"
                      >
                        <span className="font-mono text-xs font-bold text-[#D97706] bg-[#24211C] w-6 h-6 rounded border border-[#322E27] flex items-center justify-center shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-bold text-[#F5F3EF] truncate">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Directives */}
                <div className="p-5 sm:p-6 bg-[#D97706]/10 border border-[#D97706]/40 rounded-xl space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F59E0B] uppercase tracking-wider">
                    <Sparkles size={15} />
                    <span>Actionable Directives</span>
                  </div>
                  <p className="text-sm text-[#FBBF24] leading-relaxed font-medium">
                    {brief.recommendation}
                  </p>
                </div>
              </div>

              {/* Right Column (7 of 12 cols): Summary & Operational Alerts */}
              <div className="lg:col-span-7 space-y-5">
                {/* Strategic Summary */}
                <div className="p-5 sm:p-6 bg-[#24211C] border border-[#322E27] rounded-xl space-y-3 shadow-sm">
                  <div className="text-xs font-mono font-bold text-[#A8A29E] uppercase tracking-wider">
                    Executive Strategic Summary
                  </div>
                  <p className="text-sm sm:text-base text-[#E6E2DA] leading-relaxed font-normal">
                    {brief.summary}
                  </p>
                </div>

                {/* Critical Alerts */}
                {brief.critical_alerts?.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-mono font-bold text-[#EF4444] uppercase tracking-wider">
                      Critical Operational Alerts ({brief.critical_alerts.length})
                    </div>
                    <div className="space-y-2.5">
                      {brief.critical_alerts.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 text-sm text-[#EF4444] leading-relaxed bg-[#EF4444]/10 border border-[#EF4444]/40 p-4 rounded-xl font-normal shadow-sm"
                        >
                          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-[#EF4444]" />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* High Priority Flags */}
                {brief.high_alerts?.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-xs font-mono font-bold text-[#F59E0B] uppercase tracking-wider">
                      High-Priority Flags ({brief.high_alerts.length})
                    </div>
                    <div className="space-y-2.5">
                      {brief.high_alerts.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 text-sm text-[#E6E2DA] leading-relaxed bg-[#1C1A16] border border-[#322E27] border-l-4 border-l-[#D97706] p-4 rounded-xl font-normal shadow-sm"
                        >
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#D97706]" />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Chronological Vertical Timeline View */}
          {activeTab === 'timeline' && (
            <div className="space-y-6 w-full">
              <div className="text-sm font-sans text-[#A8A29E] flex items-center gap-2 font-semibold">
                <Calendar className="w-4 h-4 text-[#D97706]" />
                <span>Incident progression sequence ({brief.timeline?.length || 0} events across jurisdictions)</span>
              </div>

              {/* Vertical Timeline Track with aligned dates and content */}
              <div className="relative pl-6 sm:pl-8 border-l-2 border-[#322E27] space-y-6">
                {(brief.timeline || []).map((ev, idx) => (
                  <div key={ev.id || idx} className="relative group">
                    {/* Timeline Node Point */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#1C1A16] border-2 border-[#D97706] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    </div>

                    {/* Timeline Card */}
                    <div className="p-5 rounded-xl bg-[#24211C] border border-[#322E27] hover:border-[#D97706]/40 transition-all space-y-2 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs font-bold text-[#D97706] bg-[#1C1A16] px-2 py-0.5 rounded border border-[#322E27]">
                            #{String(idx + 1).padStart(2, '0')}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-[#F5F3EF] truncate">{ev.title}</h4>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-semibold text-[#2DD4BF] bg-[#2DD4BF]/10 px-2 py-0.5 rounded border border-[#2DD4BF]/30">
                            {ev.date}
                          </span>
                          <span className="text-xs font-mono text-[#78716C] bg-[#1C1A16] px-2 py-0.5 rounded border border-[#322E27]">
                            {ev.id}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-[#E6E2DA] leading-relaxed pt-1">{ev.summary}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
