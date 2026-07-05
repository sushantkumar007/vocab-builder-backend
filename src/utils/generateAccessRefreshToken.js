import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const generateAccessRefreshToken = (payload) => {
  const accessToken = jwt.sign({ ...payload }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRATION,
  });

  const refreshToken = jwt.sign({ ...payload }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRATION,
  });

  return { accessToken, refreshToken };
};

export { generateAccessRefreshToken };
