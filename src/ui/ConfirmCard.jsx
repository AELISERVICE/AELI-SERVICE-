import React from 'react'
import { TriangleAlert } from 'lucide-react'


export function ConfirmCard(
    Question,
    werning,
    actions
) {
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="w-full max-w-[400px] bg-white rounded-2xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300"
        >
            <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-4 text-gray-900">
                    <TriangleAlert className="w-12 h-12 stroke-[1.5]" />
                </div>

                {/* Text Content */}
                <h2 id="modal-title" className="text-xl font-bold text-gray-900 mb-2">
                    {Question}
                </h2>

                <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-[280px]">
                    {werning}
                </p>

                {/* Action Buttons */}
                <div className="flex w-full gap-3">
                    {actions && actions[0]}
                    {actions && actions[1]}
                </div>
            </div>
        </div>

    )
}
