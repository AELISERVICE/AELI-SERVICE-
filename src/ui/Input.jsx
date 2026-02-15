import React, { useState, useRef, useEffect } from 'react'
import { UploadCloud, ChevronDown, Check } from 'lucide-react'
import { Button } from './Button'

export function Input({
  label,
  error,
  className = '',
  type = 'text',
  options = [],
  required,
  isreadOnly,
  value,
  onChange,
  placeholder, // Assure-toi que cette prop est bien reçue
  name,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [filePreview, setFilePreview] = useState(null)
  const containerRef = useRef(null)

  const baseInputStyles = `w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 ${isreadOnly ? "cursor-default" : "focus:bg-white focus:ring-2 focus:ring-[#FCE0D6] focus:border-transparent transition-all"} outline-none text-slate-800 placeholder:text-slate-400`

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (type === 'select') {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [type])

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result); // Stocke l'URL base64 pour l'affichage
      };
      reader.readAsDataURL(file);
    }
    // On appelle toujours le onChange parent pour mettre à jour le formulaire
    if (onChange) onChange(e);
  };

  return (
    <div ref={containerRef} className={`w-full ${type === 'textarea' ? 'col-span-1 sm:col-span-2' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {/* CAS 1 : SELECT PERSONNALISÉ */}
        {type === 'select' ? (
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`${baseInputStyles} flex items-center justify-between text-left ${className}`}
            >
              {/* Correction de l'affichage du placeholder ici */}
              <span className={!value ? "text-slate-400" : "text-slate-800"}>
                {options.find(opt => opt.value === value)?.label || placeholder || "Choisir..."}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="absolute left-0 right-0 mt-2 min-w-full bg-white border border-gray-100 rounded-xl shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="p-1 max-h-[250px] overflow-y-auto">
                  {options.map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={value === opt.value ? 'filterSelected' : 'filterGhost'}
                      className="w-full !justify-between !px-3 !py-2.5 !rounded-lg !text-xs"
                      onClick={() => {
                        onChange({ target: { name, value: opt.value } });
                        setIsOpen(false);
                      }}
                    >
                      {opt.label}
                      {value === opt.value && <Check size={14} />}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : type === 'textarea' ? (
          /* CAS 2 : TEXTAREA (Ajout explicatif du placeholder) */
          <textarea
            className={`${baseInputStyles} min-h-[100px] ${className}`}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder} // Ajouté ici
            {...props}
          />
        ) : type === 'file' ? (
          /* CAS 3 : FILE */
          <div className={`group relative flex min-h-[138px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-slate-50 transition-colors hover:border-[#FCE0D6] hover:bg-white overflow-hidden ${className}`}>

            {/* AFFICHAGE DE LA PREVIEW SI ELLE EXISTE */}
            {filePreview ? (
              <div className="absolute inset-0 z-0">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="h-full w-full object-cover opacity-40 group-hover:opacity-20 transition-opacity"
                />
                <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
              </div>
            ) : null}

            {/* CONTENU DE L'INPUT (Icône + Texte) */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-2 text-center pointer-events-none">
              <div className="rounded-full bg-white p-2 shadow-sm group-hover:bg-purple-50">
                <UploadCloud className="h-6 w-6 text-gray-400 group-hover:text-[#FCE0D6]" />
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium text-[#E8524D]">
                  {filePreview ? "Changer la photo" : "Click to upload"}
                </span> or drag and drop
              </div>
              <p className="text-[10px] text-gray-400 uppercase">PNG, JPG up to 5MB</p>
            </div>

            <input
              type="file"
              name={name}
              className="absolute inset-0 z-20 cursor-pointer opacity-0"
              onChange={handleFileChange} // Utilise la fonction locale
              {...props}
            />
          </div>
        ) : (
          /* CAS PAR DÉFAUT (Ajout explicatif du placeholder) */
          <input
            type={type}
            name={name}
            className={`${baseInputStyles} ${className}`}
            value={value}
            onChange={onChange}
            placeholder={placeholder} // Ajouté ici
            {...props}
          />
        )}
      </div>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}