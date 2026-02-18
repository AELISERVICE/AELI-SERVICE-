import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from "react-toastify";
import { MoreVertical, RotateCcw, Mail, Phone, MapPin, Calendar, ShieldCheck, User as UserIcon, Users } from 'lucide-react';
import { ActionMenu } from '../global/ActionMenu';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { NotFound } from '../global/NotFound';
import { useGetUsers, useDeactivateAccount } from '../../hooks/useUser';

export const UserTable = ({ actifTabs }) => {
    const headers = ["Utilisateur", "Rôle", "Genre", "Contact", "Localisation", "Vérifié", "Dernière Connexion", "Status", "Actions"];

    const { onActiveModal } = useOutletContext();
    const [openMenuId, setOpenMenuId] = useState(null);
    const triggerRef = useRef(null);

    // Hooks de données
    const { data: apiResponse, isLoading, refetch } = useGetUsers();
    const { mutate: mutateDesactivate, data: dataDesactivate, isSuccess, isError, error } = useDeactivateAccount();

    // TON BLOC DE NOTIFICATION EXACT
    useEffect(() => {
        if (isSuccess && dataDesactivate?.success) {
            toast.success(dataDesactivate.message);
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
    }, [isSuccess, isError, dataDesactivate, error, refetch]);

    const users = apiResponse?.data?.users || [];

    const handleStatusChange = (user) => {
        mutateDesactivate({
            id: user.id,
            formData: { isActive: !user.isActive } // Envoie le booléen correct
        });
    };

    return (
        <Card>
            {users.length > 0 ? (
                <Table headers={headers}>
                    {users.map((user) => (
                        <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={user.profilePhoto || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
                                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                                        alt="avatar"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900 leading-none truncate">{user.firstName} {user.lastName}</span>
                                        <span className="text-[10px] text-slate-400 font-mono mt-1 italic">ID: {user.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                    user.role === 'provider' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {user.role}
                                </span>
                            </td>

                            <td className="px-6 py-4 text-xs capitalize text-slate-600">
                                <div className={`text-xs capitalize px-2 py-1 rounded-full w-fit ${user.gender === 'male' ? 'bg-blue-50 text-blue-600' :
                                    user.gender === 'female' ? 'bg-pink-50 text-pink-600' : 'bg-slate-50 text-slate-400'
                                    }`}>
                                    {user.gender || 'Non défini'}
                                </div>
                            </td>

                            <td className="px-6 py-4">
                                <div className="text-xs text-slate-600">{user.email}</div>
                                <div className="text-[10px] text-slate-400">{user.phone}</div>
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-600">{user.country}</td>

                            <td className="px-6 py-4 text-center">
                                {user.isEmailVerified && <ShieldCheck size={18} className="text-emerald-500 mx-auto" />}
                            </td>

                            <td className="px-6 py-4 text-[11px] text-slate-500">
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Jamais'}
                            </td>

                            <td className="px-6 py-4">
                                <Badge status={user.isActive ? 'Actif' : 'Bloqué'} variant={user.isActive ? 'green' : 'red'} />
                            </td>

                            <td className="relative px-6 py-4 text-right">
                                <div className="flex justify-end">
                                    <Button
                                        ref={openMenuId === user.id ? triggerRef : null}
                                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                                        className="text-slate-400 hover:text-slate-600 border-none bg-transparent"
                                    >
                                        <MoreVertical size={18} />
                                    </Button>
                                </div>
                                <ActionMenu
                                    isOpen={openMenuId === user.id}
                                    onClose={() => setOpenMenuId(null)}
                                    triggerRef={triggerRef}
                                    initialStatus={!user.isActive} // Bloqué si isActive est false
                                    onStatusChange={() => handleStatusChange(user)}
                                    onEdit={() => onActiveModal(3, user)}
                                    onDelete={() => onActiveModal(1, user.id)}
                                />
                            </td>
                        </tr>
                    ))}
                </Table>
            ) : (
                <NotFound
                    Icon={Users}
                    title="Aucun utilisateur"
                    message="Il semble qu'aucun utilisateur ne se soit inscrit"
                />
            )}
        </Card>
    );
};