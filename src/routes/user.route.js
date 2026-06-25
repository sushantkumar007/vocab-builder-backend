import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  logout,
  getCurrentUser,
  resendVerificationEmail,
  resetPasswordRequest,
  resetPassword,
  updatePassword,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(register);
userRouter.route("/verify-email/:emailVerificationToken").get(verifyEmail);
userRouter.route("/login").post(login);
userRouter.route("/logout").get(isAuthenticated, logout);
userRouter.route("/me").get(isAuthenticated, getCurrentUser);
userRouter.route("/resend-verification-email").post(resendVerificationEmail);
userRouter.route("/reset-password-request").post(resetPasswordRequest);
userRouter.route("/reset-password/:resetPasswordToken").patch(resetPassword);
userRouter.route("/update-password").patch(isAuthenticated, updatePassword);

export default userRouter;
