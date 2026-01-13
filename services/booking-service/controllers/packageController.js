const mongoose = require('mongoose');
const Package = require('../models/Package');

const jsonSuccess = (res, status, data) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

const jsonError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const isValidId = (id) => mongoose.isValidObjectId(id);

const canManageAny = (user) => {
  const role = user?.role;
  return role === 'admin' || role === 'superadmin';
};

const isCreatorOrAdmin = (user) => {
  const role = user?.role;
  return role === 'creator' || role === 'admin' || role === 'superadmin';
};

const getPackageCreatorId = (pkg) => {
  if (!pkg) return null;

  // Support some legacy fields that may exist in older documents.
  const candidate =
    pkg.creatorId ??
    pkg.creator_id ??
    pkg.creator ??
    pkg.createdBy ??
    (pkg.creator && pkg.creator._id);

  if (!candidate) return null;
  if (typeof candidate === 'object') return candidate._id ?? candidate.id ?? null;
  return candidate;
};

exports.createPackage = async (req, res) => {
  try {
    if (!isCreatorOrAdmin(req.user)) {
      return jsonError(res, 403, 'Forbidden');
    }

    const { title, description, destination, price, duration, images } = req.body;

    if (!title || !description || !destination || price === undefined || !duration) {
      return jsonError(res, 400, 'Missing required fields');
    }

    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return jsonError(res, 400, 'Invalid price');
    }

    const pkg = await Package.create({
      title: String(title).trim(),
      description: String(description).trim(),
      destination: String(destination).trim(),
      price: parsedPrice,
      duration: String(duration).trim(),
      images: Array.isArray(images) ? images.filter((x) => typeof x === 'string') : [],
      creatorId: req.user._id,
    });

    return jsonSuccess(res, 201, pkg);
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

exports.getAllPackages = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitRaw = parseInt(req.query.limit, 10) || 10;
    const limit = Math.min(Math.max(limitRaw, 1), 50);
    const skip = (page - 1) * limit;

    const sortKey = req.query.sort === 'price' ? 'price' : 'createdAt';
    const sort = sortKey === 'price' ? { price: 1 } : { createdAt: -1 };

    const [total, packages] = await Promise.all([
      Package.countDocuments({}),
      Package.find({}).sort(sort).skip(skip).limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return jsonSuccess(res, 200, {
      page,
      limit,
      total,
      totalPages,
      packages,
    });
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

exports.getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid package id');
    }

    const pkg = await Package.findById(id);
    if (!pkg) {
      return jsonError(res, 404, 'Package not found');
    }

    return jsonSuccess(res, 200, pkg);
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

exports.updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid package id');
    }

    if (!isCreatorOrAdmin(req.user)) {
      return jsonError(res, 403, 'Forbidden');
    }

    const pkg = await Package.findById(id);
    if (!pkg) {
      return jsonError(res, 404, 'Package not found');
    }

    const creatorId = getPackageCreatorId(pkg);
    const isOwner = creatorId ? String(creatorId) === String(req.user._id) : false;
    if (!isOwner && !canManageAny(req.user)) {
      return jsonError(res, 403, 'Forbidden');
    }

    const allowed = ['title', 'description', 'destination', 'price', 'duration', 'images'];
    for (const field of allowed) {
      if (!Object.prototype.hasOwnProperty.call(req.body, field)) continue;

      if (field === 'price') {
        const parsedPrice = Number(req.body.price);
        if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
          return jsonError(res, 400, 'Invalid price');
        }
        pkg.price = parsedPrice;
        continue;
      }

      if (field === 'images') {
        pkg.images = Array.isArray(req.body.images)
          ? req.body.images.filter((x) => typeof x === 'string')
          : [];
        continue;
      }

      if (typeof req.body[field] === 'string') {
        pkg[field] = req.body[field].trim();
      }
    }

    await pkg.save();
    return jsonSuccess(res, 200, pkg);
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

exports.deletePackage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return jsonError(res, 400, 'Invalid package id');
    }

    if (!isCreatorOrAdmin(req.user)) {
      return jsonError(res, 403, 'Forbidden');
    }

    const pkg = await Package.findById(id);
    if (!pkg) {
      return jsonError(res, 404, 'Package not found');
    }

    const creatorId = getPackageCreatorId(pkg);
    const isOwner = creatorId ? String(creatorId) === String(req.user._id) : false;
    if (!isOwner && !canManageAny(req.user)) {
      return jsonError(res, 403, 'Forbidden');
    }

    await Package.deleteOne({ _id: pkg._id });
    return jsonSuccess(res, 200, { message: 'Package deleted' });
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};

exports.searchPackages = async (req, res) => {
  try {
    const { destination, minPrice, maxPrice, duration } = req.query;

    const filter = {};

    if (destination) {
      filter.destination = { $regex: String(destination).trim(), $options: 'i' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        const p = Number(minPrice);
        if (Number.isNaN(p) || p < 0) return jsonError(res, 400, 'Invalid minPrice');
        filter.price.$gte = p;
      }
      if (maxPrice !== undefined) {
        const p = Number(maxPrice);
        if (Number.isNaN(p) || p < 0) return jsonError(res, 400, 'Invalid maxPrice');
        filter.price.$lte = p;
      }
      if (filter.price.$gte !== undefined && filter.price.$lte !== undefined) {
        if (filter.price.$gte > filter.price.$lte) {
          return jsonError(res, 400, 'minPrice cannot be greater than maxPrice');
        }
      }
    }

    if (duration !== undefined) {
      const d = String(duration).trim();
      if (!d) return jsonError(res, 400, 'Invalid duration');
      // Duration is stored as a string like "7 Days"; accept numeric queries like 7.
      filter.duration = { $regex: d, $options: 'i' };
    }

    const packages = await Package.find(filter).sort({ createdAt: -1 });
    return jsonSuccess(res, 200, { packages });
  } catch (err) {
    return jsonError(res, 500, 'Server error');
  }
};