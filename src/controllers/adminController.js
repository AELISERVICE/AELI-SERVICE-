const { Op, fn, col, literal } = require("sequelize");
const {
  User,
  Provider,
  Service,
  Review,
  Contact,
  Category,
  Payment,
} = require("../models");
const { asyncHandler, AppError } = require("../middlewares/errorHandler");
const {
  i18nResponse,
  getPaginationParams,
  getPaginationData,
  sendEmailSafely,
} = require("../utils/helpers");
const {
  accountVerifiedEmail,
  providerFeaturedEmail,
} = require("../utils/emailTemplates");
const cache = require("../config/redis");
const { auditLogger } = require("../middlewares/audit");
const logger = require("../utils/logger");

/**
 * @desc    Get platform statistics (OPTIMIZED)
 * @route   GET /api/admin/stats
 * @access  Private (admin)
 *
 * Optimization: Reduced from ~19 sequential queries to ~9 parallel queries
 * using Promise.all() and grouped aggregates
 */
const getStats = asyncHandler(async (req, res) => {
  // Run all queries in parallel for better performance
  const [
    // User stats with single grouped query
    userStats,
    // Provider stats with single grouped query
    providerStats,
    // Service count
    totalServices,
    // Review stats (count + avg in one query)
    reviewStats,
    // Contact stats with grouped query
    contactStats,
    // Payment stats with grouped query
    paymentStats,
    // Recent data
    recentUsers,
    recentProviders,
  ] = await Promise.all([
    // 1. User stats - Single query with grouping
    User.findAll({
      attributes: ["role", [fn("COUNT", col("id")), "count"]],
      group: ["role"],
      raw: true,
    }),

    // 2. Provider stats - Single query with conditional counts
    Provider.findOne({
      attributes: [
        [fn("COUNT", col("id")), "total"],
        [
          fn("SUM", literal("CASE WHEN is_verified = true THEN 1 ELSE 0 END")),
          "active",
        ],
        [
          fn("SUM", literal("CASE WHEN is_verified = false THEN 1 ELSE 0 END")),
          "pending",
        ],
        [
          fn("SUM", literal("CASE WHEN is_featured = true THEN 1 ELSE 0 END")),
          "featured",
        ],
      ],
      raw: true,
    }),

    // 3. Services count
    Service.count({ where: { isActive: true } }),

    // 4. Review stats - Combined count and avg
    Review.findOne({
      attributes: [
        [fn("COUNT", col("id")), "total"],
        [fn("AVG", col("rating")), "avgRating"],
      ],
      where: { isVisible: true },
      raw: true,
    }),

    // 5. Contact stats - Single grouped query
    Contact.findAll({
      attributes: ["status", [fn("COUNT", col("id")), "count"]],
      group: ["status"],
      raw: true,
    }),

    // 6. Payment stats - Single grouped query with total amount
    Payment.findAll({
      attributes: [
        "status",
        [fn("COUNT", col("id")), "count"],
        [fn("SUM", col("amount")), "totalAmount"],
      ],
      group: ["status"],
      raw: true,
    }),

    // 7. Recent users (last 5) - include all user info like registration response
    User.findAll({
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "role",
        "phoneNumber",
        "country",
        "gender",
        "isEmailVerified",
        "isActive",
        "lastLoginAt",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),

    // 8. Recent providers (with complete information)
    Provider.findAll({
      attributes: [
        "id",
        "businessName",
        "description",
        "location",
        "phone",
        "email",
        "website",
        "isVerified",
        "isFeatured",
        "verificationStatus",
        "rating",
        "views",
        "totalReviews",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "phoneNumber",
            "country",
            "gender",
            "isEmailVerified",
            "isActive",
            "lastLoginAt",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
  ]);

  // Process user stats
  const userStatsMap = userStats.reduce(
    (acc, row) => {
      acc[row.role] = parseInt(row.count);
      return acc;
    },
    { client: 0, provider: 0, admin: 0 }
  );

  const totalUsers = Object.values(userStatsMap).reduce((a, b) => a + b, 0);

  // Process contact stats
  const contactStatsMap = contactStats.reduce(
    (acc, row) => {
      acc[row.status] = parseInt(row.count);
      return acc;
    },
    { pending: 0, read: 0, replied: 0 }
  );

  const totalContacts = Object.values(contactStatsMap).reduce(
    (a, b) => a + b,
    0
  );

  // Process payment stats
  const paymentStatsMap = paymentStats.reduce(
    (acc, row) => {
      acc[row.status] = {
        count: parseInt(row.count),
        amount: parseInt(row.totalAmount || 0),
      };
      return acc;
    },
    {
      accepted: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      refused: { count: 0, amount: 0 },
      cancelled: { count: 0, amount: 0 },
    }
  );

  const totalPayments = Object.values(paymentStatsMap).reduce(
    (a, b) => a + b.count,
    0
  );

  i18nResponse(req, res, 200, "admin.stats", {
    users: {
      total: totalUsers,
      clients: userStatsMap.client || 0,
      providers: userStatsMap.provider || 0,
    },
    providers: {
      total: parseInt(providerStats?.total || 0),
      active: parseInt(providerStats?.active || 0),
      pending: parseInt(providerStats?.pending || 0),
      featured: parseInt(providerStats?.featured || 0),
    },
    services: {
      total: totalServices,
    },
    reviews: {
      total: parseInt(reviewStats?.total || 0),
      averageRating: parseFloat(reviewStats?.avgRating || 0).toFixed(2),
    },
    contacts: {
      total: totalContacts,
      pending: contactStatsMap.pending || 0,
    },
    payments: {
      total: totalPayments,
      totalAmount: paymentStatsMap.accepted?.amount || 0,
      accepted: paymentStatsMap.accepted?.count || 0,
      pending: paymentStatsMap.pending?.count || 0,
      refused: paymentStatsMap.refused?.count || 0,
      cancelled: paymentStatsMap.cancelled?.count || 0,
    },
    recentUsers,
    recentProviders,
  });
});

/**
 * @desc    Get pending providers
 * @route   GET /api/admin/providers/pending
 * @access  Private (admin)
 */
const getPendingProviders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { limit: queryLimit, offset } = getPaginationParams(page, limit);

  const { count, rows: providers } = await Provider.findAndCountAll({
    where: { isVerified: false },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "phone"],
      },
    ],
    order: [["createdAt", "ASC"]],
    limit: queryLimit,
    offset,
  });

  const pagination = getPaginationData(page, queryLimit, count);

  i18nResponse(req, res, 200, "admin.providersUnderReview", {
    providers,
    pagination,
  });
});

