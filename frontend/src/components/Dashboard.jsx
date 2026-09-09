import {
  Shield,
  Users,
  MapPin,
  AlertTriangle,
  GitBranch,
  FileText,
  TrendingUp,
  Activity,
  Hash,
} from 'lucide-react'

const STATS = [
  {
    key: 'reports',
    label: 'Reports processed',
    icon: FileText,
    isAlert: false,
    valueIcon: Activity,
    trend: 'Live intake',
    trendType: 'neutral',
  },
  {
    key: 'entities',
    label: 'Entities extracted',
    icon: Users,
    isAlert: false,
    valueIcon: Hash,
    trend: 'spaCy NER + Regex',
    trendType: 'neutral',
  },
  {
    key: 'relationships',
    label: 'Relationships mapped',
    icon: GitBranch,
    isAlert: false,
    valueIcon: GitBranch,
    sparkline: [2, 5, 8, 12, 18, 24, 31],
    trend: '+18% syndicate links',
    trendType: 'positive',
  },
  {
    key: 'flagged',
    label: 'High-risk flagged',
    icon: AlertTriangle,
    isAlert: true,
    valueIcon: AlertTriangle,
    trend: 'Critical attention',
    trendType: 'alert',
  },
  {
    key: 'locations',
    label: 'Locations mapped',
    icon: MapPin,
    isAlert: false,
    valueIcon: MapPin,
    trend: 'Cross-jurisdiction',
    trendType: 'neutral',
  },
  {
    key: 'clusters',
    label: 'Network clusters',
    icon: Shield,
    isAlert: false,
    valueIcon: Shield,
    trend: 'Louvain communities',
    trendType: 'neutral',
  },
]

const STAT_CARD_PADDING = 'p-5 sm:p-6'
const STAT_CARD_GAP = 'gap-3.5 sm:gap-4'

export default function Dashboard({ stats }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 ${STAT_CARD_GAP} transition-all duration-500`}>
      {STATS.map(({ key, label, icon: Icon, isAlert, valueIcon: ValIcon, sparkline, trend, trendType }) => {
        const hasAlert = isAlert && (stats?.[key] > 0)
        return (
          <div
            key={key}
            className={`rounded-2xl ${STAT_CARD_PADDING} flex flex-col justify-between transition-all duration-200 shadow-sm ${
              hasAlert
                ? 'border-[#EF4444]/40 bg-[#EF4444]/5 shadow-[0_0_15px_rgba(239,68,68,0.06)]'
                : 'bg-[#1C1A16] border-[#322E27] hover:border-[#D97706]/40'
            }`}
          >
            {/* Header: Title and Icon */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-xs text-[#A8A29E] font-medium truncate">{label}</span>
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 shadow-sm ${
                  hasAlert
                    ? 'bg-[#EF4444]/15 text-[#EF4444]'
                    : 'bg-[#24211C] text-[#D97706]'
                }`}
              >
                <Icon size={13} />
              </div>
            </div>

            {/* Metric Value + Sparkline */}
            <div className="flex items-baseline justify-between gap-1.5 py-1.5 my-auto">
              <div className="flex items-center gap-2 min-w-0">
                <ValIcon
                  size={14}
                  className={`shrink-0 opacity-70 ${
                    hasAlert ? 'text-[#EF4444]' : 'text-[#D97706]'
                  }`}
                />
                <span
                  className={`font-mono text-2xl sm:text-[26px] font-bold tracking-tight truncate ${
                    hasAlert ? 'text-[#EF4444]' : 'text-[#F5F3EF]'
                  }`}
                >
                  {stats?.[key] ?? '—'}
                </span>
              </div>

              {/* Sparkline for Relationships */}
              {sparkline && stats?.[key] !== undefined && stats?.[key] !== null && (
                <svg className="w-12 h-5 overflow-visible shrink-0" viewBox="0 0 48 20">
                  <path
                    d="M 0 16 L 8 14 L 16 11 L 24 13 L 32 8 L 40 5 L 48 2"
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="48" cy="2" r="2" fill="#FBBF24" />
                </svg>
              )}
            </div>

            {/* Footer / Trend - pinned to bottom */}
            <div className="pt-2 border-t border-[#322E27]/80 text-[11px] font-sans mt-auto">
              {trendType === 'alert' && hasAlert ? (
                <span className="inline-flex items-center gap-1 text-[#EF4444] font-medium font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                  {trend}
                </span>
              ) : trendType === 'positive' ? (
                <span className="inline-flex items-center gap-1 text-[#2DD4BF] font-medium text-[10px]">
                  <TrendingUp size={11} />
                  {trend}
                </span>
              ) : (
                <span className="text-[#78716C] text-[10px] truncate block">{trend}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
