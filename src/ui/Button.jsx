import React from 'react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary:
      'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 shadow-sm hover:shadow-md',
    secondary:
      'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus:ring-gray-200',
    gradient:
      'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:opacity-90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
    ghost: 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
