import React from 'react'
import { FileText, Check } from 'lucide-react'
import { SectionHeader } from '../../ui/SectionHeader'



export function TermsSection({ agreed, onToggle }) {
    return (
        <section>
            <SectionHeader
                icon={FileText}
                title="Conditions Générales"
                colorClass="text-green-600"
            />
            <div className="rounded-lg bg-slate-50 p-6 border border-slate-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Conditions générales d'utilisation</h3>
                <p className="text-xs text-gray-600 mb-3">
                    By registering as a service provider, you agree to:
                </p>
                <ul className="space-y-2 text-xs text-gray-600 list-disc pl-4 marker:text-gray-400">
                    <li>Provide accurate and truthful information</li>
                    <li>Maintain professional standards in all interactions</li>
                    <li>Comply with local laws and regulations</li>
                    <li>Respect client privacy and confidentiality</li>
                    <li>Honor all service commitments and agreements</li>
                    <li>Pay applicable platform fees and taxes</li>
                </ul>
            </div>
            <div className="mt-6 flex items-start gap-3">
                <div className="relative flex items-center h-5">
                    <input
                        id="terms"
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => onToggle(e.target.checked)}
                        className="h-5 w-5 cursor-pointer accent-purple-600 rounded border-gray-300"
                    />
                </div>
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer select-none">
                    J'ai lu et j'accepte les{' '}
                    <a href="#" className="text-[#E8524D] hover:underline font-medium">
                        Conditions d'utilisation
                    </a>{' '}
                    et la{' '}
                    <a href="#" className="text-[#E8524D] hover:underline font-medium">
                        Politique de confidentialité
                    </a>{' '}
                    <span className="text-red-500">*</span>
                </label>
            </div>
        </section>
    )
}