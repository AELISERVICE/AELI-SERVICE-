# Aeli Services Admin – Documentation technique

## Vue d’ensemble

Ce projet correspond à l’interface d’administration de la plateforme **Aeli Services**.
Il permet de gérer les utilisateurs, les prestataires, les avis, les paiements/abonnements,
la sécurité et les bannières promotionnelles.

---

## Stack technique utilisée

### Frontend

- **React 19** : construction de l’interface en composants.
- **React Router 7** : routage SPA et navigation entre écrans.
- **TanStack React Query 5** : gestion des appels API, cache, mutations, invalidation.
- **Recharts** : visualisation des statistiques (courbes, graphiques circulaires, etc.).
- **Tailwind CSS 4** : stylisation utilitaire et responsive design.
- **Lucide React** : icônes de l’interface.
- **React Toastify** : notifications utilisateur (succès/erreurs).
- **React Loading Skeleton** : états de chargement avec placeholders.

### Build & tooling

- **Vite 7** : bundler et serveur de développement.
- **ESLint 9** : qualité et cohérence du code.
- **PostCSS + Autoprefixer** : pipeline CSS.

### Déploiement / infra

- **Nginx** (configuration incluse).
- **Docker** (Dockerfile présent).
- **Vercel** (fichier de configuration présent).

---

## Fonctionnalités implémentées dans cette partie `aeli_service_admin`

## 1) Authentification & sécurité d’accès

- Connexion administrateur (`useLogin`).
- Mot de passe oublié (`useForgotPassword`).
- Réinitialisation du mot de passe via token (`useResetPassword`).
- Gestion du token d’accès côté client pour les requêtes API (`request` dans `src/api/apiClient.jsx`).

## 2) Dashboard (pilotage global)

- KPIs globaux (agrégats de la plateforme) (`useStats`).
- Analytics utilisateurs (`useGetUsers`).
- Répartition utilisateurs (composition) (`useGetUsers`).
- Dernières inscriptions (`useStats`).
- Résumé des paiements (`useStats`).
- Statut des prestataires (`useStats`).

## 3) Gestion des prestataires

- Liste des prestataires avec filtres (`useGetProviderList`).
- Liste des candidatures prestataires (`useProviderApplications`).
- Détail d’une candidature prestataire (`useProviderApplicationsDetail`).
- Validation/rejet de candidatures (`useProvidersCreation`).
- Vérification de documents prestataires (`useReviewProviderDocuments`).
- Activation/Désactivation du compte prestataire (`useDeactivateAccountProvider`).

## 4) Mise en avant (Feature Provider)

- Consultation des prestataires mis en avant (`useGetFeatured`).
- Sélection d’un prestataire à promouvoir (`useFeature`).
- Configuration de la mise en avant (durée/période) (`useFeature`).

## 5) Gestion des utilisateurs

- Liste des utilisateurs de la plateforme (`useGetUsers`).
- Changement de statut utilisateur (activation/blocage) (`useDeactivateAccount`).

## 6) Modération des avis

- Récupération des avis avec filtres (`useGetReviews`).
- Masquer/Afficher un avis (`useHideShowReview`).
- Suppression d’un avis (`useDeleteReview`).

## 7) Abonnements & paiements

- Consultation des paiements (`usePayments`).
- Vues par catégories d’état (payé, en attente, révoqué, gratuit via l’UI) (`usePayments` + filtrage UI côté composant).

## 8) Bannières marketing

- Liste des bannières admin (`useGetBanners`).
- Récupération des bannières publiques (`useGetPublicBanners`).
- Création de bannière (`useCreateBanner`).
- Modification de bannière (`useUpdateBanner`).
- Suppression de bannière (`useDeleteBanner`).

## 9) Monitoring sécurité

- Statistiques de sécurité (`useSecurityStats`).
- Logs de sécurité (`useSecurityLogs`).
- Détection / suivi d’IP à risque (`useSecurityLogs`).
- Distribution des niveaux de risque (`useSecurityLogs`).
- Liste des IP bannies (`usebannedIps`).
- Déban d’une IP (`useUnbanIP`).

## 10) Exports & rapports

- Export des utilisateurs (`useExportUsers`).
- Export des prestataires (`useExportProviders`).
- Export des avis (`useExportReviews`).
- Export des contacts (`useExportContacts`).
- Export global de rapports (`useExportGlobalReport`).

---

## Organisation applicative (résumé)

- `src/screens` : pages/écrans.
- `src/components` : composants métier/UI.
- `src/hooks` : hooks de consommation API (queries/mutations).
- `src/api/apiClient.jsx` : client de requêtes HTTP centralisé.
- `src/ui` : composants UI réutilisables.

---

## Routes principales de l’admin

- `/login`
- `/forgot-password`
- `/reset-password/:token`
- `/dashboard`
- `/provider`
- `/subscriptions`
- `/moderation`
- `/feature`
- `/security`
- `/users`
- `/banners`

---

## Scripts disponibles

- `npm run dev` : démarrage en développement.
- `npm run build` : build de production.
- `npm run preview` : preview locale du build.
- `npm run lint` : vérification lint.
