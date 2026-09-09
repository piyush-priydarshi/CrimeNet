import { useState } from 'react'
import { getSampleData, processReports } from '../api'
import { Btn, Spinner, Input } from './ui'
import {
  Database,
  Upload,
  ArrowRight,
  Shield,
  FileText,
  CheckCircle2,
  AlertCircle,
  Network,
  ChevronLeft,
} from 'lucide-react'

export default function IntakePage({ onNavigate, onProcessed }) {
  const [selectedMode, setSelectedMode] = useState('sample') // 'sample' | 'custom'
  const [reports, setReports] = useState([])
  const [customText, setCustomText] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [loadingSample, setLoadingSample] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)

  const handleLoadSample = async () => {
    setLoadingSample(true)
    setError(null)
    try {
      const data = await getSampleData()
      setReports(data.reports || [])
      setSelectedMode('sample')
    } catch (err) {
      console.error(err)
      setError('Failed to load sample reports from backend.')
    } finally {
      setLoadingSample(false)
    }
  }

  const handleAddCustomReport = () => {
    if (!customText.trim()) return
    const newReport = {
      id: `CR-CUSTOM-${String(reports.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().slice(0, 10),
      title: customTitle.trim() || `Field Report ${reports.length + 1}`,
      text: customText.trim(),
    }
    setReports(prev => [...prev, newReport])
    setCustomText('')
    setCustomTitle('')
  }

  const handleProceed = async () => {
    if (reports.length === 0) return
    setProcessing(true)
    setError(null)
    try {
      const result = await processReports(reports)
      onProcessed(result)
      onNavigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError('Failed to process reports and build intelligence graph.')
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#14120F] text-[#E6E2DA] flex flex-col font-sans selection:bg-[#D97706]/30 selection:text-[#FBBF24]">
      {/* Header (Fixed 64px height, standard page-container) */}
      <header className="border-b border-[#322E27] bg-[#1C1A16]/95 backdrop-blur-md sticky top-0 z-40 h-16 shrink-0 flex items-center">
        <div className="page-container flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-1.5 text-xs text-[#A8A29E] hover:text-[#F5F3EF] transition-colors p-1.5 rounded-lg hover:bg-[#24211C]"
            >
              <ChevronLeft size={16} />
              <span>Back to home</span>
            </button>
            <div className="h-4 w-px bg-[#322E27]" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D97706]/15 border border-[#D97706]/40 flex items-center justify-center text-[#F59E0B]">
                <Network size={18} />
              </div>
              <span className="text-base font-bold text-[#F5F3EF]">CrimeNet AI</span>
              <span className="text-[10px] font-mono font-bold bg-[#24211C] text-[#D97706] border border-[#322E27] px-1.5 py-0.5 rounded uppercase">
                Intake Protocol
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#1C1A16] border border-[#322E27] px-3 py-1.5 rounded-lg text-xs font-mono text-[#A8A29E]">
            <span>STAGE:</span>
            <span className="text-[#D97706] font-semibold">DATA INTAKE</span>
          </div>
        </div>
      </header>

      {/* Main Content Area in page-container */}
      <main className="flex-1 py-12 sm:py-16 flex flex-col justify-center">
        <div className="page-container space-y-8">
          {/* Page Title & Instruction */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1A16] border border-[#322E27] text-[#D97706] text-xs font-mono">
              <Shield size={13} />
              <span>Investigation Setup</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F3EF] tracking-tight">
              Add intelligence reports to begin analysis
            </h1>
            <p className="text-sm sm:text-base text-[#A8A29E] leading-relaxed">
              Choose whether to load verified multi-jurisdictional synthetic case datasets or input your own field intelligence reports.
            </p>
          </div>

          {/* Error banner if any */}
          {error && (
            <div className="p-4 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-xs flex items-center gap-2.5 max-w-3xl mx-auto w-full">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Two Equal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
            {/* Option 1: Load Sample Data Card */}
            <div
              onClick={() => {
                setSelectedMode('sample')
                if (reports.length === 0) handleLoadSample()
              }}
              className={`p-6 sm:p-8 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative shadow-sm ${
                selectedMode === 'sample' && reports.length > 0
                  ? 'bg-[#1C1A16] border-[#D97706] ring-1 ring-[#D97706]/40 shadow-lg shadow-[#D97706]/10'
                  : 'bg-[#1C1A16] border-[#322E27] hover:border-[#443E35]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#D97706]/15 border border-[#D97706]/40 flex items-center justify-center text-[#F59E0B]">
                    <Database size={22} />
                  </div>
                  {selectedMode === 'sample' && reports.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs font-medium">
                      <CheckCircle2 size={13} />
                      <span>Loaded (10 reports)</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[#A8A29E] bg-[#24211C] px-2.5 py-1 rounded-md border border-[#322E27]">
                      Recommended
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#F5F3EF] mb-2">Load sample data</h3>
                  <p className="text-sm text-[#A8A29E] leading-relaxed">
                    Generates 10 synthetic multi-jurisdiction intelligence reports connecting Delhi, Patna, Hyderabad, and Mumbai syndicates across hawala, narcotics, and arms logistics.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-[#322E27]">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLoadSample()
                  }}
                  disabled={loadingSample}
                  className="w-full h-10 px-4 rounded-lg bg-[#24211C] hover:bg-[#2C2822] border border-[#322E27] text-sm font-semibold text-[#F5F3EF] transition-all flex items-center justify-center gap-2"
                >
                  {loadingSample ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                      <span>Loading 10 reports...</span>
                    </>
                  ) : (
                    <>
                      <Database size={15} className="text-[#D97706]" />
                      <span>{reports.length > 0 && selectedMode === 'sample' ? 'Reload 10 synthetic reports' : 'Load 10 synthetic reports'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Option 2: Upload Custom Data Card */}
            <div
              onClick={() => setSelectedMode('custom')}
              className={`p-6 sm:p-8 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative shadow-sm ${
                selectedMode === 'custom'
                  ? 'bg-[#1C1A16] border-[#D97706] ring-1 ring-[#D97706]/40 shadow-lg shadow-[#D97706]/10'
                  : 'bg-[#1C1A16] border-[#322E27] hover:border-[#443E35]'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF]">
                    <Upload size={22} />
                  </div>
                  {selectedMode === 'custom' && reports.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs font-medium">
                      <CheckCircle2 size={13} />
                      <span>{reports.length} report(s) staged</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[#A8A29E] bg-[#24211C] px-2.5 py-1 rounded-md border border-[#322E27]">
                      Custom intake
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#F5F3EF] mb-2">Upload your own reports</h3>
                  <p className="text-sm text-[#A8A29E] leading-relaxed">
                    Paste unstructured investigation narratives, FIR entries, or surveillance notes to extract named entities and link topology.
                  </p>
                </div>

                {selectedMode === 'custom' && (
                  <div className="space-y-3 pt-2 animate-fade-in" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      placeholder="Case title (e.g. Hawala Transfer Intercept #4)"
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                      className="w-full h-10 bg-[#24211C] border border-[#322E27] rounded-lg px-3.5 text-sm font-sans text-[#F5F3EF] placeholder-[#78716C] focus:outline-none focus:border-[#D97706]"
                    />
                    <textarea
                      rows={4}
                      placeholder="Paste investigative narrative text with suspects, phone numbers, locations..."
                      value={customText}
                      onChange={e => setCustomText(e.target.value)}
                      className="w-full bg-[#24211C] border border-[#322E27] rounded-lg p-3 text-sm font-sans text-[#F5F3EF] placeholder-[#78716C] focus:outline-none focus:border-[#D97706] resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomReport}
                      disabled={!customText.trim()}
                      className="w-full h-10 rounded-lg bg-[#D97706]/20 hover:bg-[#D97706]/30 text-[#FBBF24] border border-[#D97706]/40 text-xs font-semibold disabled:opacity-40 transition-colors"
                    >
                      + Stage this report
                    </button>
                  </div>
                )}
              </div>

              {selectedMode !== 'custom' && (
                <div className="pt-6 mt-6 border-t border-[#322E27]">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('custom')}
                    className="w-full h-10 px-4 rounded-lg bg-[#24211C] hover:bg-[#2C2822] border border-[#322E27] text-sm font-semibold text-[#A8A29E] hover:text-[#F5F3EF] transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={15} />
                    <span>Switch to custom report input</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-xl bg-[#1C1A16] border border-[#322E27] shadow-md">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className={`w-3 h-3 rounded-full shrink-0 ${reports.length > 0 ? 'bg-[#2DD4BF] animate-pulse' : 'bg-[#78716C]'}`} />
              <div>
                <div className="text-sm font-semibold text-[#F5F3EF]">
                  {reports.length > 0
                    ? `${reports.length} report(s) ready for graph analysis`
                    : 'No intelligence reports loaded'}
                </div>
                <div className="text-xs text-[#A8A29E] mt-0.5">
                  {reports.length > 0
                    ? 'Click proceed to extract entities, map relationships, and launch dashboard.'
                    : 'Click "Load 10 synthetic reports" above to stage intelligence data.'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceed}
              disabled={reports.length === 0 || processing}
              className="w-full sm:w-auto h-11 px-8 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-[#14120F] font-bold text-sm transition-all shadow-md hover:shadow-[#D97706]/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 group"
            >
              {processing ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#14120F] border-t-transparent rounded-full animate-spin" />
                  <span>Processing & building graph...</span>
                </>
              ) : (
                <>
                  <span>Proceed to analysis</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#322E27] py-6 text-center text-xs text-[#78716C] bg-[#100E0C]">
        <div className="page-container">
          CrimeNet AI · Law Enforcement Multi-Agency Intake System · MHA / NCRB Standard
        </div>
      </footer>
    </div>
  )
}
