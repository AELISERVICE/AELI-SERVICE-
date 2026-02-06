import React from 'react';


export const Input = ({ icon: Icon, className = "", ...props }) => {
    return (
        <div className="relative w-full group">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors">
                    <Icon size={18} />
                </div>
            )}
            <input
                className={`w-full bg-white border border-slate-200 rounded-xl py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-50 transition-all duration-200 ${className}`}
                {...props}
            />
        </div>
    );
};



export const ReadOnlyField = ({ label, value, fullWidth }) => (
    <div className={fullWidth ? 'col-span-1 md:col-span-2' : 'col-span-1'}>
        <label className="block text-sm font-medium text-gray-500 mb-1.5">{label}</label>
        <div className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 text-gray-900 font-medium text-sm min-h-[42px] flex items-center">
            {value}
        </div>
    </div>
);