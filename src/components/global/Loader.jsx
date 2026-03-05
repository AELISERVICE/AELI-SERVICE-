import React from 'react';
import { Loader2 } from 'lucide-react';


export const Loader = ({
    variant = 'centered',
    message = null,
    className = ''
}) => {
    const variantStyles = {
        default: 'flex justify-center p-10',
        centered: 'flex flex-col items-center justify-center py-20',
        inline: 'inline-flex items-center gap-2',
        fullscreen: 'fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50'
    };

    const loaderElement = (
        <Loader2 className={`w-6 h-6 animate-spin text-[#E8524D]`} />
    );

    if (variant === 'inline') {
        // Return the rendered UI for this component.
        return (
            <span className={variantStyles[variant]}>
                {loaderElement}
                {message && <span className="text-sm text-gray-600">{message}</span>}
            </span>
        );
    }

    // Return the rendered UI for this component.
    return (
        <div className={`${variantStyles[variant]} ${className}`}>
            {loaderElement}
            {message && (
                <p className="mt-4 text-gray-500 font-medium">{message}</p>
            )}
        </div>
    );
};


export const ButtonLoader = ({ className = '' }) => {
    return <Loader2 className={`w-6 h-6 animate-spin text-[#E8524D] ${className}`} />;
};
