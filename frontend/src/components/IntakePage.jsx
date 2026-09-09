import { useState } from 'react'
import { getSampleData, processReports } from '../api'
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
  Image,
  FileCode,
  File,
} from 'lucide-react'

export default function IntakePage({ onNavigate, onProcessed }) {
  const [selectedMode, setSelectedMode] = useState('sample') // 'sample' | 'custom'
  const [reports, setReports] = useState([])
  const [customText, setCustomText] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [loadingSample, setLoadingSample] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [fileUploading, setFileUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const ACCEPTED_TYPES = {
    'text/plain': '.txt',
    'text/html': '.html',
    'text/csv': '.csv',
    'application/json': '.json',
    'application/xml': '.xml',
    'text/xml': '.xml',
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
    'image/gif': '.gif',
  }

  const ACCEPT_STRING = Object.values(ACCEPTED_TYPES).join(',') + ',' + Object.keys(ACCEPTED_TYPES).join(',')

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

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setFileUploading(true)
    setError(null)

    try {
      for (const file of files) {
        let text = ''
        const isImage = file.type.startsWith('image/')

        if (isImage) {
          // For images, store a reference note (demo — real system would run OCR)
          text = `[Image file uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB, ${file.type})]\n\nNote: In production, this image would be processed through OCR / computer vision to extract text and entities.`
        } else if (file.type === 'application/pdf') {
          text = `[PDF document uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\n\nNote: In production, this PDF would be parsed to extract full text content for entity extraction.`
        } else if (file.name.endsWith('.docx')) {
          text = `[Word document uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\n\nNote: In production, this DOCX would be parsed to extract full text content for entity extraction.`
        } else {
          // Text-based files: txt, html, csv, json, xml
          text = await file.text()
        }

        const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE'
        const newReport = {
          id: `CR-FILE-${String(reports.length + 1).padStart(3, '0')}`,
          date: new Date().toISOString().slice(0, 10),
          title: `${ext}: ${file.name}`,
          text: text,
          source: 'file',
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }
        setReports(prev => [...prev, newReport])
        setUploadedFiles(prev => [...prev, file.name])
      }
    } catch (err) {
      console.error(err)
      setError('Failed to read one or more files.')
    } finally {
      setFileUploading(false)
      // Reset input so the same file can be re-selected
      e.target.value = ''
    }
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
        <div className="page-container flex items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => onNavigate('/')}
              className="flex items-center gap-1.5 text-xs text-[#A8A29E] hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-[#24211C] border border-transparent hover:border-[#322E27]"
            >
              <ChevronLeft size={16} />
              <span>Back to home</span>
            </button>
            <div className="h-4 w-px bg-[#322E27]" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D97706]/15 border border-[#D97706]/40 flex items-center justify-center text-[#F59E0B]">
                <Network size={18} />
              </div>
              <span className="text-base font-bold text-white tracking-tight">CrimeNet</span>
              <span className="text-[10px] font-mono font-bold bg-[#24211C] text-[#D97706] border border-[#322E27] px-2 py-0.5 rounded uppercase">
                Intake Protocol
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#1C1A16] border border-[#322E27] px-3.5 py-1.5 rounded-lg text-xs font-mono text-[#A8A29E]">
            <span>STAGE:</span>
            <span className="text-[#D97706] font-semibold">DATA INTAKE</span>
          </div>
        </div>
      </header>

      {/* Main Content Area in page-container */}
      <main className="flex-1 py-16 sm:py-20 flex flex-col justify-center">
        <div className="page-container flex flex-col gap-10">
          {/* Page Title & Instruction */}
          <div className="flex flex-col items-center text-center gap-3.5 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1C1A16] border border-[#322E27] text-[#D97706] text-xs font-mono">
              <Shield size={13} />
              <span>Investigation Setup</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Add intelligence reports to begin analysis
            </h1>
            <p className="text-sm sm:text-base text-[#A8A29E] leading-relaxed max-w-2xl">
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

          {/* Two Equal Cards Grid with Full Balanced Utilization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto w-full items-stretch">
            {/* Option 1: Load Sample Data Card */}
            <div
              className={`p-7 sm:p-8 rounded-2xl border transition-all flex flex-col justify-between gap-8 relative shadow-sm ${
                selectedMode === 'sample' && reports.length > 0
                  ? 'bg-[#1C1A16] border-[#D97706] ring-1 ring-[#D97706]/40 shadow-lg shadow-[#D97706]/10'
                  : 'bg-[#1C1A16] border-[#322E27] hover:border-[#443E35]'
              }`}
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#D97706]/15 border border-[#D97706]/40 flex items-center justify-center text-[#F59E0B] shadow-sm">
                    <Database size={22} />
                  </div>
                  {selectedMode === 'sample' && reports.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs font-semibold">
                      <CheckCircle2 size={13} />
                      <span>Loaded (10 reports)</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[#D97706] bg-[#24211C] px-3 py-1 rounded-md border border-[#322E27] font-semibold">
                      RECOMMENDED
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2.5">Load sample intelligence data</h3>
                  <p className="text-sm text-[#D6D3D1] leading-relaxed">
                    Generates 10 synthetic multi-jurisdiction intelligence reports connecting Delhi, Patna, Hyderabad, and Mumbai syndicates across hawala, narcotics, and arms logistics.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-[#322E27]/80">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMode('sample')
                    handleLoadSample()
                  }}
                  disabled={loadingSample}
                  className="w-full h-12 px-5 rounded-xl bg-[#24211C] hover:bg-[#2C2822] border border-[#322E27] hover:border-[#D97706]/50 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2.5 shadow-sm"
                >
                  {loadingSample ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                      <span>Loading 10 reports...</span>
                    </>
                  ) : (
                    <>
                      <Database size={16} className="text-[#D97706]" />
                      <span>{reports.length > 0 && selectedMode === 'sample' ? 'Reload 10 synthetic reports' : 'Load 10 synthetic reports'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Option 2: Upload Custom Data Card */}
            <div
              className={`p-7 sm:p-8 rounded-2xl border transition-all flex flex-col justify-between gap-8 relative shadow-sm ${
                selectedMode === 'custom'
                  ? 'bg-[#1C1A16] border-[#D97706] ring-1 ring-[#D97706]/40 shadow-lg shadow-[#D97706]/10'
                  : 'bg-[#1C1A16] border-[#322E27] hover:border-[#443E35]'
              }`}
            >
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 flex items-center justify-center text-[#2DD4BF] shadow-sm">
                    <Upload size={22} />
                  </div>
                  {selectedMode === 'custom' && reports.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2DD4BF]/15 border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs font-semibold">
                      <CheckCircle2 size={13} />
                      <span>{reports.length} report(s) staged</span>
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[#A8A29E] bg-[#24211C] px-3 py-1 rounded-md border border-[#322E27] font-semibold">
                      CUSTOM INTAKE
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-2.5">Upload your own reports</h3>
                  <p className="text-sm text-[#D6D3D1] leading-relaxed">
                    Paste unstructured investigation narratives, FIR entries, or surveillance notes to extract named entities and link topology.
                  </p>
                </div>

                {selectedMode === 'custom' && (
                  <div className="flex flex-col gap-3.5 pt-2 animate-fade-in">
                    <input
                      type="text"
                      placeholder="Case title (e.g. Hawala Transfer Intercept #4)"
                      value={customTitle}
                      onChange={e => setCustomTitle(e.target.value)}
                      className="w-full h-11 bg-[#24211C] border border-[#322E27] rounded-xl px-3.5 text-sm font-sans text-white placeholder-[#78716C] focus:outline-none focus:border-[#D97706]"
                    />
                    <textarea
                      rows={4}
                      placeholder="Paste investigative narrative text with suspects, phone numbers, locations..."
                      value={customText}
                      onChange={e => setCustomText(e.target.value)}
                      className="w-full bg-[#24211C] border border-[#322E27] rounded-xl p-3 text-sm font-sans text-white placeholder-[#78716C] focus:outline-none focus:border-[#D97706] resize-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomReport}
                      disabled={!customText.trim()}
                      className="w-full h-11 rounded-xl bg-[#D97706]/20 hover:bg-[#D97706]/30 text-[#FBBF24] border border-[#D97706]/40 text-xs font-semibold disabled:opacity-40 transition-colors"
                    >
                      + Stage this report
                    </button>

                    {/* File Upload Section */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex-1 h-px bg-[#322E27]" />
                      <span className="text-[11px] text-[#78716C] font-medium">OR UPLOAD FILES</span>
                      <div className="flex-1 h-px bg-[#322E27]" />
                    </div>

                    <label
                      className={`group relative flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                        fileUploading
                          ? 'border-[#D97706] bg-[#D97706]/5'
                          : 'border-[#322E27] hover:border-[#D97706]/50 hover:bg-[#24211C]/60'
                      }`}
                    >
                      <input
                        type="file"
                        multiple
                        accept={ACCEPT_STRING}
                        onChange={handleFileUpload}
                        className="sr-only"
                        disabled={fileUploading}
                      />
                      {fileUploading ? (
                        <>
                          <span className="w-6 h-6 border-2 border-[#D97706] border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-[#D97706] font-medium">Processing files...</span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-[#A8A29E] group-hover:text-[#D97706] transition-colors">
                            <Upload size={18} />
                            <span className="text-sm font-medium">Click to upload or drag & drop</span>
                          </div>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {[
                              { icon: FileText, label: 'TXT' },
                              { icon: FileCode, label: 'HTML' },
                              { icon: File, label: 'PDF' },
                              { icon: File, label: 'DOCX' },
                              { icon: FileText, label: 'CSV' },
                              { icon: FileCode, label: 'JSON' },
                              { icon: FileCode, label: 'XML' },
                              { icon: Image, label: 'Images' },
                            ].map(f => (
                              <span
                                key={f.label}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#24211C] border border-[#322E27] text-[10px] text-[#A8A29E] font-mono"
                              >
                                <f.icon size={10} />
                                {f.label}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </label>

                    {/* Uploaded files list */}
                    {uploadedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {uploadedFiles.map((name, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[11px] text-[#2DD4BF] font-medium"
                          >
                            <CheckCircle2 size={11} />
                            <span className="truncate max-w-[140px]">{name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selectedMode !== 'custom' && (
                <div className="pt-6 border-t border-[#322E27]/80">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('custom')}
                    className="w-full h-12 px-5 rounded-xl bg-[#24211C] hover:bg-[#2C2822] border border-[#322E27] text-sm font-semibold text-[#A8A29E] hover:text-white transition-all flex items-center justify-center gap-2.5 shadow-sm"
                  >
                    <FileText size={16} />
                    <span>Switch to custom report input</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-7 rounded-2xl bg-[#1C1A16] border border-[#322E27] shadow-lg">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${reports.length > 0 ? 'bg-[#2DD4BF] animate-pulse' : 'bg-[#78716C]'}`} />
              <div>
                <div className="text-base font-semibold text-white">
                  {reports.length > 0
                    ? `${reports.length} report(s) staged and ready for graph analysis`
                    : 'No intelligence reports loaded yet'}
                </div>
                <div className="text-xs sm:text-sm text-[#A8A29E] mt-1">
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
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-[#14120F] font-bold text-sm transition-all shadow-md hover:shadow-[#D97706]/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shrink-0 group select-none"
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
      <footer className="border-t border-[#322E27] py-8 text-center text-xs text-[#78716C] bg-[#100E0C]">
        <div className="page-container">
          CrimeNet · Law Enforcement Multi-Agency Intake System · MHA / NCRB Standard
        </div>
      </footer>
    </div>
  )
}