/**
 * @desc    Verify/reject a provider
 * @route   PUT /api/admin/providers/:id/verify
 * @access  Private (admin)
 */
const verifyProvider = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isVerified } = req.body;

  const provider = await Provider.findByPk(id, {
    include: [{ model: User, as: "user" }],
  });

  if (!provider) {
    throw new AppError(req.t("provider.notFound"), 404);
  }

  const oldValues = { isVerified: provider.isVerified };
  provider.isVerified = isVerified;
  await provider.save({ fields: ["isVerified"] });

  // Audit Log
  auditLogger.providerVerified(req, provider, isVerified);

  // Send email notification if verified (optional - don't fail if email system is down)
  if (isVerified && provider.user) {
    await sendEmailSafely(
      {
        to: provider.user.email,
        ...accountVerifiedEmail({
          firstName: provider.user.firstName,
          businessName: provider.businessName,
        }),
      },
      "Provider verification"
    );
  }

  // Invalidate cache
  await cache.delByPattern("route:/api/providers*");

  i18nResponse(
    req,
    res,
    200,
    isVerified ? "provider.verified" : "provider.rejected",
    { provider }
  );
});

/**
 * @desc    Toggle featured status
 * @route   PUT /api/admin/providers/:id/feature
 * @access  Private (admin)
 */
