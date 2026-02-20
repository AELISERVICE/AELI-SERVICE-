import React, { useEffect } from 'react';
import { toast } from "react-toastify";
import { Mail, Upload, Loader2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { useStats } from '../../hooks/useStats';
import { useExportContacts } from '../../hooks/useExport';

export const ContactAnalytics = () => {
  const { data: statsResponse } = useStats();
  const { mutate: mutateExport, isLoading: isLoadingExport, isSuccess: isSuccessExport, data: dataExport, isError: isErrorExport, error: errorExport, reset: resetExport } = useExportContacts();

  // Extraction sécurisée des données avec valeurs par défaut
  const contacts = statsResponse?.data?.contacts;

  // Calcul dynamique du pourcentage (évite la division par zéro)
  const pendingPercentage = contacts?.total > 0
    ? Math.round((contacts?.pending / contacts?.total) * 100) : 0;


  const handleExport = () => {
    mutateExport();
  };


  useEffect(() => {
    if (isSuccessExport && dataExport) {
      const csvContent = dataExport.message;

      // Créer le Blob (avec le BOM "\ufeff" pour la compatibilité Excel/Accents)
      const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });

      // Créer le lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      // Nom du fichier (ex: export-prestataires-19-02-2026.csv)
      const now = new Date();
      const date = now.toLocaleDateString('fr-FR').replace(/\//g, '-');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');

      const time = `${hours}h${minutes}m${seconds}s`;

      // Configurer le nom du fichier
      link.href = url;
      link.setAttribute('download', `export-prestataires-${date}-${time}.csv`);

      // Déclenchement automatique du téléchargement
      document.body.appendChild(link);
      link.click();

      // Nettoyage de la mémoire et du DOM
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Exportation réussie !");
    }

    if (isErrorExport) {
      const mainMessage = errorExport?.message || "Erreur lors de l'exportation";
      toast.error(mainMessage);

      const backendErrors = errorExport?.response?.data?.errors;
      if (Array.isArray(backendErrors)) {
        backendErrors.forEach((err) => {
          toast.info(err.message);
        });
      }
    }

    resetExport();

  }, [isSuccessExport, isErrorExport, dataExport, errorExport]);

  return (
    <Card className="h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Mail className="w-6 h-6 text-orange-500" />
          </div>
          <Button
            variant="primary"
            size={"icon"}
            disabled={isLoadingExport}
            onClick={handleExport}
            className="p-[14px] rounded-lg"
          >
            {isLoadingExport ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload size={18} />
              </span>
            )}
          </Button>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${contacts?.pending > 0 ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-50'
          }`}>
          {contacts?.pending || 0} Non lus
        </span>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">
          {contacts?.total?.toLocaleString()}
        </h3>
        <p className="text-sm text-gray-500 mb-4">Demandes de contact</p>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className="bg-orange-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${pendingPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400">{pendingPercentage}% en attente de réponse</p>
      </div>
    </Card>
  );
};