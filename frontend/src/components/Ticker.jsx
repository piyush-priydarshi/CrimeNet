const TICKER_ITEMS = [
  { text: 'ALERT: Shared phone 9334567890 detected across Patna and Jamtara cases', isCritical: true },
  { text: 'Rajan Verma identified as bridge entity — 4 case connections', isCritical: false },
  { text: 'New hotspot: Dharavi, Mumbai — narcotics activity elevated', isCritical: false },
  { text: 'Red Crescent Syndicate linked to 3 separate criminal networks', isCritical: false },
  { text: 'Vehicle MH-02-AB-1234 flagged in multi-case analysis', isCritical: false },
  { text: 'BlueShield Logistics designated as suspected shell company', isCritical: false },
  { text: 'Phone 9711234567 — contact established with Hyderabad cell', isCritical: false },
  { text: 'CRITICAL: Cross-domain nexus detected — financial crime ↔ explosives', isCritical: true },
]

export default function Ticker() {
  return (
    <div className="relative overflow-hidden w-full max-w-full h-9 bg-[#181613] border-y border-[#322E27] flex items-center select-none z-20">
      {/* Solid non-overlapping badge */}
      <div className="relative z-20 shrink-0 px-4 font-mono text-xs font-bold text-[#EF4444] tracking-wider border-r border-[#322E27] h-full flex items-center bg-[#1C1A16] shadow-md">
        <span className="w-2 h-2 rounded-full bg-[#EF4444] mr-2 animate-pulse shrink-0" />
        <span className="whitespace-nowrap">LIVE INTEL</span>
      </div>

      {/* Marquee viewport with left and right gradient masks */}
      <div className="flex-1 overflow-hidden min-w-0 relative h-full flex items-center">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#181613] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#181613] to-transparent z-10" />

        <div className="animate-ticker whitespace-nowrap font-sans text-xs text-[#E6E2DA] flex items-center pl-4">
          {/* Duplicate tracks for seamless infinite scroll */}
          {[0, 1].map((trackIdx) => (
            <div key={trackIdx} className="flex items-center shrink-0">
              {TICKER_ITEMS.map((item, i) => (
                <span key={`${trackIdx}-${i}`} className="mx-6 inline-flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      item.isCritical ? 'bg-[#EF4444]' : 'bg-[#D97706]'
                    }`}
                  />
                  <span className={item.isCritical ? 'text-[#EF4444] font-medium' : 'text-[#E6E2DA]'}>
                    {item.text}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
