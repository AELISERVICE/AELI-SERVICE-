export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-bold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]'

  const variants = {
    primary: 'bg-[#FCE0D6] text-[#E8524D] hover:bg-[#E8524D] hover:text-white shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    gradient: 'bg-gradient-to-r from-[#8B5CF6] to-[#FCE0D6] text-white hover:shadow-lg border-none',
    softRed: 'bg-[#E8524D] text-white hover:bg-[#FCE0D6] hover:text-[#E8524D]',
    whatsapp: 'bg-[#22C55E] text-white hover:bg-[#16A34A]',
    phone: 'bg-[#3B82F6] text-white hover:bg-[#2563EB]',
    outline: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-200',
    danger: 'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-red-500 shadow-sm',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-50 justify-start',
    ghostDanger: 'bg-transparent text-red-600 hover:bg-red-50 justify-start'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-base',
  }

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}