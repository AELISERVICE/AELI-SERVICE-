# Aeli Services Client/Prestataire – Documentation technique

## Vue d’ensemble

Ce projet correspond à l’interface **client/prestataire** de la plateforme **Aeli Services**.
Il couvre les parcours d’authentification, la recherche de prestataires, la consultation de profils,
la gestion des services côté prestataire, les avis, les favoris, la messagerie de contact
et la souscription/abonnement.

---

## Stack technique utilisée

### Frontend

- **React 19** : construction de l’interface en composants.
- **React Router 7** : routage SPA et navigation entre écrans.
- **TanStack React Query 5** : gestion des appels API, cache, mutations, invalidation.
- **Tailwind CSS 4** : stylisation utilitaire et responsive design.
- **React Toastify** : notifications utilisateur (succès/erreurs).
- **Lucide React** : icônes de l’interface.
- **Leaflet + React Leaflet** : affichage carte pour la recherche géographique.
- **React Google Autocomplete** : saisie assistée d’adresses/lieux.
- **Framer Motion** : animations UI.
- **DotLottie React** : animations Lottie.

### Build & tooling

- **Vite 7 (Rolldown Vite)** : bundler et serveur de développement.
- **ESLint 9** : qualité et cohérence du code.
- **PostCSS + Autoprefixer** : pipeline CSS.

### Déploiement / infra

- **Nginx** (configuration incluse).
- **Docker** (dockerfile présent).
- **Vercel** (fichier de configuration présent).

---

## Fonctionnalités implémentées dans cette partie `aeli_service` (client/prestataire)

## 1) Authentification & gestion de session

- Inscription utilisateur (`useRegister`).
- Vérification OTP (`useOtp`).
- Renvoi OTP (`useResendOtp`).
- Connexion (`useLogin`).
- Déconnexion (`useLogout`).
- Mot de passe oublié (`useForgotPassword`).
- Réinitialisation du mot de passe via token (`useResetPassword`).
- Gestion automatique du token d’accès + refresh token côté client (`request` dans `src/api/apiClient.jsx`).

## 2) Accueil & découverte

- Affichage de recommandations (`RecommendationSection`).
- Affichage des services à explorer (`ServicesSection`).
- Présentation générale des prestataires/services depuis l’écran d’accueil (`HomeScreen`).

## 3) Recherche de prestataires (liste + carte)

- Recherche avec filtres (texte, prix max, note min) (`SearchScreen` + `useGetProviderList`).
- Pagination des résultats (`Pagination`, `CountItems`).
- Vue liste de prestataires (`ServiceSearch`).
- Vue cartographique des prestataires (`MapSearch`) basée sur Leaflet.

## 4) Profil utilisateur & espace prestataire

- Consultation des informations du compte connecté (`useInfoUserConnected`).
- Mise à jour du profil utilisateur (`useUpdateProfile`).
- Affichage conditionnel du panneau prestataire (`ProviderPanel`).
- Gestion de l’abonnement depuis le profil (`Abonnement`).

## 5) Parcours “Devenir prestataire” & gestion offre

- Soumission de candidature prestataire (`useApplyProvider`, écran `RegistrationProviderScreen`).
- Création de catégories de services (`useCreateCategories`).
- Liste des catégories (`useGetCategory`).
- Création de services (`useCreateServices`).
- Mise à jour de services (`useUpdateServices`).
- Suppression de services (`useDeleteServices`).
- Récupération des services d’un prestataire (`useGetServicesByProvider`).
- Mise à jour du profil prestataire (`useUpdateProviderProfile`).
- Suppression de photos prestataire (`useDeleteProviderPhoto`).

## 6) Consultation fiche prestataire & statistiques

- Consultation d’un prestataire depuis recherche/profil (`ProviderScreen`, `ServiceProvider`).
- Affichage des stats associées (`StatsProvider`).
- Chargement d’un prestataire par identifiant (`useGetProviderByid`).

## 7) Avis & notation

- Récupération des avis d’un prestataire (`useGetReviewByProvider`).
- Création d’un avis (`useCreateReview`).
- Modification d’un avis (`useUpdateReview`).
- Suppression d’un avis (`useDeleteReview`).
- Flux modal de feedback utilisateur (`FeedbackCard`).

## 8) Favoris

- Liste des favoris (`useGetFavorites`).
- Vérification d’un favori par prestataire (`useCheckFavorites`).
- Ajout aux favoris (`useAddToFavorites`).
- Suppression des favoris (`useDeleteFavorites`).
- Interface de gestion des favoris (`FavoriteList`).

## 9) Contact & messagerie client/prestataire

- Envoi d’un message de contact (`useContact`).
- Consultation des messages envoyés (`useGetContactSend`).
- Consultation des messages reçus (`useGetReceivedContact`).
- Mise à jour du statut de message (`useUpdateStatusMessage`).
- Déverrouillage de message (`useUnlockMessage`).
- Statistiques journalières de contact (`useGetStatDaily`).
- Composants de chat/messagerie (`ProviderMessaging`, `ChatList`, `ChatWindow`).

## 10) Souscriptions & paiements

- Consultation des plans d’abonnement (`useGetPlans`).
- Consultation de l’abonnement prestataire courant (`useGetAbonnementProvider`).
- Initialisation de paiement (NotchPay) pour souscription (`useSubscribe`).

## 11) Bannières & communication produit

- Récupération des bannières (`useGetBanners`).
- Affichage via modal de bannière (`Banner`).

## 12) Infrastructure UX transversale

- Layout applicatif partagé (`Base`) avec header/sidebar et modales globales.
- Notifications globales (`ToastContainer`).
- État de chargement global (`GlobalLoadingContext`).
- Composants utilitaires réutilisables (`ui/`, `components/global`).

---

## Organisation applicative (résumé)

- `src/screens` : pages/écrans.
- `src/components` : composants métier/UI.
- `src/hooks` : hooks de consommation API (queries/mutations).
- `src/api/apiClient.jsx` : client de requêtes HTTP centralisé (auth + refresh).
- `src/context` : contextes globaux (ex: chargement).
- `src/ui` : composants UI réutilisables.

---

## Routes principales (client/prestataire)

- `/`
- `/login`
- `/forgot-password`
- `/register`
- `/otp`
- `/reset-password/:token`
- `/become-service-provider`
- `/add-category`
- `/add-service`
- `/home`
- `/profile`
- `/search`
- `/provider`
- `/consult-provider`
- `/subscription`

---

## Scripts disponibles

- `npm run dev` : démarrage en développement.
- `npm run build` : build de production.
- `npm run preview` : preview locale du build.
- `npm run lint` : vérification lint.
