import React from 'react'


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
                // Empêche le clic à l'intérieur de fermer la modale
                onClick={(e) => e.stopPropagation()}
                className={`w-full  ${isWide ? 'lg:w-[60%] xl:w-[55%]' : 'lg:w-[40%] xl:w-[30%]'}  h-full flex flex-col bg-[#FAFAFB] px-4`}
            >
                {title && (
                    <header className="py-8 md:py-10 flex-shrink-0">
                        <h1 className="text-3xl font-bold text-[#0F172A]">{title}</h1>
                    </header>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] flex-1 min-h-0">
                    {/* Indicateur de scroll optionnel à gauche */}
                    {/* <div className="hidden md:flex flex-col gap-2 p-4 justify-center items-center">
                        <div className="w-1.5 h-12 bg-purple-200 rounded-full"></div>
                        <div className="w-1.5 h-12 bg-purple-700 rounded-full"></div>
                        <div className="w-1.5 h-12 bg-purple-200 rounded-full"></div>
                    </div> */}
                    {children}
                </div>
            </div>
        </div>
    )
}