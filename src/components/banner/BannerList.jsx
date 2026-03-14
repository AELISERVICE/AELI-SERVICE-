import React, { useState, useRef, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MoreVertical,
  Image as ImageIcon,
  Plus,
  AlertCircle,
} from "lucide-react";
import { ActionMenu } from "../global/ActionMenu";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { NotFound } from "../global/NotFound";
import { Loader } from "../global/Loader";
import {
  useGetBanners,
  useDeleteBanner,
  useUpdateBanner,
} from "../../hooks/useBanner";

/**
 * UI component responsible for rendering the banner list section.
 */
export const BannerList = ({ onAddBanner, onEditBanner }) => {
  const { onActiveModal, closeConfirm } = useOutletContext();
  const [openMenuId, setOpenMenuId] = useState(null);
  const triggerRef = useRef(null);

  const { data: apiResponse, isLoading, isError, refetch } = useGetBanners();
  const banners = apiResponse?.data?.banners || apiResponse?.data || [];

  const {
    mutate: mutateDelete,
    isSuccess: isSuccessDelete,
    data: dataDelete,
    isError: isErrorDelete,
    error: errorDelete,
    reset: resetDelete,
  } = useDeleteBanner();
  const {
    mutate: mutateUpdate,
    isSuccess: isSuccessUpdate,
    data: dataUpdate,
    isError: isErrorUpdate,
    error: errorUpdate,
    reset: resetUpdate,
  } = useUpdateBanner();

  /**
   * Handles status change behavior.
   */
  const handleStatusChange = (banner) => {
    mutateUpdate({
      id: banner.id,
      formData: { isActive: !banner.isActive },
    });
  };

  /**
   * Handles delete click behavior.
   */
  const handleDeleteClick = (banner) => {
    onActiveModal(1, {
      title: "Supprimer la bannière ?",
      description: `Voulez-vous vraiment supprimer la bannière "${banner.title}" ? Cette action est irréversible.`,
      onConfirm: () => {
        mutateDelete({ id: banner.id });
      },
    });
  };

  useEffect(() => {
    if (isSuccessDelete && dataDelete?.success) {
      toast.success(dataDelete.message || "Bannière supprimée avec succès");
      refetch();
      if (closeConfirm) closeConfirm();
    }

    if (isSuccessUpdate && dataUpdate?.success) {
      toast.success(dataUpdate.message || "Bannière mise à jour avec succès");
      refetch();
    }

    if (isErrorDelete || isErrorUpdate) {
      const mainMessage = errorDelete?.message || errorUpdate?.message;
      toast.error(mainMessage);

      const backendErrors =
        errorDelete?.response?.errors || errorUpdate?.response?.errors;
      if (Array.isArray(backendErrors)) {
        backendErrors.forEach((err) => {
          toast.info(err.message);
        });
      }
    }

    resetDelete();
    resetUpdate();
  }, [
    isSuccessDelete,
    isErrorDelete,
    dataDelete,
    errorDelete,
    isSuccessUpdate,
    isErrorUpdate,
    dataUpdate,
    errorUpdate,
    refetch,
  ]);

  const getTypeLabel = (type) => {
    const types = {
      main_home: "Accueil principal",
      sidebar: "Barre latérale",
      featured: "Mise en avant",
      popup: "Popup",
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non défini";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) return <Loader variant="centered" message="Chargement..." />;

  return (
    <Card>
      <div className="flex justify-between mb-1">
        <div>
          <h1 className="text-xl text-gray-700 font-bold lg:pacifico-regular">
            Bannières
          </h1>
        </div>
        <Button
          variant="primary"
          onClick={onAddBanner}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Ajouter une bannière
        </Button>
      </div>
      {banners.length > 0 ? (
        <div className="mt-4 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="flex justify-center md:justify-start"
            >
              <div className="w-full md:w-[400px] h-[400px] bg-[#1B1B1B] text-white overflow-hidden shadow-2xl flex flex-col group font-sans rounded-2xl border border-white/5">
                <div className="p-6 h-[80px] flex justify-between items-start z-30">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.png"
                      alt="logo"
                      className="w-10 h-10 flex-shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-xl pacifico-regular">
                        AELI Services
                      </span>
                      {/* <span className="text-xs text-white/60">
                        {getTypeLabel(banner.type)} · {formatDate(banner.startDate)}
                      </span> */}
                    </div>
                  </div>
                  <div className="relative">
                    <Button
                      ref={openMenuId === banner.id ? triggerRef : null}
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === banner.id ? null : banner.id
                        )
                      }
                      className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all border-none"
                    >
                      <MoreVertical size={18} />
                    </Button>
                    <ActionMenu
                      isOpen={openMenuId === banner.id}
                      onClose={() => setOpenMenuId(null)}
                      triggerRef={triggerRef}
                      initialStatus={!banner.isActive}
                      onStatusChange={() => handleStatusChange(banner)}
                      onEdit={() => {
                        onEditBanner(banner);
                        setOpenMenuId(null);
                      }}
                      onDelete={() => handleDeleteClick(banner)}
                    />
                  </div>
                </div>

                <div className="px-8 flex-1 flex flex-col justify-center z-20 overflow-hidden">
                  <h2 className="text-2xl font-bold leading-tight mb-2 line-clamp-2">
                    {banner.title}
                  </h2>
                  <p className="text-gray-400 text-sm line-clamp-3">
                    {banner.description || "Aucune description disponible."}
                  </p>
                </div>

                <div className="relative h-[45%] w-full mt-auto">
                  <div
                    className="absolute inset-0 z-10"
                    style={{
                      maskImage:
                        "radial-gradient(circle at 70% 50%, black 20%, transparent 90%)",
                      WebkitMaskImage:
                        "radial-gradient(circle at 70% 50%, black 20%, transparent 100%)",
                    }}
                  >
                    {banner.imageUrl ? (
                      <img
                        key={banner.imageUrl}
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover object-[80%_center] opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <ImageIcon size={32} className="text-white/50" />
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-transparent to-transparent z-20"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1B1B1B] via-transparent to-transparent z-20"></div>

                  <div className="absolute bottom-6 left-3 right-3 z-30 flex items-center justify-end gap-3">

                    {
                      banner.linkUrl &&
                      <div className="flex flex-1">
                        <Button
                          type="button"
                          variant="softRed"
                          onClick={() =>
                            banner.linkUrl &&
                            window.open(banner.linkUrl, "_blank")
                          }
                          className="px-0 py-2 shadow-xl hover:scale-105 transition-transform"
                        >
                          En savoir plus
                        </Button>
                      </div>
                    }
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Badge
                        status={banner.isActive ? "Actif" : "Inactif"}
                        variant={banner.isActive ? "green" : "gray"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <NotFound
          Icon={AlertCircle}
          title="Erreur de chargement"
          message="Impossible de récupérer la répartition des événements."
        />
      ) : (
        <NotFound
          Icon={ImageIcon}
          title="Aucune bannière"
          message="Il semble qu'aucune bannière n'ait été créée"
        />
      )}
    </Card>
  );
};
