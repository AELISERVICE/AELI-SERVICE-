import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
export function Pagination() {
  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200">
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8524D]/20 text-[#E8524D] font-medium transition-colors">
        1
      </button>

      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-gray-500 hover:bg-gray-100 transition-colors">
        2
      </button>

      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-gray-500 hover:bg-gray-100 transition-colors">
        3
      </button>

      <span className="px-2 text-gray-400">...</span>

      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-gray-500 hover:bg-gray-100 transition-colors">
        15
      </button>

      <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8524D] text-white transition-colors hover:bg-[#FCE0D6] hover:text-[#E8524D] shadow-lg shadow-purple-200">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
