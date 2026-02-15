const { Banner } = require("../models");
const { asyncHandler, AppError } = require("../middlewares/errorHandler");
const { i18nResponse } = require("../middlewares/i18n");
const { deleteImage } = require("../config/cloudinary");
const { delByPattern } = require("../config/redis");
const { Op } = require("sequelize");

/**
 * @desc    Get all active banners
 * @route   GET /api/banners
 * @access  Public
 */
const getActiveBanners = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const now = new Date();

  const where = {
    isActive: true,
    [Op.and]: [
      {
        [Op.or]: [{ startDate: null }, { startDate: { [Op.lte]: now } }],
      },
      {
        [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: now } }],
      },
    ],
  };

  if (type) {
    where.type = type;
  }

  const banners = await Banner.findAll({
    where,
    order: [
      ["order", "ASC"],
      ["created_at", "DESC"],
    ],
  });

  i18nResponse(req, res, 200, "success", { banners });
});

/**
 * @desc    Get all banners (Admin only)
 * @route   GET /api/banners/admin
 * @access  Private/Admin
 */
const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.findAll({
    order: [
      ["order", "ASC"],
      ["created_at", "DESC"],
    ],
  });

  i18nResponse(req, res, 200, "success", { banners });
});

/**
 * @desc    Create new banner (Admin only)
 * @route   POST /api/banners
 * @access  Private/Admin
 */
const createBanner = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    linkUrl,
    type,
    startDate,
    endDate,
    order,
    isActive,
  } = req.body;

  if (!req.file) {
    throw new AppError("L'illustration de la bannière est requise", 400);
  }

  const banner = await Banner.create({
    title,
    description,
    linkUrl,
    type,
    startDate,
    endDate,
    order: order || 0,
    isActive: isActive !== undefined ? isActive : true,
    imageUrl: req.file.path,
    publicId: req.file.filename, // multer-storage-cloudinary uses filename for public_id
  });

  // Invalidate cache
  await delByPattern("route:/api/banners*");

  i18nResponse(req, res, 201, "banner.created", { banner });
});

/**
 * @desc    Update banner (Admin only)
 * @route   PUT /api/banners/:id
 * @access  Private/Admin
 */
const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByPk(req.params.id);

  if (!banner) {
    throw new AppError("Bannière non trouvée", 404);
  }

  const {
    title,
    description,
    linkUrl,
    type,
    startDate,
    endDate,
    order,
    isActive,
  } = req.body;

  const updateData = {
    title: title || banner.title,
    description: description !== undefined ? description : banner.description,
    linkUrl: linkUrl !== undefined ? linkUrl : banner.linkUrl,
    type: type || banner.type,
    startDate: startDate !== undefined ? startDate : banner.startDate,
    endDate: endDate !== undefined ? endDate : banner.endDate,
    order: order !== undefined ? order : banner.order,
    isActive: isActive !== undefined ? isActive : banner.isActive,
  };

  if (req.file) {
    // Delete old image from Cloudinary
    if (banner.publicId) {
      await deleteImage(banner.publicId);
    }
    updateData.imageUrl = req.file.path;
    updateData.publicId = req.file.filename;
  }

  await banner.update(updateData);

  // Invalidate cache
  await delByPattern("route:/api/banners*");

  i18nResponse(req, res, 200, "banner.updated", { banner });
});

/**
 * @desc    Delete banner (Admin only)
 * @route   DELETE /api/banners/:id
 * @access  Private/Admin
 */
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByPk(req.params.id);

  if (!banner) {
    throw new AppError("Bannière non trouvée", 404);
  }

  // Delete image from Cloudinary
  if (banner.publicId) {
    const logger = require("../utils/logger");
    await deleteImage(banner.publicId).catch((err) => {
      logger.error("Cloudinary delete error:", {
        error: err.message,
        stack: err.stack,
        publicId: banner.publicId,
      });
    });
  }

  await banner.destroy();

  // Invalidate cache
  await delByPattern("route:/api/banners*");

  i18nResponse(req, res, 200, "banner.deleted");
});

module.exports = {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
