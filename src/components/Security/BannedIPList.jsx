import React, { useEffect } from "react";
import { toast } from "react-toastify";
import Skeleton from 'react-loading-skeleton';
import { Trash2, Plus, ShieldAlert } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { NotFound } from '../global/NotFound';
import { usebannedIps, useUnbanIP } from "../../hooks/useStats";

export function BannedIPList() {
    const { data: bannedIpsResponse, isLoading, refetch } = usebannedIps();
    const { mutate: mutateUnban, data: dataUnban, isSuccess, isError, error } = useUnbanIP();

    // Extraction de la liste depuis la structure de ton JSON
    const bannedList = bannedIpsResponse?.data?.bannedIPs || [];

    // Fonction pour formater la durée (secondes -> heures/jours)
    const formatDuration = (seconds) => {
        if (!seconds) return "Permanent";
        if (seconds >= 86400) return `${Math.floor(seconds / 86400)}j restant`;
        return `${Math.floor(seconds / 3600)}h restant`;
    };


    // 3. Logique de suppression
    const handleUnban = (ip) => {
        if (window.confirm(`Voulez-vous vraiment débloquer l'IP ${ip} ?`)) {
            mutateUnban(ip);
        }
    };

    useEffect(() => {
        if (isSuccess && dataUnban?.success) {
            toast.success(dataUnban.message);
            refetch();
        }

        if (isError) {
            const mainMessage = error?.message;
            toast.error(mainMessage);

            const backendErrors = error?.response?.errors;
            if (Array.isArray(backendErrors)) {
                backendErrors.forEach((err) => {
                    toast.info(err.message);
                });
            }
        }
    }, [isSuccess, isError, dataUnban, error]);

    return (
        <Card className="w-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900">IPs Bannies</h2>
                    <p className="text-xs text-gray-500">Liste des adresses restreintes par le système</p>
                </div>
                <Button
                    icon={Plus}
                    variant={"primary"}
                >
                    Bannir IP
                </Button>
            </div>

            <div className="space-y-3 flex-1">
                {bannedList.length > 0 ? (
                    bannedList.map((item, index) => (
                        <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4 flex items-center justify-between group hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                        >
                            <div className="flex flex-col">
                                <span className="font-mono font-bold text-slate-800">{item.ipAddress}</span>
                                <span className="text-sm text-gray-500">{item.reason}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-[11px] font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                    {formatDuration(item.duration)}
                                </span>
                                <button
                                    className="text-gray-400 hover:text-red-500 p-1.5 transition-colors"
                                    onClick={() => handleUnban(item.id)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <NotFound
                        Icon={ShieldAlert}
                        message="Aucune IP bannie actuellement"
                    />
                )}
            </div>
        </Card>
    );
}