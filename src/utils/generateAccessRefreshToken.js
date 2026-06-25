import jwt from "jsonwebtoken";

const generateAccessRefreshToken = (payload) => {
  const accessToken = jwt.sign({ ...payload }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });

  const refreshToken = jwt.sign({ ...payload }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });

  return { accessToken, refreshToken };
};

export { generateAccessRefreshToken };
