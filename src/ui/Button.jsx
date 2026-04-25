import React from 'react'

const VARIANT_CLASSES = {
    icon: 'relative p-3 rounded-full bg-[#E8524D] hover:bg-[#E8524D] active:scale-95 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl cursor-pointer focus:outline-none ring-4 ring-red-300',
    gradient: 'flex items-center gap-2 bg-gradient-to-r from-[#E8524D] to-[#FCE0D6] text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 shadow-md shadow-purple-200',
}

export function Button({
    variant = 'gradient',
    className = '',
    type = 'button',
    ...props
}) {
    const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.gradient
    return <button type={type} className={`${variantClass} ${className}`} {...props} />
}
