import React from "react";
import { Card } from '../../ui/Card';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';


const data = [
    { id: 1, date: '02/02/2026', time: '10:46:10', eventtype: 'Connexion échoué', ipadresse: '192.168.1.100', user: 'john@creative-tim.com', risklevel: 'Moyen', status: 'Echoué' },
    { id: 2, date: '07/02/2026', time: '09:23:42', eventtype: 'Detection bot', ipadresse: '10.0.0.50', user: '-', risklevel: 'Elevé', status: 'Bloqué' },
    { id: 3, date: '08/02/2026', time: '11:05:23', eventtype: 'Connexion réussi', ipadresse: '203.0.113.25', user: 'john@creative-tim.com', risklevel: 'Aucun', status: 'Succes' },
];


export function IpDetection() {
    const headers = [""];

    return (
        <Card>
            <div className="px-2  py-2">
                <h3 className="text-lg font-semibold text-gray-800 ">
                    Logs de securite ressent
                </h3>
            </div>
            <Table headers={headers}>
                {data.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900">{item.date}</span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900">{item.time}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className={`flex items-center rounded-full items-center justify-center gap-2 w-fit py-1 px-2 ${item.eventtype === "Connexion échoué" ? "bg-red-50 text-red-700" : item.eventtype === 'Detection bot' ? "bg-purple-50 text-purple-700" : "bg-green-50 text-green-700"}`}>{item.eventtype}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">{item.ipadresse}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">{item.user}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className={`flex items-center rounded-full items-center justify-center gap-2 w-fit py-1 px-2 ${item.risklevel === "Elevé" ? "bg-red-50 text-red-700" : item.risklevel === 'Moyen' ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`}>{item.risklevel}</div>
                        </td>
                        <td className="px-6 py-4">
                            <Badge
                                status={item.status}
                                variant={item.status === 'Succes' ? 'green' : item.status === 'Bloqué' ? 'red' : 'gray'}
                            />
                        </td>
                    </tr>
                ))}
            </Table>
        </Card>
    )
}