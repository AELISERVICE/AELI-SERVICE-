import React from 'react'
import { Button } from '../../ui/Button'
import { ConfirmCard } from '../../ui/ConfirmCard'


export function Confirmation() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#FF8C42] to-[#FF6B35]">
      <ConfirmCard
        question={"Are you sure you want to delete?"}
        werning={"If you delete this post, it will disappear permanently."}
        action={[
          <Button
            key="cancel"
            variant="outline"
            className="flex-1"
            onClick={""}
          >
            Annuler
          </Button>,
          <Button
            key="delete"
            variant="danger"
            className="flex-1"
            onClick={""}
          >
            Supprimer
          </Button>
        ]}
      />
    </main>
  )
}
