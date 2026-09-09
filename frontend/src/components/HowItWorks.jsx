import { useState } from 'react'
import { ChevronDown, Info } from 'lucide-react'

const STEPS = [
  { step: '01', title: 'Data ingestion', desc: 'Investigative reports are ingested from multiple sources — field operatives, FIRs, and surveillance logs with timestamps.' },
  { step: '02', title: 'Entity extraction', desc: 'spaCy NER identifies suspects, locations, and organizations. Structured patterns capture Indian phone numbers and vehicle registrations.' },
  { step: '03', title: 'Graph construction', desc: 'Entities co-occurring in the same report are connected with weighted links. Cross-report mentions merge to reveal hidden syndicates.' },
  { step: '04', title: 'Network analytics', desc: 'NetworkX computes degree, betweenness centrality, and PageRank scores. Louvain community clustering identifies distinct cells.' },
  { step: '05', title: 'Pattern alerts', desc: 'Rule-based detectors flag shared communication devices, cross-domain bridge actors, and repeat suspect vehicles.' },
  { step: '06', title: 'Actionable intelligence', desc: 'Natural-language queries evaluate paths across jurisdictions, and automated briefs summarize high-priority threats.' },
]

export default function HowItWorks() {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#322E27] bg-[#1C1A16] rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#24211C]/50 transition-colors min-h-[56px]"
      >
        <div className="flex items-center gap-2.5">
          <Info size={16} className="text-[#D97706]" />
          <span className="font-sans text-sm font-semibold text-[#E6E2DA]">How CrimeNet analyzes criminal networks</span>
        </div>
        <ChevronDown size={16} className={`text-[#A8A29E] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in border-t border-[#322E27]">
          {STEPS.map(s => (
            <div key={s.step} className="bg-[#24211C] border border-[#322E27] rounded-xl p-5 space-y-2 flex flex-col justify-between">
              <div className="font-sans font-semibold text-[#D97706] text-xs flex items-center gap-2">
                <span className="font-mono text-[#78716C] font-bold bg-[#1C1A16] px-2 py-0.5 rounded border border-[#322E27]">{s.step}</span>
                <span className="text-sm text-[#F5F3EF]">{s.title}</span>
              </div>
              <p className="text-xs text-[#A8A29E] leading-relaxed font-sans">{s.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