const featureProvider = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isFeatured } = req.body;

  const provider = await Provider.findByPk(id, {
    include: [{ model: User, as: "user" }],
  });
  if (!provider) {
    throw new AppError(req.t("provider.notFound"), 404);
  }

  provider.isFeatured = isFeatured;
  await provider.save({ fields: ["isFeatured"] });

  // Send email notification to provider (optional - don't fail if email system is down)
  if (provider.user && provider.user.email) {
    await sendEmailSafely(
      {
        to: provider.user.email,
        ...providerFeaturedEmail({
          firstName: provider.user.firstName,
          businessName: provider.businessName,
          featured: isFeatured,
        }),
      },
      "Provider featured status"
    );
  }

  // Invalidate cache
  await cache.delByPattern("route:/api/providers*");

  i18nResponse(
    req,
    res,
    200,
    isFeatured ? "provider.featured" : "provider.unfeatured",
    { provider }
  );
});

/**
 * @desc    Activate/deactivate user account
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (admin)
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    throw new AppError(req.t("user.notFound"), 404);
  }

  // Prevent admin from deactivating themselves
  if (user.id === req.user.id) {
    throw new AppError(req.t("admin.cannotDeactivateSelf"), 400);
  }

  const oldValues = { isActive: user.isActive };
  user.isActive = isActive;
  await user.save({ fields: ["isActive"] });

  // Audit Log
  auditLogger.userStatusChanged(req, user, isActive);

  i18nResponse(
    req,
    res,
    200,
    isActive ? "admin.userActivated" : "admin.userDeactivated",
    {
      user: user.toPublicJSON(),
    }
  );
});

/**
 * @desc    Get all reviews (moderation)
 * @route   GET /api/admin/reviews
 * @access  Private (admin)
 */
const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, visible } = req.query;
  const { limit: queryLimit, offset } = getPaginationParams(page, limit);

  const where = {};
  if (visible !== undefined) {
    where.isVisible = visible === "true";
  }

  const { count, rows: reviews } = await Review.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email"],
      },
      { model: Provider, as: "provider", attributes: ["id", "businessName"] },
    ],
    order: [["createdAt", "DESC"]],
    limit: queryLimit,
    offset,
  });

  const pagination = getPaginationData(page, queryLimit, count);

  i18nResponse(req, res, 200, "review.list", { reviews, pagination });
});

/**
 * @desc    Toggle review visibility
 * @route   PUT /api/admin/reviews/:id/visibility
 * @access  Private (admin)
 */
const updateReviewVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isVisible } = req.body;

  const review = await Review.findByPk(id);
  if (!review) {
    throw new AppError(req.t("review.notFound"), 404);
  }

  review.isVisible = isVisible;
  await review.save({ fields: ["isVisible"] });

  // Recalculate provider rating
  const provider = await Provider.findByPk(review.providerId);
  if (provider) {
    await provider.updateRating(null, false);
  }

  // Audit Log
  auditLogger.reviewModerated(req, review, isVisible);

  // Invalidate cache
  await cache.delByPattern("route:/api/providers*");

  i18nResponse(req, res, 200, isVisible ? "review.visible" : "review.hidden", {
    review,
  });
});

/**
 * @desc    Get all users (admin)
 * @route   GET /api/admin/users
 * @access  Private (admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const { limit: queryLimit, offset } = getPaginationParams(page, limit);

  const where = {};
  if (role) where.role = role;
  if (search) {
    where[Op.or] = [
      { firstName: { [Op.iLike]: `%${search}%` } },
      { lastName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows: users } = await User.findAndCountAll({
    where,
    attributes: {
      exclude: ["password", "resetPasswordToken", "resetPasswordExpires"],
    },
    order: [["createdAt", "DESC"]],
    limit: queryLimit,
    offset,
  });

  const pagination = getPaginationData(page, queryLimit, count);

  i18nResponse(req, res, 200, "common.list", { users, pagination });
});

/**
 * @desc    Get providers with documents under review
 * @route   GET /api/admin/providers/under-review
 * @access  Private (admin)
 */
