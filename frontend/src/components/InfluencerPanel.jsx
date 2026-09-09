import { useState, useEffect } from 'react'
import { Panel, Spinner, Badge } from './ui'
import { getInfluencers } from '../api'
import { TrendingUp, Users } from 'lucide-react'

function Bar({ value, max, color }) {
  return (
    <div className="h-2 bg-[#24211C] border border-[#322E27] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, backgroundColor: color }}
      />
    </div>
  )
}

export default function InfluencerPanel({ refresh }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!refresh) return
    setLoading(true)
    getInfluencers().then(d => { setData(d.influencers || []); setLoading(false) }).catch(() => setLoading(false))
  }, [refresh])

  const maxDeg = Math.max(0.001, ...data.map(e => e.degree))
  const maxBet = Math.max(0.001, ...data.map(e => e.betweenness))
  const maxPr = Math.max(0.001, ...data.map(e => e.pagerank))

  return (
    <Panel title="Key network influencers" icon={<TrendingUp size={16} />} className="w-full h-full">
      {loading && <Spinner />}
      {!loading && data.length === 0 && (
        <div className="py-20 px-6 flex flex-col items-center justify-center text-center space-y-3 font-sans">
          <div className="w-12 h-12 rounded-xl bg-[#24211C] border border-[#322E27] flex items-center justify-center text-[#A8A29E] shadow-sm">
            <Users size={24} className="text-[#D97706]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-[#F5F3EF]">No influencer ranking computed</h4>
            <p className="text-sm text-[#A8A29E] max-w-md leading-relaxed">
              Ingest or process investigative reports to calculate degree centrality, betweenness bridge metrics, and PageRank syndicate hierarchies.
            </p>
          </div>
        </div>
      )}
      {!loading && (
        <div className="divide-y divide-[#322E27]">
          {data.map((e, i) => (
            <div key={e.id} className="py-4 px-2 hover:bg-[#24211C]/40 transition-colors first:pt-0 last:pb-0">
              <div className="flex items-start gap-3.5">
                <span className="font-mono text-sm text-[#A8A29E] font-bold w-6 shrink-0 pt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-sans text-sm font-semibold text-[#F5F3EF] truncate">{e.label}</span>
                    <Badge label={e.type} type={e.type} />
                    {e.reports?.length > 1 && (
                      <span className="font-mono text-[11px] text-[#D97706] bg-[#24211C] border border-[#322E27] px-2 py-0.5 rounded-md">
                        {e.reports.length} cases
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 mb-1">
                    <div className="flex items-center gap-3 text-xs font-sans text-[#A8A29E]">
                      <span className="w-24 text-[#A8A29E]">Degree</span>
                      <div className="flex-1"><Bar value={e.degree} max={maxDeg} color="#D97706" /></div>
                      <span className="w-14 text-right font-mono text-[#E6E2DA]">{e.degree.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-sans text-[#A8A29E]">
                      <span className="w-24 text-[#A8A29E]">Betweenness</span>
                      <div className="flex-1"><Bar value={e.betweenness} max={maxBet} color="#F59E0B" /></div>
                      <span className="w-14 text-right font-mono text-[#E6E2DA]">{e.betweenness.toFixed(3)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-sans text-[#A8A29E]">
                      <span className="w-24 text-[#A8A29E]">PageRank</span>
                      <div className="flex-1"><Bar value={e.pagerank} max={maxPr} color="#2DD4BF" /></div>
                      <span className="w-14 text-right font-mono text-[#E6E2DA]">{e.pagerank.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
