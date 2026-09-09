import { useState, useEffect } from 'react'
import { Panel, Spinner } from './ui'
import { getAlerts } from '../api'
import { AlertTriangle, BellOff, FileText } from 'lucide-react'

const TYPE_LABELS = {
  SHARED_PHONE: 'Shared phone / burner',
  BRIDGE_ENTITY: 'Cross-syndicate bridge entity',
  VEHICLE_MULTI_CASE: 'Multi-jurisdiction vehicle',
  ORG_MULTI_CASE: 'Multi-case front organisation',
}

export default function AlertPanel({ refresh }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!refresh) return
    setLoading(true)
    getAlerts().then(d => { setAlerts(d.alerts || []); setLoading(false) }).catch(() => setLoading(false))
  }, [refresh])

  return (
    <Panel title="Suspicious pattern alerts" icon={<AlertTriangle size={16} />} className="w-full h-full">
      {loading && <Spinner />}

      {!loading && alerts.length === 0 && (
        <div className="py-20 px-6 flex flex-col items-center justify-center text-center space-y-3 font-sans">
          <div className="w-12 h-12 rounded-xl bg-[#24211C] border border-[#322E27] flex items-center justify-center text-[#A8A29E] shadow-sm">
            <BellOff size={24} className="text-[#D97706]" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-semibold text-[#F5F3EF]">No suspicious pattern alerts detected</h4>
            <p className="text-sm text-[#A8A29E] max-w-md leading-relaxed">
              Automated rule engines evaluate shared phone lines, multi-case transport, and recurring shell entities across processed cases.
            </p>
          </div>
        </div>
      )}

      {/* 2-column card grid */}
      {!loading && alerts.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          {alerts.map((alert, i) => {
            const isCritical = alert.severity === 'CRITICAL'
            const isHigh = alert.severity === 'HIGH'
            return (
              <div
                key={i}
                className={`p-5 sm:p-6 rounded-xl border transition-all shadow-sm flex flex-col justify-between space-y-4 ${
                  isCritical
                    ? 'bg-[#1C1A16] border-[#EF4444]/40 hover:border-[#EF4444]/60 shadow-[0_0_15px_rgba(239,68,68,0.08)]'
                    : isHigh
                    ? 'bg-[#1C1A16] border-[#D97706]/40 hover:border-[#D97706]/60'
                    : 'bg-[#1C1A16] border-[#322E27] hover:border-[#443E35]'
                }`}
              >
                <div className="space-y-3">
                  {/* Severity Badge & Flag Type */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wider uppercase border ${
                          isCritical
                            ? 'bg-[#EF4444]/15 border-[#EF4444]/50 text-[#EF4444]'
                            : isHigh
                            ? 'bg-[#D97706]/15 border-[#D97706]/50 text-[#F59E0B]'
                            : 'bg-[#24211C] border-[#322E27] text-[#A8A29E]'
                        }`}
                      >
                        <AlertTriangle size={12} />
                        <span>{alert.severity} PRIORITY</span>
                      </span>

                      <span className="text-xs font-mono text-[#A8A29E] bg-[#24211C] border border-[#322E27] px-2.5 py-1 rounded-md">
                        {TYPE_LABELS[alert.type] || alert.type}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-[#78716C]">FLAG #{String(i + 1).padStart(2, '0')}</span>
                  </div>

                  {/* Entity Name */}
                  <div className="pt-1">
                    <h4 className="font-sans text-base sm:text-lg font-bold text-[#F5F3EF] tracking-tight">
                      {alert.entity}
                    </h4>
                  </div>

                  {/* Reason Narrative */}
                  <p className="text-sm text-[#E6E2DA] leading-relaxed font-normal">
                    {alert.reason}
                  </p>
                </div>

                {/* Associated Cases */}
                {alert.reports?.length > 0 && (
                  <div className="pt-3 border-t border-[#322E27]/80 flex flex-wrap items-center gap-2 mt-auto">
                    <span className="text-xs text-[#A8A29E] font-medium flex items-center gap-1 mr-1">
                      <FileText size={13} className="text-[#D97706]" />
                      <span>Associated cases:</span>
                    </span>
                    {alert.reports.map(r => (
                      <span
                        key={r}
                        className="font-mono text-xs font-semibold text-[#D97706] bg-[#24211C] border border-[#322E27] px-2.5 py-0.5 rounded-md"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}
