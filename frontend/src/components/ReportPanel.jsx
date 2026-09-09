import { useState } from 'react'
import { Panel, Badge, Spinner, Btn } from './ui'
import { getSampleData, processReports } from '../api'
import { Database, Zap, ChevronDown, ChevronUp, FolderOpen } from 'lucide-react'

export default function ReportPanel({ onProcessed }) {
  const [reports, setReports] = useState([])
  const [extractions, setExtractions] = useState([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(null)

  const loadSample = async () => {
    setLoading(true)
    try {
      const d = await getSampleData()
      setReports(d.reports)
    } finally { setLoading(false) }
  }

  const process = async () => {
    if (!reports.length) return
    setLoading(true)
    try {
      const result = await processReports(reports)
      setExtractions(result.extractions)
      onProcessed(result)
    } finally { setLoading(false) }
  }

  return (
    <Panel
      title="Investigative field reports"
      icon={<Database size={15} />}
      action={
        <div className="flex items-center gap-2">
          <Btn onClick={loadSample} variant="ghost" disabled={loading}>
            <Database size={13} />
            <span>Load sample data</span>
          </Btn>
          <Btn onClick={process} variant="primary" disabled={!reports.length || loading}>
            <Zap size={13} />
            <span>Process & extract</span>
          </Btn>
        </div>
      }
    >
      {loading && <Spinner />}
      {!loading && reports.length === 0 && (
        <div className="py-16 px-6 flex flex-col items-center justify-center text-center space-y-3 font-sans">
          <div className="w-12 h-12 rounded-2xl bg-[#24211C] border border-[#322E27] flex items-center justify-center text-[#A8A29E] shadow-sm">
            <FolderOpen size={22} className="text-[#D97706]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[#F5F3EF]">No reports ingested yet</h4>
            <p className="text-xs text-[#A8A29E] max-w-xs leading-relaxed">
              Load synthetic multi-agency intelligence reports across Delhi, Patna, Hyderabad, and Mumbai to begin network extraction.
            </p>
          </div>
          <Btn onClick={loadSample} variant="ghost" className="mt-2">
            <Database size={13} />
            <span>Load 10 synthetic field reports</span>
          </Btn>
        </div>
      )}
      {!loading && reports.map((rpt, i) => {
        const ext = extractions.find(e => e.report_id === rpt.id)
        const isOpen = expanded === i
        return (
          <div key={rpt.id} className="border-b border-[#322E27] last:border-0">
            <button
              className="w-full text-left px-5 py-3.5 hover:bg-[#24211C]/50 transition-colors flex items-start justify-between gap-3 rounded-lg"
              onClick={() => setExpanded(isOpen ? null : i)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold text-[#D97706]">{rpt.id}</span>
                  <span className="font-mono text-xs text-[#78716C]">{rpt.date}</span>
                </div>
                <div className="text-xs font-medium text-[#F5F3EF] truncate">{rpt.title}</div>
              </div>
              <span className="text-[#A8A29E] mt-1">
                {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-4 pt-1 space-y-3 animate-fade-in">
                <p className="text-xs text-[#E6E2DA] leading-relaxed font-sans bg-[#24211C] p-4 rounded-lg border border-[#322E27]">
                  {rpt.text}
                </p>
                {ext && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] text-[#A8A29E] font-sans font-medium">Extracted entities</span>
                    {[
                      ['person', ext.persons],
                      ['location', ext.locations],
                      ['vehicle', ext.vehicles],
                      ['phone', ext.phones],
                      ['organization', ext.organizations],
                    ].map(([type, vals]) => vals.length > 0 && (
                      <div key={type} className="flex flex-wrap gap-1.5">
                        {vals.map(v => <Badge key={v} label={v} type={type} />)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </Panel>
  )
}
