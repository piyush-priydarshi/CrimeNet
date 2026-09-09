import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Modal } from './ui'
import { Search, RotateCcw, Crosshair, Filter, Maximize2, Minimize2 } from 'lucide-react'
import * as THREE from 'three'

// Categorical palette: highly distinct from amber UI accents and from each other
const NODE_COLORS = {
  person: '#38BDF8',       // Sky blue
  location: '#2DD4BF',     // Deep Teal / Sage
  vehicle: '#A3E635',      // Lime / Citron
  phone: '#A78BFA',        // Violet / Purple
  organization: '#FB7185', // Rose / Coral
  unknown: '#78716C',      // Neutral Stone
}

export default function NetworkGraph({ graphData }) {
  const containerRef = useRef(null)
  const graphRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [ForceGraph, setForceGraph] = useState(null)
  const [activeTypeFilter, setActiveTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dimensions, setDimensions] = useState({ width: 800, height: 620 })
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    import('react-force-graph-3d').then(m => setForceGraph(() => m.default))
  }, [])

  // Auto-resize with safety padding
  useEffect(() => {
    if (!containerRef.current) return
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        const toolbarHeight = 50
        setDimensions({
          width: Math.max(320, clientWidth || 800),
          height: Math.max(320, Math.max(0, (clientHeight || 620) - toolbarHeight)),
        })
      }
    }
    updateSize()
    const ro = new ResizeObserver(updateSize)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [isFullscreen])

  const rawNodes = useMemo(() => graphData?.nodes || [], [graphData])
  const rawLinks = useMemo(() => graphData?.links || [], [graphData])

  // Tune physics repulsion & centering to cover the whole frame
  useEffect(() => {
    if (graphRef.current && ForceGraph) {
      const charge = graphRef.current.d3Force('charge')
      if (charge) charge.strength(-550).distanceMax(1400)

      const linkForce = graphRef.current.d3Force('link')
      if (linkForce) {
        linkForce.distance(l => 85 / Math.sqrt(l.weight || 1))
      }

      const center = graphRef.current.d3Force('center')
      if (center) {
        center.x(0).y(0).z(0)
      }
    }
  }, [ForceGraph, rawNodes, rawLinks, activeTypeFilter, isFullscreen])

  // Compute counts per type
  const typeCounts = useMemo(() => {
    const counts = { all: rawNodes.length }
    for (const n of rawNodes) {
      counts[n.type] = (counts[n.type] || 0) + 1
    }
    return counts
  }, [rawNodes])

  // Filtered dataset with wide spatial distribution spanning the whole frame
  const filteredData = useMemo(() => {
    let nodes = rawNodes.map((n, i) => {
      // Distribute initial positions across a wide elliptical volume spanning both left and right
      const angle = (i / Math.max(1, rawNodes.length)) * 2 * Math.PI
      const spreadX = 260 + (i % 4) * 50
      const spreadY = 140 + (i % 3) * 35
      const spreadZ = ((i % 5) - 2) * 45
      return {
        ...n,
        x: n.x ?? Math.cos(angle) * spreadX,
        y: n.y ?? Math.sin(angle) * spreadY,
        z: n.z ?? spreadZ,
      }
    })
    if (activeTypeFilter !== 'all') {
      nodes = nodes.filter(n => n.type === activeTypeFilter)
    }

    const nodeIds = new Set(nodes.map(n => n.id))
    const links = rawLinks
      .filter(l => {
        const s = typeof l.source === 'object' ? l.source.id : l.source
        const t = typeof l.target === 'object' ? l.target.id : l.target
        return nodeIds.has(s) && nodeIds.has(t)
      })
      .map(l => ({
        source: typeof l.source === 'object' ? l.source.id : l.source,
        target: typeof l.target === 'object' ? l.target.id : l.target,
        weight: l.weight || 1,
      }))

    return { nodes, links }
  }, [rawNodes, rawLinks, activeTypeFilter])

  // Auto-fit camera so 3D graph dynamically covers both left and right sides of the canvas
  const handleEngineStop = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(700, 50)
    }
  }, [])

  useEffect(() => {
    if (!graphRef.current || filteredData.nodes.length === 0) return
    const timer = setTimeout(() => {
      if (graphRef.current) {
        graphRef.current.zoomToFit(700, 50)
      }
    }, 450)
    return () => clearTimeout(timer)
  }, [filteredData, dimensions.width, dimensions.height])

  // Search matches
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return rawNodes.filter(n => n.label.toLowerCase().includes(q) || n.type.toLowerCase().includes(q)).slice(0, 6)
  }, [searchQuery, rawNodes])

  const focusOnNode = useCallback((node) => {
    if (!graphRef.current || !node) return
    const distance = 95
    const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1)
    graphRef.current.cameraPosition(
      { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
      { x: node.x || 0, y: node.y || 0, z: node.z || 0 },
      1200
    )
    setSelected(node)
  }, [])

  const resetCamera = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(800, 50)
    }
  }, [])

  // Vary link color & opacity by relationship strength
  const linkColor = useCallback(l => {
    const w = l.weight || 1
    if (w >= 3) return 'rgba(217, 119, 6, 0.9)'
    if (w === 2) return 'rgba(245, 158, 11, 0.5)'
    return 'rgba(120, 113, 108, 0.22)'
  }, [])

  // Vary link thickness by relationship strength
  const linkWidth = useCallback(l => {
    const w = l.weight || 1
    if (w >= 3) return 2.6
    if (w === 2) return 1.5
    return 0.6
  }, [])

  // Custom 3D Node Object with billboard text label and influencer halo ring
  const createNodeObject = useCallback((node) => {
    const isTopInfluencer = (node.betweenness > 0.08) || ((node.reports || []).length >= 3) || ((node.pagerank || 0) > 0.02)
    const radius = Math.max(2.4, 2.0 + (node.pagerank || 0) * 85 + (node.degree || 0) * 4.5)
    const baseColor = NODE_COLORS[node.type] || NODE_COLORS.unknown

    const group = new THREE.Group()

    // Sphere mesh
    const sphereMat = new THREE.MeshStandardMaterial({
      color: isTopInfluencer ? '#F59E0B' : baseColor,
      emissive: isTopInfluencer ? '#B45309' : baseColor,
      emissiveIntensity: isTopInfluencer ? 0.7 : 0.25,
      roughness: 0.35,
      metalness: 0.3,
    })
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16), sphereMat)
    group.add(sphere)

    // Subtle halo ring for top influencers
    if (isTopInfluencer) {
      const haloMat = new THREE.MeshBasicMaterial({
        color: '#F59E0B',
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 1.35, radius * 1.7, 24), haloMat)
      ring.rotation.x = Math.PI / 2
      group.add(ring)
    }

    // High-contrast text label using HTML canvas sprite
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.font = 'bold 24px Inter, sans-serif'
    ctx.fillStyle = isTopInfluencer ? '#FBBF24' : '#F5F3EF'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(node.label, 128, 32)

    const texture = new THREE.CanvasTexture(canvas)
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.95 })
    const sprite = new THREE.Sprite(spriteMat)
    sprite.position.set(0, radius + (isTopInfluencer ? 5.5 : 4.5), 0)
    sprite.scale.set(isTopInfluencer ? 28 : 22, isTopInfluencer ? 7 : 5.5, 1)
    group.add(sprite)

    return group
  }, [])

  // Detailed hover tooltip
  const nodeLabelHtml = useCallback(n => {
    const col = NODE_COLORS[n.type] || '#D97706'
    const cases = (n.reports || []).join(', ') || 'None'
    return `
      <div style="background: rgba(28, 26, 22, 0.96); border: 1px solid ${col}; border-radius: 8px; padding: 12px 16px; font-family: Inter, sans-serif; font-size: 13px; color: #F5F3EF; box-shadow: 0 10px 28px rgba(0,0,0,0.6); backdrop-filter: blur(8px); max-width: 280px;">
        <div style="font-weight: 600; color: ${col}; font-size: 15px; margin-bottom: 3px;">${n.label}</div>
        <div style="color: #A8A29E; text-transform: capitalize; font-size: 12px; margin-bottom: 8px;">Entity type: ${n.type}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; border-top: 1px solid #322E27; padding-top: 8px; margin-top: 6px; font-family: monospace; font-size: 12px;">
          <div><span style="color:#78716C">PageRank:</span> ${(n.pagerank || 0).toFixed(4)}</div>
          <div><span style="color:#78716C">Degree:</span> ${(n.degree || 0).toFixed(3)}</div>
          <div><span style="color:#78716C">Between:</span> ${(n.betweenness || 0).toFixed(3)}</div>
          <div><span style="color:#78716C">Cluster:</span> ${n.community ?? '?'}</div>
        </div>
        <div style="color: #A8A29E; font-size: 12px; margin-top: 8px; font-family: monospace;">Cases: ${cases}</div>
      </div>
    `
  }, [])

  if (!ForceGraph || rawNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#A8A29E] font-sans text-sm gap-3 p-8">
        <div className="w-8 h-8 rounded-full border-2 border-[#322E27] border-t-[#D97706] animate-spin" />
        <span className="text-center max-w-sm text-sm">
          {rawNodes.length === 0 ? 'Load sample reports or custom reports to generate the network graph' : 'Initializing force-graph engine...'}
        </span>
      </div>
    )
  }

  const containerClasses = isFullscreen
    ? 'fixed inset-0 z-50 w-screen h-screen bg-[#14120F] flex flex-col p-4'
    : 'w-full h-full relative overflow-hidden bg-[#14120F] flex flex-col'

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Clean Dedicated Top Toolbar Strip */}
      <div className="w-full px-4 py-2.5 bg-[#181613] border-b border-[#322E27] flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 select-none">
        {/* Left: Entity Type Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#1C1A16] rounded-lg border border-[#322E27] shadow-sm overflow-x-auto">
          <div className="flex items-center gap-1 text-xs font-mono text-[#A8A29E] px-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-[#D97706]" />
            <span className="hidden sm:inline">FILTER:</span>
          </div>
          {[
            { id: 'all', label: 'All', color: '#E6E2DA' },
            { id: 'person', label: 'Persons', color: NODE_COLORS.person },
            { id: 'location', label: 'Locations', color: NODE_COLORS.location },
            { id: 'vehicle', label: 'Vehicles', color: NODE_COLORS.vehicle },
            { id: 'phone', label: 'Phones', color: NODE_COLORS.phone },
            { id: 'organization', label: 'Orgs', color: NODE_COLORS.organization },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTypeFilter(tab.id)}
              className={`h-8 px-2.5 sm:px-3 text-xs font-sans rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTypeFilter === tab.id
                  ? 'bg-[#D97706]/20 text-[#FBBF24] border border-[#D97706]/50 font-semibold shadow-sm'
                  : 'text-[#A8A29E] hover:text-[#F5F3EF] hover:bg-[#24211C] border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tab.color }} />
              <span>{tab.label}</span>
              <span className="text-[11px] opacity-75 font-mono">({typeCounts[tab.id] || 0})</span>
            </button>
          ))}
        </div>

        {/* Right: Search, Reset, and Expand Controls */}
        <div className="flex items-center gap-2">
          {/* Search Input Box */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 h-9 bg-[#1C1A16] rounded-lg border border-[#322E27] focus-within:border-[#D97706]/70 shadow-sm">
              <Search className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
              <input
                type="text"
                placeholder="Find entity..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs font-sans text-[#F5F3EF] placeholder-[#78716C] outline-none w-28 sm:w-36 focus:w-44 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-[#A8A29E] hover:text-[#F5F3EF] text-xs font-sans p-0.5"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="absolute right-0 mt-1.5 w-64 bg-[#1C1A16]/98 backdrop-blur-md rounded-lg border border-[#322E27] shadow-2xl z-30 py-1 max-h-56 overflow-y-auto">
                {searchResults.map(n => (
                  <button
                    key={n.id}
                    onClick={() => {
                      focusOnNode(n)
                      setSearchQuery('')
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-sans hover:bg-[#D97706]/15 hover:text-[#FBBF24] flex items-center justify-between transition-colors border-b border-[#322E27]/40 last:border-0"
                  >
                    <span className="truncate mr-2 text-[#F5F3EF]">{n.label}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded capitalize font-medium shrink-0"
                      style={{
                        backgroundColor: `${NODE_COLORS[n.type] || '#78716C'}25`,
                        color: NODE_COLORS[n.type] || '#78716C',
                      }}
                    >
                      {n.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Camera View */}
          <button
            onClick={resetCamera}
            title="Reset view"
            className="h-9 px-3 bg-[#1C1A16] hover:bg-[#24211C] text-[#E6E2DA] hover:text-white rounded-lg border border-[#322E27] shadow-sm transition-colors flex items-center gap-1.5 text-xs font-sans font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Reset</span>
          </button>

          {/* Fullscreen / Expand Toggle Button */}
          <button
            onClick={() => setIsFullscreen(f => !f)}
            title={isFullscreen ? 'Exit fullscreen' : 'Expand full viewport'}
            className="h-9 px-3 bg-[#1C1A16] hover:bg-[#24211C] text-[#E6E2DA] hover:text-white rounded-lg border border-[#322E27] shadow-sm transition-colors flex items-center gap-1.5 text-xs font-sans font-medium"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3D Force Graph Render Container */}
      <div className="flex-1 w-full relative overflow-hidden bg-[#14120F]">
        <ForceGraph
          ref={graphRef}
          graphData={filteredData}
          nodeThreeObject={createNodeObject}
          nodeThreeObjectExtend={false}
          nodeLabel={nodeLabelHtml}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkOpacity={0.75}
          backgroundColor="#14120F"
          onNodeClick={n => setSelected(n)}
          onEngineStop={handleEngineStop}
          nodeResolution={16}
          warmupTicks={80}
          cooldownTicks={160}
          width={dimensions.width}
          height={dimensions.height}
          enableNodeDrag
        />
      </div>

      {/* Entity Details Modal */}
      {selected && (
        <Modal title={`Entity Details — ${selected.label}`} onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <Row label="Entity name" value={selected.label} />
            <Row
              label="Entity type"
              value={
                <span
                  className="px-2 py-0.5 rounded text-xs capitalize font-semibold"
                  style={{
                    backgroundColor: `${NODE_COLORS[selected.type] || '#78716C'}25`,
                    color: NODE_COLORS[selected.type] || '#78716C',
                  }}
                >
                  {selected.type}
                </span>
              }
            />
            <Row label="Associated reports" value={(selected.reports || []).join(', ') || 'None'} mono />
            <Row label="Degree centrality" value={selected.degree?.toFixed(4) || '0.0000'} mono />
            <Row label="Betweenness centrality" value={selected.betweenness?.toFixed(4) || '0.0000'} mono />
            <Row label="PageRank score" value={selected.pagerank?.toFixed(4) || '0.0000'} mono />
            <Row label="Community cluster" value={`Cluster ${selected.community ?? 'Unassigned'}`} mono />

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => focusOnNode(selected)}
                className="h-10 px-4 bg-[#D97706]/20 hover:bg-[#D97706]/30 text-[#FBBF24] border border-[#D97706]/50 rounded-lg text-xs sm:text-sm font-sans font-semibold flex items-center gap-2 transition-colors"
              >
                <Crosshair className="w-4 h-4" />
                <span>Focus in camera</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bottom Node Legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-3 pointer-events-none bg-[#1C1A16]/95 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#322E27] shadow-md text-xs">
        <span className="font-sans text-[#A8A29E] font-medium mr-1">Legend:</span>
        {Object.entries(NODE_COLORS).filter(([k]) => k !== 'unknown').map(([type, color]) => (
          <span key={type} className="flex items-center gap-1.5 font-sans text-[#E6E2DA] capitalize">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
            {type}
          </span>
        ))}
        <span className="flex items-center gap-1.5 font-sans text-[#FBBF24] pl-2 border-l border-[#322E27]">
          <span className="w-2.5 h-2.5 rounded-full border border-[#D97706] bg-[#D97706]/40 shrink-0" />
          Top influencer (halo)
        </span>
      </div>
    </div>
  )
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-[#322E27] pb-3">
      <span className="text-[#A8A29E] font-sans">{label}</span>
      <span className={`text-[#F5F3EF] ${mono ? 'font-mono text-xs' : 'font-sans'}`}>{value}</span>
    </div>
  )
}
