import { useState } from 'react'
import { Panel, Btn } from './ui'
import { queryNetwork } from '../api'
import { GitFork, Send, Sparkles, Trash2, ArrowRight, CornerDownRight, Compass } from 'lucide-react'

const KEY_SUSPECTS = [
  "Rajan Verma",
  "Imran Qureshi",
  "Arjun Mehta",
  "Kabir Ansari",
  "Selvam Krishnan",
  "Vikram Das",
  "Red Crescent Syndicate"
]

const QUERY_PRESETS = [
  { label: "Cross-jurisdiction Hawala link", q: "Who connects Case 3 and Case 7?" },
  { label: "Top syndicate influence", q: "Who is the most influential entity?" },
  { label: "Active high-risk alerts", q: "What alerts exist in the network?" },
  { label: "Rajan Verma cross-case footprint", q: "How many cases is Rajan Verma linked to?" },
  { label: "Imran Qureshi explosives connection", q: "What is Imran Qureshi connected to?" },
]

export default function QueryPanel({ enabled }) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [sourceSuspect, setSourceSuspect] = useState('Rajan Verma')
  const [targetSuspect, setTargetSuspect] = useState('Imran Qureshi')

  const ask = async (question) => {
    const text = question || q
    if (!text.trim()) return
    setLoading(true)
    try {
      const res = await queryNetwork(text)
      const entry = { q: text, a: res.answer, time: new Date().toLocaleTimeString() }
      setHistory(h => [entry, ...h.slice(0, 8)])
      setQ('')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePairQuery = () => {
    if (!sourceSuspect || !targetSuspect || sourceSuspect === targetSuspect) return
    const pairQuery = `Who connects ${sourceSuspect} and ${targetSuspect}?`
    ask(pairQuery)
  }

  return (
    <Panel title="Query network & trace links" icon={<GitFork size={16} />} className="w-full h-full">
      {/* 2-Column Wide Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* Left Column (5 of 12 cols): Query Controls & Path Finder */}
        <div className="lg:col-span-5 space-y-5">
          {/* Suspect-to-Suspect Path Finder Card */}
          <div className="bg-[#24211C] border border-[#322E27] rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-sans text-[#D97706] font-bold">
              <GitFork className="w-4 h-4" />
              <span>Suspect Path Resolver</span>
            </div>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Find shortest degrees of separation, intermediary shell firms, or shared burner phone bridges between any two actors.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-[#A8A29E] block mb-1 font-semibold">SOURCE SUSPECT / ENTITY</label>
                <select
                  value={sourceSuspect}
                  onChange={e => setSourceSuspect(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 bg-[#1C1A16] border border-[#322E27] rounded-lg px-3 text-sm font-sans text-[#F5F3EF] outline-none focus:border-[#D97706] transition-colors"
                >
                  {KEY_SUSPECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center text-[#78716C] py-0.5">
                <ArrowRight className="w-4 h-4 rotate-90 sm:rotate-0" />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#A8A29E] block mb-1 font-semibold">TARGET SUSPECT / ENTITY</label>
                <select
                  value={targetSuspect}
                  onChange={e => setTargetSuspect(e.target.value)}
                  disabled={loading}
                  className="w-full h-10 bg-[#1C1A16] border border-[#322E27] rounded-lg px-3 text-sm font-sans text-[#F5F3EF] outline-none focus:border-[#D97706] transition-colors"
                >
                  {KEY_SUSPECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handlePairQuery}
                disabled={loading || sourceSuspect === targetSuspect}
                className="w-full h-10 px-4 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-[#14120F] font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <GitFork size={15} />
                <span>Trace shortest path</span>
              </button>
            </div>
          </div>

          {/* Freeform Query Input */}
          <div className="bg-[#24211C] border border-[#322E27] rounded-xl p-5 sm:p-6 space-y-3 shadow-sm">
            <label className="text-xs font-bold text-[#F5F3EF] block">Natural Language Intelligence Query</label>
            <div className="flex gap-2">
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && ask()}
                disabled={loading}
                placeholder="Ask about cases, links, bridge actors..."
                className="flex-1 h-10 bg-[#1C1A16] border border-[#322E27] rounded-lg px-3.5 text-sm font-sans text-[#F5F3EF] placeholder-[#78716C] focus:outline-none focus:border-[#D97706] transition-colors disabled:opacity-40"
              />
              <button
                type="button"
                onClick={() => ask()}
                disabled={loading || !q.trim()}
                className="w-10 h-10 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-[#14120F] font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center shrink-0"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-[#14120F] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </div>

            {/* Quick Question Chips */}
            <div className="pt-2">
              <div className="flex items-center gap-1.5 text-xs font-sans text-[#A8A29E] mb-2 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Recommended intelligence queries:</span>
              </div>
              <div className="flex flex-col gap-2">
                {QUERY_PRESETS.map(preset => (
                  <button
                    type="button"
                    key={preset.q}
                    onClick={() => ask(preset.q)}
                    disabled={loading}
                    title={preset.q}
                    className="text-xs sm:text-sm font-sans text-[#E6E2DA] hover:text-[#F5F3EF] bg-[#1C1A16] border border-[#322E27] hover:border-[#D97706]/50 p-2.5 rounded-lg transition-all disabled:opacity-30 text-left flex items-start gap-2 shadow-sm group"
                  >
                    <CornerDownRight size={14} className="text-[#D97706] mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 of 12 cols): Query Results & Analysis Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-sm font-sans text-[#A8A29E] font-semibold">
              Analysis Responses & Traces ({history.length}):
            </span>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-xs font-sans text-[#78716C] hover:text-[#EF4444] flex items-center gap-1 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear history</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-12 rounded-xl bg-[#24211C]/60 border border-[#322E27] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#1C1A16] border border-[#322E27] flex items-center justify-center text-[#A8A29E] mx-auto shadow-sm">
                <Compass size={24} className="text-[#D97706]" />
              </div>
              <h4 className="text-base font-bold text-[#F5F3EF]">No link traces executed yet</h4>
              <p className="text-sm text-[#A8A29E] max-w-md mx-auto leading-relaxed">
                Select a suspect pair on the left and click &ldquo;Trace shortest path&rdquo; or choose one of the recommended intelligence queries to evaluate cross-case connections.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="border border-[#322E27] rounded-xl p-5 sm:p-6 bg-[#24211C] shadow-sm space-y-3 hover:border-[#D97706]/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-[#322E27] pb-3">
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-[#D97706] font-bold uppercase tracking-wider block">
                        QUERY #{String(history.length - i).padStart(2, '0')}
                      </span>
                      <h4 className="text-base font-bold text-[#F5F3EF] leading-snug">
                        {h.q}
                      </h4>
                    </div>
                    {h.time && (
                      <span className="text-xs font-mono text-[#78716C] bg-[#1C1A16] px-2.5 py-1 rounded-md border border-[#322E27] shrink-0">
                        {h.time}
                      </span>
                    )}
                  </div>

                  <div className="pt-1">
                    <p className="text-sm text-[#E6E2DA] leading-relaxed font-normal whitespace-pre-line">
                      {h.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}
