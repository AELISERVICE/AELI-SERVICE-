import { useEffect, useState } from 'react';
import { Button } from '../../ui/Button';

export function InstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isShown, setIsShown] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            // Empêche le navigateur d'afficher sa propre bannière automatiquement
            e.preventDefault();
            setDeferredPrompt(e);
            setIsShown(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsShown(false);
        }
    };

    if (!isShown) return null;

    return (
        <div className="fixed md:w-[400px] top-4 left-4 md:left-auto right-4 z-[9999] bg-white p-4 rounded-2xl shadow-2xl border border-purple-100 flex items-center justify-between animate-bounce">
            <div>
                <p className="font-bold text-gray-900">AELI Services</p>
                <p className="text-sm text-gray-600">Installez l'app pour un accès rapide.</p>
            </div>
            <Button
                variant="softRed"
                type="button"
                onClick={handleInstall}
                className="sm:w-auto gap-2 px-4 py-3"
            >
                Installer
            </Button>
        </div>
    );
}