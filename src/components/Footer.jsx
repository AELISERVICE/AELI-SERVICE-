import React from 'react'
import { Instagram, Linkedin, Github } from 'lucide-react'
const XIcon = () => (
    <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 fill-current text-gray-900 hover:text-gray-600 transition-colors"
        aria-hidden="true"
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
)
const GraphyLogo = () => (
    <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
    >
        <rect width="24" height="24" rx="5" fill="#09090B" />
        <path
            d="M7 13L11 9M7 17L17 7M13 17L17 13"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
        />
    </svg>
)
export function Footer() {
    return (
        <div className="relative w-full flex flex-col items-center pt-0 overflow-hidden z-0 bg-white min-h-screen">
            {/* CTA Section */}
            <section className="w-[calc(100%-2rem)] max-w-7xl mx-auto rounded-[2.5rem] bg-black relative overflow-hidden py-24 md:py-32 px-6 text-center flex flex-col items-center justify-center shadow-2xl">
                {/* Radial Gradient Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(0,0,0,1)_80%,rgba(232,_82,_77,_1))] pointer-events-none"></div>

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10 tracking-tight">
                    Ready to transform your data?
                </h2>
                <p className="text-gray-400 text-base md:text-lg max-w-2xl mb-10 relative z-10">
                    Join thousands of data-driven professionals who are creating
                    <br className="hidden md:block" /> beautiful visualizations in
                    minutes.
                </p>
                <button className="bg-white text-black font-semibold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors relative z-10 shadow-sm">
                    Start for free
                </button>
            </section>

            {/* Background Watermark */}
            <div className="absolute bottom-[-19%]  left-1/2 -translate-x-1/2 text-[22vw] font-bold text-[#f5f5f5] leading-none select-none pointer-events-none z-0 whitespace-nowrap tracking-tighter">
                AELI SERVICES
            </div>
        </div>
    )
}