const getProvidersUnderReview = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { limit: queryLimit, offset } = getPaginationParams(page, limit);

  const { count, rows: providers } = await Provider.findAndCountAll({
    where: { verificationStatus: "under_review" },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "phone"],
      },
    ],
    order: [["createdAt", "ASC"]],
    limit: queryLimit,
    offset,
  });

  const pagination = getPaginationData(page, queryLimit, count);

  i18nResponse(req, res, 200, "admin.providersUnderReview", {
    providers,
    pagination,
  });
});

/**
 * @desc    Review provider documents (approve/reject)
 * @route   PUT /api/admin/providers/:id/review-documents
 * @access  Private (admin)
 */
const reviewProviderDocuments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision, notes, approvedDocuments, rejectedDocuments } = req.body;
  // decision: 'approved' or 'rejected'
  // approvedDocuments: [indexes of approved docs]
  // rejectedDocuments: [indexes of rejected docs with reasons]

  const provider = await Provider.findByPk(id, {
    include: [{ model: User, as: "user" }],
  });

  if (!provider) {
    throw new AppError(req.t("provider.notFound"), 404);
  }

  if (!["approved", "rejected", "under_review"].includes(decision)) {
    throw new AppError(req.t("common.badRequest"), 400);
  }

  // Update document statuses
  const documents = provider.documents || [];

  if (approvedDocuments && Array.isArray(approvedDocuments)) {
    approvedDocuments.forEach((idx) => {
      if (documents[idx]) documents[idx].status = "approved";
    });
  }

  if (rejectedDocuments && Array.isArray(rejectedDocuments)) {
    rejectedDocuments.forEach((item) => {
      if (documents[item.index]) {
        documents[item.index].status = "rejected";
        documents[item.index].rejectionReason = item.reason;
      }
    });
  }

  // Update provider verification status
  if (decision === "approved") {
    provider.verificationStatus = "approved";
    provider.isVerified = true;
    provider.verifiedAt = new Date();
    provider.verifiedBy = req.user.id;

    // Send approval email
    if (provider.user) {
      await sendEmailSafely(
        {
          to: provider.user.email,
          ...accountVerifiedEmail({
            firstName: provider.user.firstName,
            businessName: provider.businessName,
          }),
        },
        "Provider documents approved"
      );
    }
  } else if (decision === "rejected") {
    provider.verificationStatus = "rejected";
    provider.isVerified = false;

    // Send rejection email
    if (provider.user) {
      const { documentsRejectedEmail } = require("../utils/emailTemplates");
      const rejectionReasons = rejectedDocuments
        ? rejectedDocuments.map((d) => d.reason).filter(Boolean)
        : [];

      await sendEmailSafely(
        {
          to: provider.user.email,
          ...documentsRejectedEmail({
            firstName: provider.user.firstName,
            businessName: provider.businessName,
            reasons: rejectionReasons,
            notes: notes,
          }),
        },
        "Provider documents rejected"
      );
    }
  } else {
    // decision === 'under_review'
    provider.verificationStatus = "under_review";
  }

  const oldStatus = provider.verificationStatus;
  const oldDocuments = JSON.parse(JSON.stringify(provider.documents || []));

  provider.documents = documents;
  provider.verificationNotes = notes || null;
  await provider.save();

  // Audit Log
  auditLogger.documentsReviewed(req, provider, decision, notes);

  // Invalidate cache
  await cache.delByPattern("route:/api/providers*");

  i18nResponse(
    req,
    res,
    200,
    decision === "approved" ? "documents.approved" : "documents.rejected",
    {
      provider: {
        id: provider.id,
        businessName: provider.businessName,
        verificationStatus: provider.verificationStatus,
        isVerified: provider.isVerified,
        documents: provider.documents,
        verificationNotes: provider.verificationNotes,
      },
    }
  );
});

module.exports = {
  getStats,
  getPendingProviders,
  verifyProvider,
  featureProvider,
  updateUserStatus,
  getAllReviews,
  updateReviewVisibility,
  getAllUsers,
  getProvidersUnderReview,
  reviewProviderDocuments,
};
