import React from 'react'


export function FormCard({
    children,
    title,
    subtitle,
    gradientFrom = "from-purple-600",
    gradientTo = "to-[#FCE0D6]",
}) {
    return (
        <div className="min-h-screen w-full p-4 sm:p-6 md:p-8 font-sans relative">

            {/* --- LE DÉGRADÉ MESH (Fixé en arrière-plan) --- */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] -left-[5%] w-[350px] h-[350px] bg-purple-500/30 rounded-full blur-[100px]" />
                <div className="absolute top-[5%] -right-[5%] w-[400px] h-[400px] bg-yellow-200/40 rounded-full blur-[110px]" />
                <div className="absolute bottom-[20%] left-[30%] w-[300px] h-[300px] bg-blue-100/60 rounded-full blur-[90px]" />
            </div>

            {/* --- LA CARTE --- */}
            <div className="relative z-10 mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/5">

                {/* Header Banner */}
                <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} px-6 py-8 sm:px-10`}>
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-2 text-purple-100">
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* Contenu du formulaire injecté ici */}
                <div className="p-6 sm:p-8 md:p-10">
                    {children}
                </div>
            </div>
        </div>
    )
}