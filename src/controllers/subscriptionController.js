/**
 * Subscription Controller
 * Handles provider subscription management only
 * Business Model:
 * - Clients: FREE access to everything
 * - Providers: 30-day FREE trial, then pay monthly/quarterly/yearly
 * - Expired: visible but no contact info, no images
 */

const { Subscription, Provider, User, Payment } = require("../models");
const { asyncHandler, AppError } = require("../middlewares/errorHandler");
const { i18nResponse } = require("../utils/helpers");
const { initializeCinetPayPayment } = require("../utils/paymentGateway");

/**
 * @desc    Get subscription plans and pricing
 * @route   GET /api/subscriptions/plans
 * @access  Public
 */
const getPlans = asyncHandler(async (req, res) => {
  i18nResponse(req, res, 200, "subscription.plans", {
    plans: {
      monthly: {
        price: 5000,
        currency: "XAF",
        duration: "30 jours",
        description: "Abonnement mensuel",
      },
      quarterly: {
        price: 12000,
        currency: "XAF",
        duration: "90 jours",
        description: "Abonnement trimestriel (économisez 20%)",
      },
      yearly: {
        price: 10000,
        currency: "XAF",
        duration: "365 jours",
        description: "Abonnement annuel (meilleur prix)",
      },
    },
    trialInfo: {
      duration: "30 jours",
      price: 0,
      description:
        "Période d'essai gratuite pour tous les nouveaux prestataires",
    },
  });
});

/**
 * @desc    Get my subscription status (provider only)
 * @route   GET /api/subscriptions/my
 * @access  Private (provider)
 */
const getMySubscription = asyncHandler(async (req, res) => {
  // Get provider for this user
  const provider = await Provider.findOne({ where: { userId: req.user.id } });

  if (!provider) {
    throw new AppError(req.t("subscription.providerRequired"), 400);
  }

  const status = await Subscription.getStatus(provider.id);

  i18nResponse(req, res, 200, "subscription.status", {
    subscription: status,
    plans: Subscription.PLANS,
  });
});

/**
 * @desc    Subscribe to a plan (provider only)
 * @route   POST /api/subscriptions/subscribe
 * @access  Private (provider)
 */
const subscribe = asyncHandler(async (req, res) => {
  const { plan } = req.body;

  // Validate plan
  if (!["monthly", "quarterly", "yearly"].includes(plan)) {
    throw new AppError(req.t("subscription.invalidPlan"), 400);
  }

  // Get provider
  const provider = await Provider.findOne({ where: { userId: req.user.id } });
  if (!provider) {
    throw new AppError(req.t("subscription.providerRequired"), 400);
  }

  const planConfig = Subscription.PLANS[plan];

  // Create payment
  const transactionId = `AELI${Date.now()}${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`;

  const payment = await Payment.create({
    userId: req.user.id,
    providerId: provider.id,
    amount: planConfig.price,
    currency: "XAF",
    type: "subscription",
    description: `Abonnement ${plan} - ${planConfig.days} jours`,
    status: "PENDING",
    transactionId,
    metadata: { plan },
  });

  try {
    const cinetpayResponse = await initializeCinetPayPayment({
      transactionId: payment.transactionId,
      amount: payment.amount,
      description: payment.description
    });

    if (cinetpayResponse.code === "201") {
      payment.paymentToken = cinetpayResponse.data.payment_token;
      payment.paymentUrl = cinetpayResponse.data.payment_url;
      await payment.save();

      i18nResponse(req, res, 201, "subscription.paymentInitiated", {
        paymentId: payment.id,
        transactionId: payment.transactionId,
        paymentUrl: payment.paymentUrl,
        amount: planConfig.price,
        currency: "XAF",
        plan,
        duration: `${planConfig.days} jours`,
      });
    } else {
      payment.status = "REFUSED";
      payment.errorMessage = cinetpayResponse.message;
      await payment.save();
      throw new AppError(req.t("payment.failed"), 400);
    }
  } catch (error) {
    if (payment.status !== "REFUSED") {
      payment.status = "REFUSED";
      payment.errorMessage = error.message;
      await payment.save();
    }
    throw error;
  }
});

/**
 * Activate subscription after payment success
 * Called from payment webhook
 */
const activateSubscription = async (payment) => {
  if (payment.type === "subscription" && payment.metadata?.plan) {
    const { plan } = payment.metadata;

    await Subscription.renewSubscription(payment.providerId, plan, payment.id);

    // Update provider visibility
    await Provider.update(
      { isVisible: true },
      { where: { id: payment.providerId } }
    );
  }
};

/**
 * @desc    Check if provider has active subscription (for public profile)
 * @route   GET /api/subscriptions/provider/:providerId/status
 * @access  Public
 */
const checkProviderStatus = asyncHandler(async (req, res) => {
  const { providerId } = req.params;

  const status = await Subscription.getStatus(providerId);

  i18nResponse(req, res, 200, "subscription.providerStatus", {
    isActive: status.isActive,
    // Don't expose detailed subscription info publicly
    canContact: status.isActive,
    showImages: status.isActive,
  });
});

/**
 * Send reminder emails for expiring subscriptions
 * Called by cron job daily
 */
const sendExpirationReminders = async () => {
  const { subscriptionExpiringEmail } = require("../utils/emailTemplates");
  const { sendEmailSafely } = require("../utils/helpers");

  const expiringSoon = await Subscription.getExpiringSoon();
  let sentCount = 0;

  for (const sub of expiringSoon) {
    if (sub.provider?.user?.email) {
      const daysLeft = Math.ceil(
        (sub.endDate - new Date()) / (1000 * 60 * 60 * 24)
      );

      await sendEmailSafely(
        {
          to: sub.provider.user.email,
          ...subscriptionExpiringEmail({
            firstName: sub.provider.user.firstName,
            businessName: sub.provider.businessName,
            daysLeft,
            endDate: sub.endDate,
            plan: sub.plan,
          }),
        },
        "Subscription expiration reminder"
      );

      await Subscription.markReminderSent(sub.id);
      sentCount++;
    }
  }

  return sentCount;
};

/**
 * Expire old subscriptions and update provider visibility
 * Called by cron job
 */
const processExpiredSubscriptions = async () => {
  const count = await Subscription.expireOldSubscriptions();

  // Note: We don't set isVisible=false because expired profiles stay visible
  // but without contact info and images (handled in getProviderById)

  return count;
};

module.exports = {
  getPlans,
  getMySubscription,
  subscribe,
  activateSubscription,
  checkProviderStatus,
  sendExpirationReminders,
  processExpiredSubscriptions,
};
