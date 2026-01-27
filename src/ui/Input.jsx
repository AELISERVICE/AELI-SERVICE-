import React from 'react'
import { UploadCloud } from 'lucide-react'

export function Input({
  label,
  error,
  className = '',
  type = 'text',
  options,
  required,
  ...props
}) {
  const baseInputStyles = `w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-[#FCE0D6] focus:border-transparent transition-all outline-none text-slate-800 placeholder:text-slate-400`

  return (
    <div className={`w-full ${type === 'textarea' ? 'col-span-1 sm:col-span-2' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* CAS 1 : SELECT */}
        {type === 'select' && (
          <select className={`${baseInputStyles} appearance-none ${className}`} {...props}>
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* CAS 2 : TEXTAREA */}
        {type === 'textarea' && (
          <textarea
            className={`${baseInputStyles} min-h-[100px] ${className}`}
            {...props}
          />
        )}

        {/* CAS 3 : FILE (UPLOAD PHOTO) */}
        {type === 'file' && (
          <div className={`group relative flex min-h-[138px] ${className} cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-slate-50 transition-colors hover:border-purple-400 hover:bg-white`}>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="rounded-full bg-white p-2 shadow-sm group-hover:bg-purple-50">
                <UploadCloud className="h-6 w-6 text-gray-400 group-hover:text-purple-500" />
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium text-purple-600">Click to upload</span> or drag and drop
              </div>
              <p className="text-[10px] text-gray-400 uppercase">PNG, JPG up to 5MB</p>
            </div>
            <input type="file" className="absolute inset-0 cursor-pointer opacity-0" {...props} />
          </div>
        )}

        {/* CAS PAR DÉFAUT : INPUT (text, email, tel, etc.) */}
        {type !== 'select' && type !== 'textarea' && type !== 'file' && (
          <input type={type} className={`${baseInputStyles} ${className}`} {...props} />
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}