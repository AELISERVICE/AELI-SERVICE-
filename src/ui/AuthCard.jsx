import React from 'react'
import { Footer } from '../components/global/footer'

export function AuthCard({ 
    title, 
    subtitle, 
    headerTitle, 
    headerSubtitle, 
    children,
    isWide = false // Par défaut, on utilise la version étroite
}) {
    return (
        <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-100 via-slate-50 to-white opacity-60"></div>

            <div className="flex flex-col items-center justify-center min-h-screen w-full">
                <main className="w-full px-4 py-4 flex flex-col items-center ">
                    {/* Header Section */}
                    <div className="w-full bg-slate-700 rounded-3xl min-h-[400px] p-8 pb-32 md:pb-48 text-center relative overflow-hidden shadow-lg">
                        <img
                            src="https://img.freepik.com/photos-gratuite/gros-plan-deux-jeunes-femmes-africaines-gaies-ordinateur-portable_181624-43845.jpg?semt=ais_user_personalization&w=740&q=80"
                            alt="Background"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{headerTitle}</h1>
                            <p className="text-slate-300 text-sm md:text-base max-w-md mx-auto">{headerSubtitle}</p>
                        </div>
                    </div>

                    {/* Floating Card dynamique */}
                    <div className={`
                        w-full bg-white rounded-2xl shadow-xl -mt-24 md:-mt-50 relative z-20 p-6 md:p-10 lg:p-12 border border-slate-100 transition-all duration-300
                        ${isWide ? 'max-w-4xl' : 'max-w-4xl lg:max-w-[500px]'}
                    `}>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
                            <p className="text-slate-500 text-sm">{subtitle}</p>
                        </div>
                        {children}
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    )
}