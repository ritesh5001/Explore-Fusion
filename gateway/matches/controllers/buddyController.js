const mongoose = require('mongoose');

const jsonError = (res, status, message) =>
  res.status(status).json({ success: false, message });

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

const scoreCommon = (a = [], b = []) => {
  const setA = new Set(a.map((s) => String(s).trim().toLowerCase()).filter(Boolean));
  const setB = new Set(b.map((s) => String(s).trim().toLowerCase()).filter(Boolean));
  let count = 0;
  for (const v of setA) {
    if (setB.has(v)) count += 1;
  }
  return count;
};

const makeBuddyController = ({ models }) => {
  if (!models) {
    throw new Error('Matches models missing');
  }

  const { TravelProfile, Match, Notification } = models;

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

    const update = { destinationPreferences, interests };
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

      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

  const getMyProfile = async (req, res) => {
    const userId = req.user?._id;
    if (!userId) return jsonError(res, 401, 'Not authorized');

    try {
      const profile = await TravelProfile.findOne({ userId });
      if (!profile) return jsonError(res, 404, 'Profile not found');
      return res.status(200).json({ success: true, data: profile });
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

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
      for (const match of matches) {
        const other = String(match.requesterId) === String(userId) ? match.receiverId : match.requesterId;
        excluded.add(String(other));
      }

      const candidates = await TravelProfile.find({
        userId: { $nin: Array.from(excluded) },
      })
        .limit(500)
        .lean();

      const scored = candidates.map((profile) => {
        const commonDestinations = myProfile
          ? scoreCommon(myProfile.destinationPreferences, profile.destinationPreferences)
          : 0;
        const commonInterests = myProfile
          ? scoreCommon(myProfile.interests, profile.interests)
          : 0;
        const score = commonDestinations * 2 + commonInterests;

        return {
          userId: profile.userId,
          destinationPreferences: profile.destinationPreferences,
          interests: profile.interests,
          travelStyle: profile.travelStyle,
          bio: profile.bio,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
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

      return res.status(200).json({ success: true, data: scored.slice(0, limit) });
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

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
      } catch (notificationError) {
        console.warn('Notification create failed (match_request):', notificationError?.message || notificationError);
      }

      return res.status(201).json({ success: true, data: match });
    } catch (error) {
      if (error?.code === 11000) {
        return jsonError(res, 409, 'Already requested');
      }
      return jsonError(res, 500, 'Server error');
    }
  };

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
      } catch (notificationError) {
        console.warn('Notification create failed (match_accepted):', notificationError?.message || notificationError);
      }

      return res.status(200).json({ success: true, data: match });
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

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

      return res.status(200).json({ success: true, data: match });
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

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

      return res.status(200).json({ success: true, data: matches });
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

  const getIncomingRequests = async (req, res) => {
    const userId = req.user?._id;
    if (!userId) return jsonError(res, 401, 'Not authorized');

    try {
      const requests = await Match.find({ receiverId: userId, status: 'pending' })
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({ success: true, data: requests });
    } catch (error) {
      return jsonError(res, 500, 'Server error');
    }
  };

  return {
    upsertProfile,
    getMyProfile,
    getSuggestions,
    sendRequest,
    acceptRequest,
    rejectRequest,
    getMyMatches,
    getIncomingRequests,
  };
};

module.exports = { makeBuddyController };
