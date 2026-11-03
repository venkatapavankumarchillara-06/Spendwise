/**
 * Sets HTTP-only authentication cookie and returns signed JWT
 * @param {Response} res - Express response object
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} token
 */
export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateAuthToken();

  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true, // Prevents client-side JS from accessing the cookie (XSS protection)
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'none' : 'lax', // Cross-site support in prod if backend & frontend are on different domains
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      message,
      token, // Also provided for clients wanting Authorization Bearer header
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        currency: user.currency || 'INR',
        themePreference: user.themePreference || 'dark',
        createdAt: user.createdAt,
      },
    });
};
