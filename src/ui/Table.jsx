import React from 'react';


export const Table = ({ headers, children, minWidth = "1000px" }) => (
    <div className="w-full">
        <div className="overflow-x-auto">
            {/* border-separate + border-spacing-y-2 permet de détacher les lignes 
                pour que le shadow soit visible tout autour (comme sur ton image).
            */}
            <table className={`w-full min-w-[${minWidth}] text-left text-sm border-separate border-spacing-y-2 `}>
                {/* <thead>
                    <tr className="text-xs font-medium text-slate-500 uppercase tracking-wider bg-gray-400 shadow-[0px_1px_1px_rgba(0,0,0,0.08),0_2px_3px_-2px_rgba(0,0,0,0.04)] rounded-l-2xl rounded-r-2xl">
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className={`
                                px-6 py-4 bg-white
                                shadow-[0_2px_6px_rgba(0,0,0,0.08)]
                                first:rounded-l-xl 
                                last:rounded-r-xl
                            `}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead> */}
                <tbody className="
                    /* Lignes Impaires (1, 3, 5) : Gris plat */
                    [&>tr:nth-child(odd)>td]:bg-slate-50/80
                    [&>tr:nth-child(odd)>td:first-child]:rounded-l-2xl
                    [&>tr:nth-child(odd)>td:last-child]:rounded-r-2xl

                    /* Lignes Paires : L'effet 'Sec' maximum */
                    [&>tr:nth-child(even)>td]:bg-white
                    [&>tr:nth-child(even)>td]:border-y
                    [&>tr:nth-child(even)>td]:border-slate-200
                    
                    /* Ombre très courte et opaque (effet sec) */
                    [&>tr:nth-child(even)>td]:shadow-[0_1px_3px_rgba(0,0,0,0.12)]
                    
                    /* Fermeture de la capsule aux extrémités */
                    [&>tr:nth-child(even)>td:first-child]:rounded-l-2xl
                    [&>tr:nth-child(even)>td:first-child]:border-l
                    [&>tr:nth-child(even)>td:last-child]:rounded-r-2xl
                    [&>tr:nth-child(even)>td:last-child]:border-r
                
                ">
                    {children}
                </tbody>
            </table>
        </div>
    </div>
);
