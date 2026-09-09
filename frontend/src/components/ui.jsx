// Shared UI primitives — Card, Panel, Badge, Modal, Spinner, Btn, Input

export function Card({ children, className = '', glow = false }) {
  return (
    <div
      className={`bg-[#1C1A16] border border-[#322E27] rounded-xl p-5 sm:p-6 flex flex-col transition-all duration-200 ${
        glow ? 'border-[#D97706]/60 shadow-[0_0_15px_rgba(217,119,6,0.15)]' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function Panel({ title, icon, children, className = '', action }) {
  return (
    <div className={`bg-[#1C1A16] border border-[#322E27] rounded-xl flex flex-col overflow-hidden shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#322E27] min-h-[56px] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <span className="text-[#D97706] shrink-0">{icon}</span>}
          <h3 className="font-sans text-sm sm:text-base font-semibold text-[#F5F3EF] truncate">{title}</h3>
        </div>
        {action && <div className="shrink-0 ml-4">{action}</div>}
      </div>
      <div className="flex-1 overflow-auto p-5 sm:p-6">{children}</div>
    </div>
  )
}

const BADGE_STYLES = {
  person: 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30',
  location: 'bg-[#2DD4BF]/15 text-[#2DD4BF] border-[#2DD4BF]/30',
  vehicle: 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]/30',
  phone: 'bg-[#A78BFA]/15 text-[#A78BFA] border-[#A78BFA]/30',
  organization: 'bg-[#FB7185]/15 text-[#FB7185] border-[#FB7185]/30',
  CRITICAL: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40 font-bold',
  HIGH: 'bg-[#D97706]/15 text-[#F59E0B] border-[#D97706]/40 font-bold',
  MEDIUM: 'bg-[#24211C] text-[#A8A29E] border-[#322E27]',
  default: 'bg-[#24211C] text-[#E6E2DA] border-[#322E27]',
}

export function Badge({ label, type = 'default' }) {
  const cls = BADGE_STYLES[type] || BADGE_STYLES.default
  const isStatus = type === 'CRITICAL' || type === 'HIGH' || type === 'MEDIUM'
  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs border whitespace-nowrap ${
        isStatus ? 'font-mono font-bold tracking-wide uppercase' : 'font-sans font-medium'
      } ${cls}`}
    >
      {label}
    </span>
  )
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-2 border-[#322E27] border-t-[#D97706] rounded-full animate-spin" />
    </div>
  )
}

export function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#1C1A16] border border-[#322E27] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#322E27] min-h-[56px] shrink-0">
          <h3 className="font-sans text-base font-semibold text-[#F5F3EF]">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A8A29E] hover:text-[#F5F3EF] hover:bg-[#24211C] transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}

const BTN_SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2.5',
  icon: 'h-10 w-10 p-0 text-sm',
  'icon-sm': 'h-8 w-8 p-0 text-xs',
}

const BTN_VARIANTS = {
  primary:
    'bg-[#D97706] hover:bg-[#B45309] text-[#14120F] font-semibold border border-[#D97706] shadow-sm hover:shadow-[#D97706]/20',
  secondary:
    'bg-[#24211C] hover:bg-[#2C2822] text-[#E6E2DA] hover:text-[#F5F3EF] border border-[#322E27] hover:border-[#443E35]',
  ghost:
    'bg-transparent hover:bg-[#24211C] text-[#A8A29E] hover:text-[#F5F3EF] border border-transparent hover:border-[#322E27]',
  danger:
    'bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/40 font-semibold',
  teal:
    'bg-[#2DD4BF]/15 hover:bg-[#2DD4BF]/25 text-[#2DD4BF] border border-[#2DD4BF]/40 font-semibold',
  icon:
    'bg-[#24211C] hover:bg-[#2C2822] text-[#A8A29E] hover:text-[#F5F3EF] border border-[#322E27]',
}

export function Btn({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  title = '',
  type = 'button',
}) {
  const sizeCls = BTN_SIZES[size] || BTN_SIZES.md
  const varCls = BTN_VARIANTS[variant] || BTN_VARIANTS.primary

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center justify-center rounded-lg font-sans font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed select-none whitespace-nowrap shrink-0 ${sizeCls} ${varCls} ${className}`}
    >
      {children}
    </button>
  )
}

export function Input({
  value,
  onChange,
  onKeyDown,
  placeholder = '',
  disabled = false,
  className = '',
  type = 'text',
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      className={`h-10 px-3.5 bg-[#1C1A16] border border-[#322E27] rounded-lg text-sm font-sans text-[#F5F3EF] placeholder-[#78716C] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] transition-colors disabled:opacity-40 w-full ${className}`}
    />
  )
}

