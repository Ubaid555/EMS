import env from "./env.config.js";

export const cookieOptions = {
  accessToken: {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  },

  refreshToken: {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

export default cookieOptions;