import { useState, useMemo } from 'react'
import { MapPin, Users, FileText, X, Compass } from 'lucide-react'

// India SVG path (simplified outline)
const INDIA_PATH = "M 285 35 L 300 20 L 340 25 L 380 15 L 420 30 L 450 55 L 470 90 L 490 120 L 500 160 L 510 200 L 505 240 L 495 280 L 480 320 L 460 355 L 440 385 L 410 410 L 380 430 L 350 450 L 330 470 L 310 480 L 290 470 L 270 455 L 250 440 L 230 420 L 215 395 L 200 365 L 195 340 L 205 315 L 220 290 L 230 260 L 225 230 L 215 200 L 210 170 L 215 140 L 225 115 L 240 90 L 255 65 Z"

// Actual geo bounds for India (approx)
const GEO = { latMin: 8, latMax: 37, lngMin: 68, lngMax: 98 }
const SVG = { x: 195, y: 15, w: 320, h: 475 }

function geoToSvg(lat, lng) {
  const nx = (lng - GEO.lngMin) / (GEO.lngMax - GEO.lngMin)
  const ny = 1 - (lat - GEO.latMin) / (GEO.latMax - GEO.latMin)
  return [SVG.x + nx * SVG.w, SVG.y + ny * SVG.h]
}

export default function GeoMap({ locations = [] }) {
  const [selectedLoc, setSelectedLoc] = useState(null)
  const maxW = Math.max(1, ...locations.map(l => l.weight || 1))

  // Sort locations by activity
  const topLocations = useMemo(() => {
    return [...locations].sort((a, b) => (b.weight || 0) - (a.weight || 0))
  }, [locations])

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center p-4 overflow-hidden bg-[#14120F]">
      {/* Top HUD Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Active Sectors Count Badge */}
        <div className="flex items-center gap-2 bg-[#1C1A16]/95 backdrop-blur-md px-3.5 h-10 rounded-lg border border-[#322E27] pointer-events-auto shadow-md">
          <MapPin className="w-4 h-4 text-[#D97706] shrink-0" />
          <span className="text-xs font-sans text-[#E6E2DA]">
            Active sectors: <strong className="text-[#FBBF24] font-semibold">{locations.length}</strong>
          </span>
        </div>

        {/* Quick Select Hotspot Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-md pointer-events-auto bg-[#1C1A16]/95 backdrop-blur-md p-1 rounded-lg border border-[#322E27] shadow-md h-10">
          <span className="text-[11px] font-mono text-[#A8A29E] px-2 uppercase font-medium">Hotspots:</span>
          {topLocations.slice(0, 5).map(loc => (
            <button
              key={loc.name}
              onClick={() => setSelectedLoc(loc)}
              className={`h-8 px-2.5 text-xs font-sans rounded-md border transition-colors whitespace-nowrap flex items-center gap-1 ${
                selectedLoc?.name === loc.name
                  ? 'bg-[#D97706]/20 text-[#FBBF24] border-[#D97706]/60 font-medium'
                  : 'bg-[#24211C] text-[#A8A29E] hover:text-[#F5F3EF] border-[#322E27]'
              }`}
            >
              <span>{loc.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({loc.weight})</span>
            </button>
          ))}
        </div>
      </div>

      {/* SVG Map Container */}
      <svg
        viewBox="0 0 700 510"
        className="w-full h-full max-h-[480px]"
        style={{ filter: 'drop-shadow(0 0 20px rgba(217,119,6,0.06))' }}
      >
        <defs>
          <radialGradient id="hotspot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hotspotSelected" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="1" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* India outline */}
        <path d={INDIA_PATH} fill="#1C1A16" stroke="#322E27" strokeWidth="1.5" />

        {/* Tactical Radar Grid */}
        {Array.from({ length: 8 }, (_, i) => (
          <line
            key={`h${i}`}
            x1="195"
            y1={15 + i * 60}
            x2="515"
            y2={15 + i * 60}
            stroke="#D97706"
            strokeOpacity="0.06"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={195 + i * 64}
            y1="15"
            x2={195 + i * 64}
            y2="490"
            stroke="#D97706"
            strokeOpacity="0.06"
            strokeWidth="0.5"
          />
        ))}

        {/* Hotspot circles */}
        {locations.map((loc, i) => {
          const [x, y] = geoToSvg(loc.lat, loc.lng)
          const isSelected = selectedLoc?.name === loc.name
          const r = 8 + (loc.weight / maxW) * 20
          return (
            <g
              key={i}
              filter="url(#glow)"
              className="cursor-pointer"
              onClick={() => setSelectedLoc(loc)}
            >
              <circle
                cx={x}
                cy={y}
                r={r * (isSelected ? 2.4 : 1.7)}
                fill={isSelected ? 'url(#hotspotSelected)' : 'url(#hotspot)'}
                opacity={isSelected ? 0.85 : 0.45}
              >
                <animate
                  attributeName="r"
                  values={`${r * 1.4};${r * (isSelected ? 2.6 : 2.0)};${r * 1.4}`}
                  dur={isSelected ? '1.2s' : '2.4s'}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.3;0.65;0.3"
                  dur={isSelected ? '1.2s' : '2.4s'}
                  repeatCount="indefinite"
                />
              </circle>

              {/* Center point */}
              <circle
                cx={x}
                cy={y}
                r={r * 0.5}
                fill={isSelected ? '#F59E0B' : '#78716C'}
                opacity={0.95}
                stroke={isSelected ? '#FFFFFF' : '#A8A29E'}
                strokeWidth={isSelected ? 1.5 : 0.8}
              />
              <circle cx={x} cy={y} r={r * 0.22} fill="#FFFFFF" />
            </g>
          )
        })}

        {/* Location labels */}
        {locations.map((loc, i) => {
          const [x, y] = geoToSvg(loc.lat, loc.lng)
          const isSelected = selectedLoc?.name === loc.name
          return (
            <text
              key={i}
              x={x + 8}
              y={y - 8}
              fill={isSelected ? '#FBBF24' : '#E6E2DA'}
              fontSize={isSelected ? '10' : '8.5'}
              fontWeight={isSelected ? '600' : 'normal'}
              fontFamily="Inter, sans-serif"
              opacity={isSelected ? 1 : 0.85}
              className="cursor-pointer select-none"
              onClick={() => setSelectedLoc(loc)}
            >
              {loc.name} {loc.weight > 1 ? `(${loc.weight})` : ''}
            </text>
          )
        })}

        {/* Region label */}
        <text
          x="350"
          y="498"
          textAnchor="middle"
          fill="#57534E"
          fontSize="10"
          fontFamily="Inter, sans-serif"
          letterSpacing="2"
        >
          INDIA // JURISDICTIONAL INTELLIGENCE GRID
        </text>
      </svg>

      {/* Inspection Card Docked in Bottom-Right */}
      {selectedLoc && (
        <div className="absolute bottom-4 right-4 z-20 w-80 bg-[#1C1A16]/95 backdrop-blur-md border border-[#322E27] rounded-xl p-5 shadow-2xl animate-fade-in space-y-3">
          <div className="flex items-start justify-between border-b border-[#322E27] pb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#D97706]" />
                <h4 className="font-sans font-semibold text-sm text-[#F5F3EF]">{selectedLoc.name}</h4>
              </div>
              <span className="text-[11px] font-mono text-[#A8A29E]">
                Coordinates: {selectedLoc.lat.toFixed(4)}°N, {selectedLoc.lng.toFixed(4)}°E
              </span>
            </div>
            <button
              onClick={() => setSelectedLoc(null)}
              className="w-7 h-7 flex items-center justify-center text-[#A8A29E] hover:text-[#F5F3EF] hover:bg-[#24211C] rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs font-sans">
            <div className="flex items-center justify-between bg-[#24211C] p-2.5 rounded-lg border border-[#322E27]">
              <span className="text-[#A8A29E]">Investigative cases:</span>
              <span className="text-[#FBBF24] font-semibold font-mono">{selectedLoc.weight || selectedLoc.reports?.length || 1} report(s)</span>
            </div>

            {selectedLoc.reports && selectedLoc.reports.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-[11px] text-[#A8A29E] mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Linked cases:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLoc.reports.map(r => (
                    <span
                      key={r}
                      className="px-2 py-0.5 bg-[#24211C] text-[#D97706] border border-[#322E27] rounded font-mono text-[10px]"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedLoc.suspects && selectedLoc.suspects.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-[11px] text-[#A8A29E] mb-1.5">
                  <Users className="w-3.5 h-3.5 text-[#A8A29E]" />
                  <span>Associated entities:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLoc.suspects.map(s => (
                    <span
                      key={s}
                      className="px-2 py-0.5 bg-[#24211C] text-[#E6E2DA] border border-[#322E27] rounded text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {locations.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-[#78716C] font-sans text-xs pointer-events-none p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#1C1A16] border border-[#322E27] flex items-center justify-center text-[#A8A29E]">
            <Compass size={20} />
          </div>
          <span className="font-semibold text-[#E6E2DA]">No geographical hotspots plotted yet</span>
          <span className="max-w-xs text-[#A8A29E]">Process investigative reports to map multi-jurisdictional syndicate cells across India.</span>
        </div>
      )}
    </div>
  )
}
