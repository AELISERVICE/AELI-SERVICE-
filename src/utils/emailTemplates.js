/**
 * Email templates for AELI Services
 */

const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (url.startsWith('[')) {
    try {
      const urls = JSON.parse(url);
      return Array.isArray(urls) ? urls[0] : url;
    } catch (e) {
      return url;
    }
  }
  return url;
};

const frontendUrl = getFrontendUrl();

const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AELI Services</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #e91e63;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #e91e63;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #e91e63;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #c2185b;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 12px;
    }
    .highlight {
      background-color: #fce4ec;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    .info-box {
      background-color: #f5f5f5;
      padding: 15px;
      border-left: 4px solid #e91e63;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌸 AELI Services</h1>
      <p style="color: #666; margin: 5px 0 0 0;">Connectez-vous aux meilleures prestataires</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AELI Services - Cameroun</p>
      <p>Plateforme dédiée à l'entrepreneuriat féminin</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Welcome email template
 */
const welcomeEmail = ({ firstName, role }) => {
  const roleText = role === 'provider'
    ? 'En tant que prestataire, vous pouvez maintenant créer votre profil et commencer à proposer vos services.'
    : 'Vous pouvez maintenant découvrir nos prestataires talentueuses et trouver les services dont vous avez besoin.';

  return {
    subject: 'Bienvenue sur AELI Services ! 🌸',
    html: baseTemplate(`
      <h2>Bonjour ${firstName} !</h2>
      <p>Nous sommes ravis de vous accueillir sur <strong>AELI Services</strong>, la plateforme qui connecte des clientes avec des femmes entrepreneures et prestataires de services au Cameroun.</p>
      
      <div class="highlight">
        <p>${roleText}</p>
      </div>
      
      <p>Avec AELI Services, vous pouvez :</p>
      <ul>
        <li>📍 Trouver des prestataires près de chez vous</li>
        <li>⭐ Consulter les avis et notations</li>
        <li>💬 Contacter directement les prestataires</li>
        <li>❤️ Sauvegarder vos prestataires favorites</li>
      </ul>
      
      <center>
        <a href="${frontendUrl}" class="button">Découvrir la plateforme</a>
      </center>
      
      <p>À très bientôt sur AELI Services !</p>
      <p><em>L'équipe AELI</em></p>
    `)
  };
};

/**
 * New contact request email (sent to provider)
 */
const newContactEmail = ({ providerName, senderName, senderEmail, senderPhone, message }) => {
  return {
    subject: 'Nouvelle demande de contact - AELI Services 📩',
    html: baseTemplate(`
      <h2>Bonjour ${providerName} !</h2>
      <p>Vous avez reçu une nouvelle demande de contact via AELI Services.</p>
      
      <div class="info-box">
        <p><strong>De :</strong> ${senderName}</p>
        <p><strong>Email :</strong> <a href="mailto:${senderEmail}">${senderEmail}</a></p>
        ${senderPhone ? `<p><strong>Téléphone :</strong> ${senderPhone}</p>` : ''}
      </div>
      
      <div class="highlight">
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      </div>
      
      <p>N'hésitez pas à répondre rapidement pour ne pas manquer cette opportunité !</p>
      
      <center>
        <a href="${frontendUrl}/dashboard" class="button">Voir dans mon tableau de bord</a>
      </center>
      
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

/**
 * Account verification email (sent when provider is verified)
 */
const accountVerifiedEmail = ({ firstName, businessName }) => {
  return {
    subject: 'Votre compte a été validé ! ✅',
    html: baseTemplate(`
      <h2>Félicitations ${firstName} !</h2>
      <p>Nous avons le plaisir de vous informer que votre profil <strong>"${businessName}"</strong> a été validé par notre équipe.</p>
      
      <div class="highlight">
        <p>🎉 Votre profil est maintenant visible par toutes les clientes de la plateforme !</p>
      </div>
      
      <p>Pour optimiser votre visibilité, nous vous recommandons :</p>
      <ul>
        <li>📸 D'ajouter des photos de qualité de vos réalisations</li>
        <li>📝 De compléter votre description avec vos spécialités</li>
        <li>💰 D'indiquer vos tarifs pour plus de transparence</li>
        <li>📱 De renseigner vos réseaux sociaux</li>
      </ul>
      
      <center>
        <a href="${frontendUrl}/dashboard" class="button">Optimiser mon profil</a>
      </center>
      
      <p>Bonne continuation sur AELI Services !</p>
      <p><em>L'équipe AELI</em></p>
    `)
  };
};

/**
 * New review notification email (sent to provider)
 */
const newReviewEmail = ({ firstName, reviewerName, rating, comment }) => {
  const stars = '⭐'.repeat(rating);

  return {
    subject: `Nouvel avis reçu : ${stars}`,
    html: baseTemplate(`
      <h2>Bonjour ${firstName} !</h2>
      <p>Vous avez reçu un nouvel avis sur votre profil AELI Services.</p>
      
      <div class="highlight">
        <p><strong>${reviewerName}</strong> vous a attribué ${rating}/5</p>
        <p style="font-size: 24px;">${stars}</p>
        ${comment ? `<p><em>"${comment}"</em></p>` : ''}
      </div>
      
      <p>Les avis positifs renforcent votre crédibilité auprès des futures clientes. Continuez votre excellent travail !</p>
      
      <center>
        <a href="${frontendUrl}/dashboard" class="button">Voir tous mes avis</a>
      </center>
      
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

/**
 * Password reset email
 */
const passwordResetEmail = ({ firstName, resetUrl }) => {
  return {
    subject: 'Réinitialisation de votre mot de passe 🔐',
    html: baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe AELI Services.</p>
      
      <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
      
      <center>
        <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
      </center>
      
      <div class="info-box">
        <p>⚠️ Ce lien est valable pendant <strong>1 heure</strong>.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.</p>
      </div>
      
      <p>Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

/**
 * Documents received email (sent to provider when they submit documents)
 */
const documentsReceivedEmail = ({ firstName, businessName, documentsCount }) => {
  return {
    subject: 'Documents reçus - Vérification en cours 📋',
    html: baseTemplate(`
      <h2>Bonjour ${firstName} !</h2>
      <p>Nous avons bien reçu vos documents de vérification pour <strong>"${businessName}"</strong>.</p>
      
      <div class="highlight">
        <p>📄 <strong>${documentsCount} document(s)</strong> soumis pour vérification</p>
      </div>
      
      <p>Notre équipe examinera vos documents dans les <strong>24 à 48 heures</strong> ouvrables.</p>
      
      <div class="info-box">
        <p><strong>Documents acceptés :</strong></p>
        <ul>
          <li>Carte Nationale d'Identité (CNI)</li>
          <li>Registre de commerce (si applicable)</li>
          <li>Attestation fiscale</li>
          <li>Justificatif de domicile</li>
        </ul>
      </div>
      
      <p>Vous recevrez un email dès que la vérification sera terminée.</p>
      
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

/**
 * Documents rejected email (sent to provider when admin rejects documents)
 */
const documentsRejectedEmail = ({ firstName, businessName, reasons, notes }) => {
  const reasonsList = reasons && reasons.length > 0
    ? `<ul>${reasons.map(r => `<li>${r}</li>`).join('')}</ul>`
    : '';

  return {
    subject: 'Documents à corriger - Action requise ⚠️',
    html: baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Nous avons examiné vos documents pour <strong>"${businessName}"</strong>, mais nous avons besoin de corrections.</p>
      
      <div class="info-box" style="border-left-color: #ff9800;">
        <p><strong>⚠️ Documents à corriger :</strong></p>
        ${reasonsList}
        ${notes ? `<p><strong>Commentaire :</strong> ${notes}</p>` : ''}
      </div>
      
      <p><strong>Comment corriger ?</strong></p>
      <ol>
        <li>Connectez-vous à votre tableau de bord</li>
        <li>Accédez à "Mes documents"</li>
        <li>Supprimez les documents rejetés</li>
        <li>Téléversez les nouveaux documents corrigés</li>
      </ol>
      
      <center>
        <a href="${frontendUrl}/dashboard/documents" class="button">Corriger mes documents</a>
      </center>
      
      <div class="highlight">
        <p>💡 Assurez-vous que vos documents sont :</p>
        <ul>
          <li>Lisibles et non flous</li>
          <li>Au format PDF, JPG ou PNG</li>
          <li>Valides et non expirés</li>
        </ul>
      </div>
      
      <p>En cas de questions, n'hésitez pas à nous contacter.</p>
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

/**
 * Payment success email
 */
const paymentSuccessEmail = ({ firstName, transactionId, amount, currency, type, description }) => {
  const typeLabels = {
    'contact_premium': 'Contact Premium',
    'featured': 'Mise en avant',
    'boost': 'Boost visibilité',
    'subscription': 'Abonnement'
  };

  return {
    subject: 'Paiement confirmé ✅ - AELI Services',
    html: baseTemplate(`
      <h2>Merci ${firstName} !</h2>
      <p>Votre paiement a été traité avec succès.</p>
      
      <div class="highlight">
        <p style="font-size: 24px; text-align: center; margin: 10px 0;">
          <strong>${amount.toLocaleString()} ${currency}</strong>
        </p>
      </div>
      
      <div class="info-box">
        <p><strong>Détails de la transaction :</strong></p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0;">N° Transaction</td>
            <td style="padding: 5px 0; text-align: right;"><strong>${transactionId}</strong></td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">Service</td>
            <td style="padding: 5px 0; text-align: right;">${typeLabels[type] || type}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">Description</td>
            <td style="padding: 5px 0; text-align: right;">${description}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">Date</td>
            <td style="padding: 5px 0; text-align: right;">${new Date().toLocaleDateString('fr-FR')}</td>
          </tr>
        </table>
      </div>
      
      <center>
        <a href="${frontendUrl}/payments/history" class="button">Voir mon historique</a>
      </center>
      
      <p>Conservez cet email comme reçu de paiement.</p>
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

/**
 * Payment failed email
 */
const paymentFailedEmail = ({ firstName, transactionId, amount, currency, errorMessage }) => {
  return {
    subject: 'Échec du paiement ❌ - AELI Services',
    html: baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Votre paiement n'a malheureusement pas pu être traité.</p>
      
      <div class="info-box" style="border-left-color: #f44336;">
        <p><strong>Montant :</strong> ${amount.toLocaleString()} ${currency}</p>
        <p><strong>N° Transaction :</strong> ${transactionId}</p>
        ${errorMessage ? `<p><strong>Raison :</strong> ${errorMessage}</p>` : ''}
      </div>
      
      <p><strong>Causes possibles :</strong></p>
      <ul>
        <li>Solde insuffisant sur votre compte Mobile Money</li>
        <li>Transaction annulée ou expirée</li>
        <li>Problème technique temporaire</li>
      </ul>
      
      <center>
        <a href="${frontendUrl}/payments" class="button">Réessayer le paiement</a>
      </center>
      
      <p>Si le problème persiste, contactez votre opérateur Mobile Money ou notre support.</p>
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

/**
 * OTP verification email
 */
const otpEmail = ({ firstName, otp }) => {
  return {
    subject: 'Code de vérification AELI Services 🔐',
    html: baseTemplate(`
      <h2>Bonjour ${firstName} !</h2>
      <p>Voici votre code de vérification :</p>
      
      <div class="highlight" style="text-align: center;">
        <p style="font-size: 36px; letter-spacing: 8px; font-weight: bold; color: #e91e63; margin: 20px 0;">
          ${otp}
        </p>
      </div>
      
      <div class="info-box">
        <p>⏱️ Ce code expire dans <strong>10 minutes</strong>.</p>
        <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      </div>
      
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

/**
 * Subscription expiring reminder email (7 days before)
 */
const subscriptionExpiringEmail = ({ firstName, businessName, daysLeft, endDate, plan }) => {
  const planLabels = {
    trial: 'Période d\'essai',
    monthly: 'Mensuel',
    quarterly: 'Trimestriel',
    yearly: 'Annuel'
  };

  const pricing = {
    monthly: '5 000 FCFA',
    quarterly: '12 000 FCFA',
    yearly: '10 000 FCFA'
  };

  return {
    subject: `⚠️ Votre abonnement expire dans ${daysLeft} jours - AELI Services`,
    html: baseTemplate(`
      <h2>Bonjour ${firstName} !</h2>
      <p>Votre abonnement AELI Services pour <strong>"${businessName}"</strong> expire bientôt.</p>
      
      <div class="highlight" style="border-left: 4px solid #ff9800;">
        <p style="font-size: 18px;">⏰ <strong>${daysLeft} jours</strong> restants</p>
        <p>Expiration le: ${new Date(endDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>Plan actuel: ${planLabels[plan] || plan}</p>
      </div>
      
      <p><strong>Que se passe-t-il après expiration ?</strong></p>
      <ul>
        <li>Votre profil restera visible</li>
        <li>❌ Vos informations de contact seront masquées</li>
        <li>❌ Vos photos ne seront plus affichées</li>
        <li>Les clients ne pourront plus vous contacter</li>
      </ul>
      
      <div class="info-box">
        <p><strong>Renouvelez maintenant :</strong></p>
        <ul>
          <li>Mensuel: ${pricing.monthly}/mois</li>
          <li>Trimestriel: ${pricing.quarterly}/3 mois</li>
          <li>Annuel: ${pricing.yearly}/an (meilleur prix!)</li>
        </ul>
      </div>
      
      <center>
        <a href="${frontendUrl}/dashboard/subscription" class="button">Renouveler mon abonnement</a>
      </center>
      
      <p>Ne perdez pas vos clients ! Renouvelez dès maintenant pour continuer à recevoir des demandes.</p>
      
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

/**
 * Subscription expired email
 */
const subscriptionExpiredEmail = ({ firstName, businessName }) => {
  return {
    subject: '❌ Votre abonnement a expiré - AELI Services',
    html: baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Votre abonnement AELI Services pour <strong>"${businessName}"</strong> a expiré.</p>
      
      <div class="info-box" style="border-left-color: #f44336;">
        <p><strong>Conséquences :</strong></p>
        <ul>
          <li>Votre profil est toujours visible</li>
          <li>❌ Vos contacts (WhatsApp, téléphone) sont masqués</li>
          <li>❌ Vos photos ne sont plus affichées</li>
          <li>Les clients ne peuvent plus vous joindre</li>
        </ul>
      </div>
      
      <p>Renouvelez votre abonnement pour récupérer votre visibilité complète et continuer à recevoir des clients.</p>
      
      <center>
        <a href="${frontendUrl}/dashboard/subscription" class="button">Renouveler maintenant</a>
      </center>
      
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

/**
 * Contact status changed email (sent to sender)
 */
const contactStatusChangedEmail = ({ firstName, providerName, status }) => {
  const statusLabels = {
    read: 'lue',
    replied: 'répondue',
    pending: 'en attente'
  };
  const statusText = statusLabels[status] || status;

  // Don't send email for 'pending' status (reset) - no meaningful message to send
  if (status === 'pending') {
    return null;
  }
  return {
    subject: `Votre demande a été ${statusText} - AELI Services`,
    html: baseTemplate(`
      <h2>Bonjour ${firstName} ! 👋</h2>
      <p>Bonne nouvelle ! Votre demande de contact a été <strong>${statusText}</strong> par <strong>${providerName}</strong>.</p>
      ${status === 'replied' ? `
        <div class="highlight">
          <p>🎉 Le prestataire vous a répondu ! Consultez votre espace pour voir la réponse.</p>
        </div>
      ` : `
        <p>Le prestataire a vu votre message et reviendra vers vous prochainement.</p>
      `}
      <p style="text-align: center; margin-top: 30px;">
        <a href="${frontendUrl}/contacts" class="button">Voir mes contacts</a>
      </p>
    `)
  };
};

/**
 * Provider featured email (sent to provider when admin features them)
 */
const providerFeaturedEmail = ({ firstName, businessName, featured }) => {
  return {
    subject: featured ? '⭐ Votre profil est mis en avant !' : 'Mise en avant retirée',
    html: baseTemplate(`
      <h2>Bonjour ${firstName} ! 👋</h2>
      ${featured ? `
        <div class="highlight">
          <p>🎉 <strong>Félicitations !</strong> Votre profil <strong>${businessName}</strong> est maintenant mis en avant sur AELI Services !</p>
        </div>
        <p>Votre visibilité va augmenter considérablement. Vous apparaîtrez en priorité dans les recherches.</p>
      ` : `
        <p>La mise en avant de votre profil <strong>${businessName}</strong> a été retirée.</p>
        <p>Vous apparaissez maintenant dans les résultats standards.</p>
      `}
      <p style="text-align: center; margin-top: 30px;">
        <a href="${frontendUrl}/my-profile" class="button">Voir mon profil</a>
      </p>
    `)
  };
};

/**
 * Subscription renewed email
 */
const subscriptionRenewedEmail = ({ firstName, businessName, plan, endDate }) => {
  const planNames = { monthly: 'Mensuel', quarterly: 'Trimestriel', yearly: 'Annuel' };
  return {
    subject: '✅ Abonnement renouvelé - AELI Services',
    html: baseTemplate(`
      <h2>Merci ${firstName} ! 🎉</h2>
      <div class="highlight">
        <p>Votre abonnement pour <strong>${businessName}</strong> a été renouvelé avec succès !</p>
      </div>
      <div class="info-box">
        <p><strong>Plan :</strong> ${planNames[plan] || plan}</p>
        <p><strong>Valide jusqu'au :</strong> ${new Date(endDate).toLocaleDateString('fr-FR')}</p>
      </div>
      <p>Votre profil continuera d'être visible et vos contacts et photos resteront accessibles.</p>
      <p style="text-align: center; margin-top: 30px;">
        <a href="${frontendUrl}/my-dashboard" class="button">Accéder au tableau de bord</a>
      </p>
    `)
  };
};

/**
 * Account deactivated email
 */
const accountDeactivatedEmail = ({ firstName, reason }) => {
  return {
    subject: '⚠️ Compte désactivé - AELI Services',
    html: baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Votre compte AELI Services a été <strong>désactivé</strong>.</p>
      ${reason ? `
        <div class="info-box">
          <p><strong>Raison :</strong> ${reason}</p>
        </div>
      ` : ''}
      <p>Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter.</p>
      <p style="text-align: center; margin-top: 30px;">
        <a href="mailto:support@aeli-services.cm" class="button">Contacter le support</a>
      </p>
    `)
  };
};

/**
 * Password changed confirmation email
 */
const passwordChangedConfirmationEmail = ({ firstName }) => {
  return {
    subject: '🔐 Mot de passe modifié - AELI Services',
    html: baseTemplate(`
      <h2>Bonjour ${firstName} ! 🔒</h2>
      <div class="highlight">
        <p>Votre mot de passe a été <strong>modifié avec succès</strong>.</p>
      </div>
      <p>Si vous n'êtes pas à l'origine de cette modification, veuillez immédiatement :</p>
      <ul>
        <li>Réinitialiser votre mot de passe</li>
        <li>Contacter notre support</li>
      </ul>
      <p style="text-align: center; margin-top: 30px;">
        <a href="${frontendUrl}/forgot-password" class="button">Réinitialiser le mot de passe</a>
      </p>
    `)
  };
};

/**
 * Provider application approved email
 */
const providerApprovedEmail = ({ firstName, businessName }) => {
  return {
    subject: '🎉 Félicitations ! Votre candidature est approuvée - AELI Services',
    html: baseTemplate(`
      <h2>Bonjour ${firstName} ! 🎊</h2>
      <div class="highlight" style="background-color: #e8f5e9; border-color: #4caf50;">
        <p style="font-size: 18px; color: #2e7d32;">
          ✅ Votre candidature pour <strong>${businessName}</strong> a été <strong>APPROUVÉE</strong> !
        </p>
      </div>
      <p>Vous êtes maintenant officiellement prestataire sur AELI Services ! 🌸</p>
      <h3>Prochaines étapes :</h3>
      <ul>
        <li>✓ Votre profil prestataire est créé</li>
        <li>✓ Vous bénéficiez d'un <strong>essai gratuit de 30 jours</strong></li>
        <li>✓ Vous êtes visible par les clients dès maintenant</li>
      </ul>
      <h3>Pour compléter votre profil :</h3>
      <ul>
        <li>Ajoutez vos services avec les prix</li>
        <li>Complétez votre galerie photos</li>
        <li>Répondez rapidement aux demandes de contact</li>
      </ul>
      <p style="text-align: center; margin-top: 30px;">
        <a href="${frontendUrl}/provider/dashboard" class="button">Accéder à mon dashboard</a>
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        Besoin d'aide ? Notre équipe est à votre disposition : support@aeli-services.cm
      </p>
    `)
  };
};

/**
 * Provider application rejected email
 */
const providerRejectedEmail = ({ firstName, rejectionReason }) => {
  return {
    subject: '📋 Votre candidature nécessite des modifications - AELI Services',
    html: baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Nous avons examiné votre candidature pour devenir prestataire sur AELI Services.</p>
      <div class="highlight" style="background-color: #fff3e0; border-color: #ff9800;">
        <p><strong>Malheureusement, nous ne pouvons pas approuver votre candidature pour le moment.</strong></p>
      </div>
      <h3>Motif :</h3>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <p style="margin: 0;">${rejectionReason}</p>
      </div>
      <h3>Que faire maintenant ?</h3>
      <ul>
        <li>Corrigez les points mentionnés ci-dessus</li>
        <li>Vous pouvez soumettre une nouvelle candidature dans <strong>7 jours</strong></li>
        <li>Assurez-vous que vos documents sont lisibles et valides</li>
      </ul>
      <p style="text-align: center; margin-top: 30px;">
        <a href="${frontendUrl}/become-provider" class="button">Soumettre une nouvelle candidature</a>
      </p>
      <p style="color: #666; font-size: 14px;">
        Des questions ? Contactez-nous : support@aeli-services.cm
      </p>
    `)
  };
};

/**
 * Provider application received email (sent when application is submitted)
 */
const applicationReceivedEmail = ({ firstName, businessName }) => {
  return {
    subject: '📋 Candidature reçue - AELI Services',
    html: baseTemplate(`
      <h2>Bonjour ${firstName} ! 📝</h2>
      <div class="highlight">
        <p>Votre candidature pour devenir prestataire a été <strong>reçue avec succès</strong> !</p>
      </div>
      <h3>Récapitulatif :</h3>
      <ul>
        <li><strong>Activité :</strong> ${businessName}</li>
        <li><strong>Statut :</strong> En attente d'examen</li>
      </ul>
      <h3>Prochaines étapes :</h3>
      <ol>
        <li>Notre équipe va examiner votre dossier</li>
        <li>Vous recevrez un email avec notre décision sous <strong>48-72h ouvrées</strong></li>
        <li>Si approuvé, votre profil prestataire sera créé automatiquement</li>
      </ol>
      <p>Assurez-vous que vos documents (CNI, photos) sont lisibles pour accélérer le traitement.</p>
      <p style="text-align: center; margin-top: 30px;">
        <a href="${frontendUrl}/my-application" class="button">Suivre ma candidature</a>
      </p>
      <p style="color: #666; font-size: 14px;">
        Des questions ? support@aeli-services.cm
      </p>
    `)
  };
};

/**
 * Provider verification revoked email (sent when admin revokes verified status of an existing provider)
 */
const providerVerificationRevokedEmail = ({ firstName, businessName, reason }) => {
  return {
    subject: '⚠️ Statut de vérification retiré - AELI Services',
    html: baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Nous vous informons que le statut de vérification de votre profil prestataire <strong>"${businessName}"</strong> a été <strong>retiré</strong>.</p>
      <div class="info-box" style="border-left-color: #f44336;">
        <p><strong>Motif :</strong></p>
        <p>${reason}</p>
      </div>
      <h3>Conséquences :</h3>
      <ul>
        <li>❌ Votre profil n'apparaît plus comme vérifié auprès des clients</li>
        <li>❌ Votre visibilité dans les recherches est réduite</li>
        <li>Votre compte reste actif et vos données sont conservées</li>
      </ul>
      <h3>Que faire ?</h3>
      <ul>
        <li>Corrigez les points mentionnés dans le motif ci-dessus</li>
        <li>Soumettez à nouveau vos documents pour une nouvelle vérification</li>
        <li>Contactez notre support si vous avez des questions</li>
      </ul>
      <p style="text-align: center; margin-top: 30px;">
        <a href="${frontendUrl}/dashboard/documents" class="button">Soumettre mes documents</a>
      </p>
      <p style="color: #666; font-size: 14px;">
        Des questions ? Contactez-nous : support@aeli-services.cm
      </p>
    `)
  };
};

/**
 * Provider deactivated email (sent when admin deactivates a provider)
 */
const providerDeactivatedEmail = ({ firstName, businessName, reason }) => {
  return {
    subject: '⚠️ Votre profil prestataire a été désactivé - AELI Services',
    html: baseTemplate(`
      <h2>Bonjour ${firstName},</h2>
      <p>Nous vous informons que votre profil prestataire <strong>"${businessName}"</strong> a été <strong>temporairement désactivé</strong> sur AELI Services.</p>
      
      <div class="info-box" style="border-left-color: #ff9800;">
        <p><strong>Raison :</strong></p>
        <p>${reason}</p>
      </div>
      
      <h3>Conséquences :</h3>
      <ul>
        <li>❌ Votre profil n'apparaît plus dans les résultats de recherche</li>
        <li>❌ Les clients ne peuvent plus vous trouver sur la plateforme</li>
        <li>✅ Votre compte utilisateur reste actif</li>
        <li>✅ Vos données sont conservées</li>
      </ul>
      
      <p>Pour résoudre cette situation et réactiver votre profil, veuillez contacter notre service client :</p>
      
      <center>
        <a href="mailto:support@aeli-services.cm" class="button">📧 Contacter le service client</a>
      </center>
      
      <div class="highlight">
        <p>💡 Vous pouvez également nous joindre par WhatsApp ou téléphone aux horaires d'ouverture.</p>
      </div>
      
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

/**
 * Provider reactivated email (sent when admin reactivates a provider)
 */
const providerReactivatedEmail = ({ firstName, businessName }) => {
  return {
    subject: '✅ Votre profil prestataire est réactivé - AELI Services',
    html: baseTemplate(`
      <h2>Bonjour ${firstName} ! 🎉</h2>
      <div class="highlight" style="background-color: #e8f5e9;">
        <p>Bonne nouvelle ! Votre profil prestataire <strong>"${businessName}"</strong> a été <strong>réactivé</strong> sur AELI Services.</p>
      </div>
      
      <p>Votre profil est de nouveau visible par les clients et vous pouvez recevoir des demandes de contact.</p>
      
      <center>
        <a href="${frontendUrl}/dashboard" class="button">Accéder à mon tableau de bord</a>
      </center>
      
      <p><em>L'équipe AELI Services</em></p>
    `)
  };
};

module.exports = {
  welcomeEmail,
  newContactEmail,
  accountVerifiedEmail,
  newReviewEmail,
  passwordResetEmail,
  documentsReceivedEmail,
  documentsRejectedEmail,
  paymentSuccessEmail,
  paymentFailedEmail,
  otpEmail,
  subscriptionExpiringEmail,
  subscriptionExpiredEmail,
  contactStatusChangedEmail,
  providerFeaturedEmail,
  subscriptionRenewedEmail,
  accountDeactivatedEmail,
  passwordChangedConfirmationEmail,
  providerApprovedEmail,
  providerRejectedEmail,
  applicationReceivedEmail,
  providerVerificationRevokedEmail,
  providerDeactivatedEmail,
  providerReactivatedEmail
};
