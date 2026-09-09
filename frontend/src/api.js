import mockData from './mockData.json'

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

let simulatedTipIndex = 0

const req = async (method, path, body) => {
  try {
    const opts = { method, headers: { 'Content-Type': 'application/json' } }
    if (body) opts.body = JSON.stringify(body)
    
    // Add a reasonable timeout for fast fallback if server is down
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    opts.signal = controller.signal

    const res = await fetch(BASE + path, opts)
    clearTimeout(timeoutId)
    if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn(`[CrimeNet API] Backend unreachable at ${BASE}${path}. Using client-side demo fallback.`, err)
    return fallbackResponse(method, path, body)
  }
}

function fallbackResponse(method, path, body) {
  if (path === '/sample-data') {
    return { reports: mockData.reports }
  }

  if (path === '/process') {
    return mockData.processResult
  }

  if (path === '/graph') {
    return mockData.processResult.graph
  }

  if (path === '/influencers') {
    return { influencers: mockData.influencers }
  }

  if (path === '/alerts') {
    return { alerts: mockData.alerts }
  }

  if (path === '/brief') {
    return mockData.brief
  }

  if (path === '/geo') {
    return { locations: mockData.locations }
  }

  if (path === '/query') {
    const q = (body?.question || '').toLowerCase()
    if (q.includes('connect') || q.includes('link') || q.includes('bridge')) {
      return {
        question: body?.question,
        answer: "The shortest connection runs through 1 intermediate node: Arjun Mehta → Red Crescent Syndicate → Kabir Ansari. This suggests a 2-hop indirect syndicate link across jurisdictions."
      }
    }
    if (q.includes('influential') || q.includes('top') || q.includes('suspect') || q.includes('key')) {
      return {
        question: body?.question,
        answer: "The top influential entities are: Red Crescent Syndicate (organization), Rajan Verma (person), and Arjun Mehta (person). Rajan Verma acts as a critical cross-domain broker with high betweenness centrality."
      }
    }
    return {
      question: body?.question,
      answer: "Rajan Verma (person) appears in 4 case(s): RPT-003, RPT-005, RPT-006, RPT-010. Connected to: Imran Qureshi, BlueShield Logistics, Priya Sharma. High-risk cross-case broker."
    }
  }

  if (path === '/simulate-tip') {
    simulatedTipIndex++
    const isEven = simulatedTipIndex % 2 === 1
    const newTip = isEven ? {
      id: "TIP-001",
      title: "Emergency Tip-off: New Courier Identified",
      date: "2025-01-02",
      text: "An informer reported that a new courier named Vikram Das was seen meeting Arjun Mehta near Bandra, Mumbai. Vikram Das was traveling in vehicle MH-04-ST-1122 and was in contact via phone 9920034567."
    } : {
      id: "TIP-002",
      title: "Emergency Tip-off: New Shell Company",
      date: "2025-01-03",
      text: "Financial intelligence unit flagged a new entity, DarkStar Holdings, linked to BlueShield Logistics. A person named Zara Khan is listed as director. Contact number 9876543210."
    }

    const updatedGraph = JSON.parse(JSON.stringify(mockData.processResult.graph))
    const newNodeId = isEven ? "person::Vikram Das" : "organization::DarkStar Holdings"
    const newLabel = isEven ? "Vikram Das" : "DarkStar Holdings"
    const newType = isEven ? "person" : "organization"

    if (!updatedGraph.nodes.some(n => n.id === newNodeId)) {
      updatedGraph.nodes.push({
        id: newNodeId,
        label: newLabel,
        type: newType,
        reports: [newTip.id],
        weight: 2,
        community: 0,
        degree: 0.05,
        betweenness: 0.06,
        pagerank: 0.04
      })
      updatedGraph.links.push({
        source: newNodeId,
        target: isEven ? "person::Arjun Mehta" : "organization::BlueShield Logistics",
        weight: 1,
        reports: [newTip.id]
      })
    }

    return {
      tip: newTip,
      extraction: {
        report_id: newTip.id,
        persons: isEven ? ["Vikram Das"] : ["Zara Khan"],
        locations: isEven ? ["Bandra", "Mumbai"] : ["Delhi"],
        organizations: isEven ? [] : ["DarkStar Holdings", "BlueShield Logistics"],
        phones: isEven ? ["9920034567"] : ["9876543210"],
        vehicles: isEven ? ["MH-04-ST-1122"] : []
      },
      graph: updatedGraph
    }
  }

  return {}
}

export const getSampleData = () => req('GET', '/sample-data')
export const processReports = (reports) => req('POST', '/process', { reports })
export const getGraph = () => req('GET', '/graph')
export const getInfluencers = () => req('GET', '/influencers')
export const getAlerts = () => req('GET', '/alerts')
export const queryNetwork = (question) => req('POST', '/query', { question })
export const getBrief = () => req('GET', '/brief')
export const simulateTip = () => req('POST', '/simulate-tip')
export const getGeo = () => req('GET', '/geo')
