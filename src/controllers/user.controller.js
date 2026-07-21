import Crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRespones.js";
import { generateAccessRefreshToken } from "../utils/generateAccessRefreshToken.js";
import { sendEmail, emailVerificationTemplate, resetPasswordTemplate } from "../utils/email.js";
import { env } from "../config/env.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const generateUsername = async (email) => {
    let baseUsername = email
      .split("@")[0]
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (baseUsername.length > 25) {
      baseUsername = baseUsername.slice(0, 25);
    }

    let suffix = Crypto.randomBytes(2).toString("hex");
    let username = `${baseUsername}${suffix}`;

    let userWithSameUsername = await prisma.user.findUnique({
      where: { username },
    });

    while (userWithSameUsername) {
      suffix = Crypto.randomBytes(2).toString("hex");
      username = `${baseUsername}${suffix}`;

      userWithSameUsername = await prisma.user.findUnique({
        where: { username },
      });
    }

    return username;
  };

  const username = await generateUsername(email);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      isEmailVerified: true,
    },
  });

  if (!user) {
    throw new ApiError(500, "Failed to create user");
  }

  const emailVerificationToken = Crypto.randomBytes(32).toString("hex");
  const emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const emailVerificationLink = `${env.CLIENT_URL}/verify-email/${emailVerificationToken}`;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken,
      emailVerificationExpires,
    },
  });

  const { emailText, emailHtml } = emailVerificationTemplate(name, emailVerificationLink);

  await sendEmail({
    email,
    subject: "Verify your email",
    text: emailText,
    html: emailHtml,
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "User registered successfully. Please check your email to verify your account.",
        { user },
      ),
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { emailVerificationToken } = req.params;

  const user = await prisma.user.findUnique({
    where: {
      emailVerificationToken,
      emailVerificationExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired email verification token");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  res.status(200).json(new ApiResponse(200, "Email verified successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(400, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid email or password");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(400, "Please verify your email before logging in");
  }

  const { accessToken, refreshToken } = generateAccessRefreshToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  const cookieOptions = {
    // httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // secure: process.env.NODE_ENV === "production",
    // sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  };
  res.cookie("accessToken", accessToken, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.status(200).json(new ApiResponse(200, "Login successful"));
});

export const logout = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json(new ApiResponse(200, "Logout successful"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const { user } = req;

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(200, "User retrieved successfully", {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    }),
  );
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  const emailVerificationToken = Crypto.randomBytes(32).toString("hex");
  const emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const emailVerificationLink = `${env.CLIENT_URL}/verify-email/${emailVerificationToken}`;

  const { emailText, emailHtml } = emailVerificationTemplate(user.name, emailVerificationLink);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken,
      emailVerificationExpires,
    },
  });

  await sendEmail({
    email,
    subject: "Email Verification",
    text: emailText,
    html: emailHtml,
  });

  res.status(200).json(new ApiResponse(200, "Verification email resent successfully"));
});

export const resetPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const resetPasswordToken = Crypto.randomBytes(32).toString("hex");
  const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const resetPasswordLink = `${env.CLIENT_URL}/reset-password/${resetPasswordToken}`;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken,
      resetPasswordExpires,
    },
  });

  const { emailText, emailHtml } = resetPasswordTemplate(user.name, resetPasswordLink);

  await sendEmail({
    email,
    subject: "Reset Password",
    text: emailText,
    html: emailHtml,
  });

  res.status(200).json(new ApiResponse(200, "Password reset email sent successfully"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.params;
  const { newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      resetPasswordToken,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired password reset token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  res.status(200).json(new ApiResponse(200, "Password reset successfully"));
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

  if (!isCurrentPasswordValid) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
    },
  });

  res.status(200).json(new ApiResponse(200, "Password updated successfully"));
});
