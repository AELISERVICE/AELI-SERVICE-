import React from 'react'
import { Search, Bell, User } from 'lucide-react';
import { Button } from '../../ui/Button';

export function Header({ onMenuClick, title, subtitle }) {
    return (
        <header className=" p-4 lg:p-8 z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        size={false}
                        onClick={onMenuClick}
                        className=" lg:hidden relative p-2.5 shadow-sm "
                    >

                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </Button>
                    <div>

                    </div>
                    <div>
                        <h1 className="text-2xl text-gray-700 font-bold lg:pacifico-regular">{title}</h1>
                        <p >{subtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative  w-full block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Type here..."
                            className="pl-10 pr-4 py-[10px] rounded-md bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300  w-full md:w-64 shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size={false}
                            className="relative p-2.5 shadow-sm "
                        >
                            <Bell className="w-5 h-5 text-gray-500" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </Button>
                    </div>
                </div>
            </div>
        </header >
    )
}
