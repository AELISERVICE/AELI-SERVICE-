import React from "react";
import { ShieldAlert } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { NotFound } from '../global/NotFound';
import { useSecurityLogs } from "../../hooks/useStats";

export function IpDetection() {
    const { data: logsResponse, isLoading } = useSecurityLogs();
    const logs = logsResponse?.data?.logs || [];

    const headers = ["Date", "Heure", "Événement", "IP", "Utilisateur", "Risque", "Status"];

    const getEventDisplay = (type) => {
        if (type === "login_failed") return "Connexion échoué";
        if (type === "login_success") return "Connexion réussi";
        return type;
    };

    const getRiskDisplay = (level) => {
        if (level === "high") return "Elevé";
        if (level === "medium") return "Moyen";
        return "Aucun";
    };

    return (
        <Card>
            <div className="px-2 py-2">
                <h3 className="text-lg font-semibold text-gray-800 ">
                    Logs de securite ressent
                </h3>
            </div>
            {logs.length > 0 ? (
                <Table headers={headers}>
                    {logs.map((log) => {
                        const dateObj = new Date(log.createdAt);
                        const displayDate = dateObj.toLocaleDateString('fr-FR');
                        const displayTime = dateObj.toLocaleTimeString('fr-FR');
                        const eventtype = getEventDisplay(log.eventType);
                        const risklevel = getRiskDisplay(log.riskLevel);
                        const status = log.success ? "Succes" : "Echoué";

                        return (
                            <tr key={log.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-slate-900">{displayDate}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-slate-900">{displayTime}</span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <div className={`flex items-center rounded-full items-center justify-center gap-2 w-fit py-1 px-2 truncate ${eventtype === "Connexion échoué" ? "bg-red-50 text-red-700" : eventtype === 'Detection bot' ? "bg-purple-50 text-purple-700" : "bg-green-50 text-green-700"}`}>
                                        {eventtype}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <div className="flex items-center gap-2">{log.ipAddress.replace('::ffff:', '')}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <div className="flex items-center gap-2">{log.email}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-600">
                                    <div className={`flex items-center rounded-full items-center justify-center gap-2 w-fit py-1 px-2 ${risklevel === "Elevé" ? "bg-red-50 text-red-700" : risklevel === 'Moyen' ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`}>
                                        {risklevel}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge
                                        status={status}
                                        variant={status === 'Succes' ? 'green' : status === 'Bloqué' ? 'red' : 'gray'}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </Table>
            ) : (
                <NotFound
                    Icon={ShieldAlert}
                    message="Aucune IP bannie actuellement"
                />
            )}
        </Card>
    );
}