import React from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';


export function Confirmation({ closeConfirm, activeModal }) {
  const isDelete = activeModal === 1;
  const isRecovery = activeModal === 2;

  return (
    <main
      onClick={closeConfirm}
      className="fixed min-h-screen w-full flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-80">
      <Card >
        <h2 id="modal-title" className="text-xl text-center font-bold text-gray-900 mb-2">
          {isDelete ? "Confirmer la suppression ?" : "Confirmer la récupération ?"}
        </h2>
        <p className="flex text-gray-500 text-sm text-center leading-relaxed mb-8 max-w-[280px]">
          {isDelete
            ? "Si vous supprimez ce prestataire, ses données seront définitivement perdues."
            : "Voulez-vous vraiment restaurer ce prestataire dans la liste des actifs ?"
          }
        </p>
        <div className="flex gap-3">
          <Button
            key="cancel"
            variant="outline"
            className="flex-1"
            onClick={closeConfirm}
          >
            Annuler
          </Button>
          <Button
            key="delete"
            variant={isDelete ? "danger" : "primary"}
            className="flex-1"
            onClick={closeConfirm}
          >
            {isDelete ? "Supprimer" : "Restaurer"}
          </Button>
        </div>
      </Card>
    </main>
  )
}
