const BASE = 'http://localhost:8000'

const req = async (method, path, body) => {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(BASE + path, opts)
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}`)
  return res.json()
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
