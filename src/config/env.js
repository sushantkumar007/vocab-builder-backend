import fs from "node:fs";
import dotenv from "dotenv";

dotenv.config();

const getEnv = (name) => {
  if (process.env[name]) {
    return process.env[name];
  }

  const file = process.env[`${name}_FILE`];

  if (file) {
    return fs.readFileSync(file, "utf-8").trim();
  }

  return undefined;
};

export const env = {
  PORT: getEnv("PORT"),
  BASE_URL: getEnv("BASE_URL"),
  CLIENT_URL: getEnv("CLIENT_URL"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  ACCESS_TOKEN_SECRET: getEnv("ACCESS_TOKEN_SECRET"),
  ACCESS_TOKEN_EXPIRATION: getEnv("ACCESS_TOKEN_EXPIRATION"),
  REFRESH_TOKEN_SECRET: getEnv("REFRESH_TOKEN_SECRET"),
  REFRESH_TOKEN_EXPIRATION: getEnv("REFRESH_TOKEN_EXPIRATION"),
  SMTP_HOST: getEnv("SMTP_HOST"),
  SMTP_PORT: getEnv("SMTP_PORT"),
  SMTP_USER: getEnv("SMTP_USER"),
  SMTP_PASS: getEnv("SMTP_PASS"),
  SMTP_FROM: getEnv("SMTP_FROM"),
  DICTIONARY_API_URL: getEnv("DICTIONARY_API_URL"),
  TRANSLATE_API_URL: getEnv("TRANSLATE_API_URL"),
};
