/**
 * Email templates for AELI Services
 */

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
        <a href="${process.env.FRONTEND_URL}" class="button">Découvrir la plateforme</a>
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
        <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Voir dans mon tableau de bord</a>
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
        <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Optimiser mon profil</a>
      </center>
      
      <p>Bonne continuation sur AELI Services !</p>
      <p><em>L'équipe AELI</em></p>
    `)
    };
};

/**
 * New review notification email (sent to provider)
 */
const newReviewEmail = ({ providerName, reviewerName, rating, comment }) => {
    const stars = '⭐'.repeat(rating);

    return {
        subject: `Nouvel avis reçu : ${stars}`,
        html: baseTemplate(`
      <h2>Bonjour ${providerName} !</h2>
      <p>Vous avez reçu un nouvel avis sur votre profil AELI Services.</p>
      
      <div class="highlight">
        <p><strong>${reviewerName}</strong> vous a attribué ${rating}/5</p>
        <p style="font-size: 24px;">${stars}</p>
        ${comment ? `<p><em>"${comment}"</em></p>` : ''}
      </div>
      
      <p>Les avis positifs renforcent votre crédibilité auprès des futures clientes. Continuez votre excellent travail !</p>
      
      <center>
        <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Voir tous mes avis</a>
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

module.exports = {
    welcomeEmail,
    newContactEmail,
    accountVerifiedEmail,
    newReviewEmail,
    passwordResetEmail
};
