import React from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'


export function ModalCard({
    title = false,
    children,
    closeModal,
    isWide = false
}) {
    return (
        <div
            onClick={() => closeModal()}
            className="fixed w-full bg-black/60 backdrop-blur-sm h-screen flex flex-col z-20 "
        >
            <div
                // Empêche le clic à l'intérieur de fermer la modale ${isWide ? 'lg:w-[60%] xl:w-[55%]' : 'lg:w-[40%] xl:w-[30%]'} 
                onClick={(e) => e.stopPropagation()}
                className={`w-fit   h-full flex flex-col bg-[#FAFAFB] px-4`}
            >
                {title && (
                    <header className="py-6 md:py-10 flex-shrink-0">
                        <h1 className="text-3xl font-bold text-[#0F172A]">{title}</h1>
                        <Button
                            variant="close"
                            size="none"
                            isCircle={true}
                            onClick={closeModal}
                            className="md:hidden absolute top-5 right-4 z-10 p-2"
                            aria-label="Fermer"
                        >
                            <X size={24} />
                        </Button>
                    </header>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] flex-1 min-h-0">
                    {children}
                </div>
            </div>
        </div>
    )
}