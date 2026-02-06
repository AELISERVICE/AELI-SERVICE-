import React from "react"

// Un petit sous-composant pour les badges de statut réutilisables
export const Badge = ({ status, variant }) => {
    const styles = {
        green: "bg-green-50 text-green-700",
        red: "bg-red-50 text-red-700",
        gray: "bg-slate-100 text-slate-700"
    };
    const dotStyles = {
        green: "bg-green-500",
        red: "bg-red-500",
        gray: "bg-slate-400"
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${styles[variant]}`}>
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${dotStyles[variant]}`} />
            {status}
        </span>
    );
};