const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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

const signAuthToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is missing');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const buildSafeUser = (userDoc) => {
  return {
    _id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    isBlocked: userDoc.isBlocked,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
};


const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return jsonError(res, 401, 'Not authorized');
    }
    return jsonSuccess(res, 200, buildSafeUser(req.user));
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};


const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return jsonError(res, 400, 'Please provide name, email and password');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return jsonError(res, 400, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
      isBlocked: false,
    });

    const token = signAuthToken(user.id);
    return jsonSuccess(res, 201, { token, user: buildSafeUser(user) });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return jsonError(res, 400, 'Please provide email and password');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      console.log(`Login attempt failed: User not found for email: ${normalizedEmail}`);
      return jsonError(res, 401, 'Invalid email or password');
    }

    if (user.isBlocked) {
      return jsonError(res, 403, 'Account is blocked');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      console.log(`Login attempt failed: Incorrect password for email: ${normalizedEmail}`);
      return jsonError(res, 401, 'Invalid email or password');
    }

    const token = signAuthToken(user.id);
    console.log(`Login successful for email: ${normalizedEmail}`);
    return jsonSuccess(res, 200, { token, user: buildSafeUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    return jsonError(res, 500, 'Server error');
  }
};

const logoutUser = async (req, res) => {
  try {
    return jsonSuccess(res, 200, { message: 'Logged out' });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return jsonError(res, 400, 'oldPassword and newPassword are required');
    }

    // Important: password is excluded by default (select: false), so we explicitly select it.
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return jsonError(res, 401, 'Not authorized');
    }

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
      return jsonError(res, 400, 'Old password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return jsonSuccess(res, 200, { message: 'Password updated' });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return jsonError(res, 400, 'Email is required');
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordResetTokenHash +passwordResetTokenExpiresAt');

    // Important: do not reveal whether the email exists.
    if (!user) {
      return jsonSuccess(res, 200, { message: 'If that email exists, a reset token was generated.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Important: no email service yet; log token to console.
    console.log(`Password reset token for ${user.email}: ${rawToken}`);

    return jsonSuccess(res, 200, { message: 'Reset token generated. Check server logs.' });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return jsonError(res, 400, 'resetToken and newPassword are required');
    }

    const tokenHash = crypto.createHash('sha256').update(String(resetToken)).digest('hex');

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetTokenExpiresAt');

    if (!user) {
      return jsonError(res, 400, 'Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();

    return jsonSuccess(res, 200, { message: 'Password reset successful' });
  } catch (error) {
    return jsonError(res, 500, 'Server error');
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};