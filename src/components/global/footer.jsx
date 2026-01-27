import React from "react"
import { Twitter, Instagram, Globe, Github } from "lucide-react"

export function Footer() {
    return (
        <div className="mt-12 mb-8 flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-6">
                <a
                    href="#"
                    className="text-slate-400 hover:text-purple-600 transition-colors"
                >
                    <Twitter className="w-5 h-5" />
                </a>
                <a
                    href="#"
                    className="text-slate-400 hover:text-purple-600 transition-colors"
                >
                    <Instagram className="w-5 h-5" />
                </a>
                <a
                    href="#"
                    className="text-slate-400 hover:text-purple-600 transition-colors"
                >
                    <Globe className="w-5 h-5" />
                </a>
            </div>
            <p className="text-xs text-slate-400">
                Copyright © 2026 - AELI Service
            </p>
        </div>
    )
}