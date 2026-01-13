const mongoose = require('mongoose');

const TravelProfile = require('../models/TravelProfile');
const Match = require('../models/Match');
const Notification = require('../models/Notification');

const jsonError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeStrings = (arr) => {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const item of arr) {
    if (typeof item !== 'string') continue;
    const v = item.trim();
    if (!v) continue;
    out.push(v);
  }
  return Array.from(new Set(out));
};

const scoreCommon = (a, b) => {
  const setA = new Set((a || []).map((s) => String(s).trim().toLowerCase()).filter(Boolean));
  const setB = new Set((b || []).map((s) => String(s).trim().toLowerCase()).filter(Boolean));
  let count = 0;
  for (const v of setA) {
    if (setB.has(v)) count += 1;
  }
  return count;
};

// POST /profile
const upsertProfile = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return jsonError(res, 401, 'Not authorized');

  const destinationPreferences = normalizeStrings(req.body?.destinationPreferences);
  const interests = normalizeStrings(req.body?.interests);
  const travelStyle = req.body?.travelStyle;
  const bio = typeof req.body?.bio === 'string' ? req.body.bio.trim() : undefined;

  if (travelStyle && !['budget', 'luxury', 'adventure'].includes(travelStyle)) {
    return jsonError(res, 400, 'Invalid travelStyle');
  }

  const update = {
    destinationPreferences,
    interests,
  };

  if (travelStyle !== undefined) update.travelStyle = travelStyle;
  if (bio !== undefined) update.bio = bio;

  try {
    const profile = await TravelProfile.findOneAndUpdate(
      { userId },
      { $set: update },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// GET /profile/me
const getMyProfile = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return jsonError(res, 401, 'Not authorized');

  try {
    const profile = await TravelProfile.findOne({ userId });
    if (!profile) return jsonError(res, 404, 'Profile not found');

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// GET /suggestions
const getSuggestions = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return jsonError(res, 401, 'Not authorized');

  const limitRaw = Number(req.query?.limit);
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 20;

  try {
    const myProfile = await TravelProfile.findOne({ userId }).lean();

    const matches = await Match.find({
      $or: [{ requesterId: userId }, { receiverId: userId }],
    })
      .select('requesterId receiverId')
      .lean();

    const excluded = new Set([String(userId)]);
    for (const m of matches) {
      const other = String(m.requesterId) === String(userId) ? m.receiverId : m.requesterId;
      excluded.add(String(other));
    }

    const excludedIds = Array.from(excluded);

    const candidates = await TravelProfile.find({
      userId: {
        $nin: excludedIds,
      },
    })
      .limit(500)
      .lean();

    const scored = candidates.map((p) => {
      const commonDestinations = myProfile
        ? scoreCommon(myProfile.destinationPreferences, p.destinationPreferences)
        : 0;
      const commonInterests = myProfile
        ? scoreCommon(myProfile.interests, p.interests)
        : 0;
      const score = commonDestinations * 2 + commonInterests;

      return {
        userId: p.userId,
        destinationPreferences: p.destinationPreferences,
        interests: p.interests,
        travelStyle: p.travelStyle,
        bio: p.bio,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        score,
        commonDestinations,
        commonInterests,
      };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const bu = new Date(b.updatedAt || 0).getTime();
      const au = new Date(a.updatedAt || 0).getTime();
      return bu - au;
    });

    return res.status(200).json({
      success: true,
      data: scored.slice(0, limit),
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// POST /:userId/request
const sendRequest = async (req, res) => {
  const requesterId = req.user?._id;
  const receiverId = req.params?.userId;

  if (!requesterId) return jsonError(res, 401, 'Not authorized');
  if (!isValidObjectId(receiverId)) return jsonError(res, 400, 'Invalid userId');

  if (String(requesterId) === String(receiverId)) {
    return jsonError(res, 400, 'Cannot send request to yourself');
  }

  try {
    const receiverProfile = await TravelProfile.findOne({ userId: receiverId }).select('_id');
    if (!receiverProfile) return jsonError(res, 404, 'Profile not found');

    const existing = await Match.findOne({
      $or: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    }).lean();

    if (existing) {
      return jsonError(res, 409, 'A match request already exists between these users');
    }

    const match = await Match.create({
      requesterId,
      receiverId,
      status: 'pending',
    });

    try {
      await Notification.create({
        userId: receiverId,
        type: 'match_request',
        title: 'New buddy request',
        message: 'You received a new travel buddy request.',
        link: '/matches/requests',
      });
    } catch (e) {
      console.warn('Notification create failed (match_request):', e?.message || e);
    }

    return res.status(201).json({
      success: true,
      data: match,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return jsonError(res, 409, 'Already requested');
    }
    return jsonError(res, 500, 'Server error');
  }
};

// POST /:matchId/accept
const acceptRequest = async (req, res) => {
  const userId = req.user?._id;
  const matchId = req.params?.matchId;

  if (!userId) return jsonError(res, 401, 'Not authorized');
  if (!isValidObjectId(matchId)) return jsonError(res, 400, 'Invalid matchId');

  try {
    const match = await Match.findById(matchId);
    if (!match) return jsonError(res, 404, 'Match not found');

    if (String(match.receiverId) !== String(userId)) {
      return jsonError(res, 403, 'Not your request');
    }

    if (match.status !== 'pending') {
      return jsonError(res, 409, 'Request already processed');
    }

    match.status = 'accepted';
    match.matchedAt = new Date();
    await match.save();

    try {
      await Notification.create({
        userId: match.requesterId,
        type: 'match_accepted',
        title: 'Buddy request accepted',
        message: 'Your travel buddy request was accepted.',
        link: '/matches/my',
      });
    } catch (e) {
      console.warn('Notification create failed (match_accepted):', e?.message || e);
    }

    return res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// POST /:matchId/reject
const rejectRequest = async (req, res) => {
  const userId = req.user?._id;
  const matchId = req.params?.matchId;

  if (!userId) return jsonError(res, 401, 'Not authorized');
  if (!isValidObjectId(matchId)) return jsonError(res, 400, 'Invalid matchId');

  try {
    const match = await Match.findById(matchId);
    if (!match) return jsonError(res, 404, 'Match not found');

    if (String(match.receiverId) !== String(userId)) {
      return jsonError(res, 403, 'Not your request');
    }

    if (match.status !== 'pending') {
      return jsonError(res, 409, 'Request already processed');
    }

    match.status = 'rejected';
    match.matchedAt = undefined;
    await match.save();

    // Optional: notify requester (kept silent to reduce noise)

    return res.status(200).json({
      success: true,
      data: match,
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// GET /my
const getMyMatches = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return jsonError(res, 401, 'Not authorized');

  try {
    const matches = await Match.find({
      status: 'accepted',
      $or: [{ requesterId: userId }, { receiverId: userId }],
    })
      .sort({ matchedAt: -1, updatedAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

// GET /requests
const getIncomingRequests = async (req, res) => {
  const userId = req.user?._id;
  if (!userId) return jsonError(res, 401, 'Not authorized');

  try {
    const requests = await Match.find({
      receiverId: userId,
      status: 'pending',
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

module.exports = {
  upsertProfile,
  getMyProfile,
  getSuggestions,
  sendRequest,
  acceptRequest,
  rejectRequest,
  getMyMatches,
  getIncomingRequests,
};
