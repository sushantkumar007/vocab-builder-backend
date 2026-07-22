import jwt from "jsonwebtoken";
import { prisma } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessRefreshToken } from "../utils/generateAccessRefreshToken.js";
import { env } from "../config/env.js";

export const isAuthenticated = async (req, res, next) => {
  const { accessToken, refreshToken } = req.cookies;
  const errors = [];

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });
      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, "session expired. Please log in again.");
      }
      req.user = user;
      return next();
    } catch (error) {
      errors.push(`Access token error: ${error.message}`);
    }
  }

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);
      const user = await prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, "session expired. Please log in again.");
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        generateAccessRefreshToken({
          id: user.id,
          email: user.email,
          role: user.role,
        });

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: newRefreshToken,
        },
      });

      const cookieOptions = {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      };

      res.cookie("accessToken", newAccessToken, cookieOptions);
      res.cookie("refreshToken", newRefreshToken, cookieOptions);
      req.user = user;
      return next();
    } catch (error) {
      errors.push(`Refresh token error: ${error.message}`);
    }
  }

  if (process.env.NODE_ENV === "development") {
    throw new ApiError(401, "Authentication failed", errors);
  }

  res.status(401).json(new ApiError(401, "Unauthorized. Please log in again."));
};
