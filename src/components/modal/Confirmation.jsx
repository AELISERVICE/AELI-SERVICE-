import React from 'react'
import { Button } from '../../ui/Button'
import { ConfirmCard } from '../../ui/ConfirmCard'


export function Confirmation({ closeConfirm }) {
  return (
    <main
      onClick={closeConfirm}
      className="fixed min-h-screen w-full flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-50">
      <ConfirmCard
        question={"Are you sure you want to delete?"}
        werning={"If you delete this post, it will disappear permanently."}
        actions={[
          <Button
            key="cancel"
            variant="outline"
            className="flex-1"
            onClick={closeConfirm}
          >
            Annuler
          </Button>,
          <Button
            key="delete"
            variant="danger"
            className="flex-1"
            onClick={closeConfirm}
          >
            Supprimer
          </Button>
        ]}
      />
    </main>
  )
}
