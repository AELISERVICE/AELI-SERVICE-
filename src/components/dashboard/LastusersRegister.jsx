import React from 'react';
import { MapPin, Star, Eye, MessageSquare, User, Loader2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { useStats } from '../../hooks/useStats';
import { NotFound } from '../global/NotFound';

export const LastusersRegister = () => {
  const { data: statsResponse, isLoading } = useStats();
  const recentUsers = statsResponse?.data?.recentUsers || [];
  const recentProviders = statsResponse?.data?.recentProviders || [];

  const headers = ["Provider", "Location", "Rating", "Reviews", "View", "Status", "Contact"];
  const headersUser = ["User", "Gender", "Email", "Country", "Status", "Contact"];

  return (
    <div className="f mb-2">
      <div className="flex flex-col gap-6 ">
        <Card>
          <div className="px-2 md:px-6 py-2">
            <h3 className="text-lg font-semibold text-gray-800 ">
              5 derniers utilisateurs inscrit
            </h3>
          </div>
          {recentUsers.length > 0 ? (
            <Table headers={headersUser}>
              {recentUsers.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* Utilisation d'une image par défaut si profilePhoto est null */}
                      <img
                        src={item.profilePhoto || `https://ui-avatars.com/api/?name=${item.firstName}+${item.lastName}&background=random`}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{item.firstName} {item.lastName}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className={`flex items-center rounded-full items-center justify-center gap-2 w-fit py-1 px-2 ${item.gender === "female" ? "bg-pink-50 text-pink-700" : "bg-blue-50 text-blue-700"}`}>
                      {item.gender === "female" ? "femme" : "homme"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">{item.email}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">{item.country}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2">{item.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      status={item.isActive ? 'Active' : 'Inactive'}
                      variant={item.isActive ? 'green' : 'red'}
                    />
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <NotFound
              Icon={User}
              title="Aucun utilisateur récent"
              message="Il semble qu'aucun nouvel utilisateur ne se soit inscrit au cours des derniers jours."
            />
          )}
        </Card>

        <Card>
          <div className="px-2 md:px-6 py-2">
            <h3 className="text-lg font-semibold text-gray-800 ">
              5 derniers prestaires creer
            </h3>
          </div>

          {recentProviders.length > 0 ? (
            <Table headers={headers}>
              {recentProviders.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-400">
                        {item.businessName?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{item.businessName}</span>
                          {item.isFeatured && <span className="bg-purple-50 text-purple-600 text-[10px] px-1.5 py-0.5 rounded">Featured</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center gap-2 max-w-[100px]">
                      <MapPin size={14} className="fill-red-400 text-white shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1"><Star size={14} className="fill-amber-400 text-amber-400" />{item.averageRating}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1"><MessageSquare size={14} className="fill-gray-400 text-white" />{item.viewsCount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1"><Eye size={14} className="fill-gray-400 text-white" />{item.viewsCount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-600 font-medium">{item.whatsapp}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      status={item.isVerified ? 'Active' : 'Pending'}
                      variant={item.isVerified ? 'green' : 'gray'}
                    />
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <NotFound
              Icon={User}
              title="Aucun prestataire trouvé"
              message="Aucun nouveau profil de prestataire n'a été créé ou n'est en attente de validation pour le moment."
            />
          )}
        </Card>
      </div>
    </div>
  );
};