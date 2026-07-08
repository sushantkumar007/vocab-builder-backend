import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { env } from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

const sendEmail = async ({ email, subject, text, html }) => {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject,
    text,
    html,
  });
};

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Vocab Builder",
    link: env.CLIENT_URL,
  },
});

const emailVerificationTemplate = (name, verificationLink) => {
  const email = {
    body: {
      name,
      intro: "Welcome to Vocab Builder! We're excited to have you on board.",
      action: {
        instructions:
          "To get started, please verify your email address by clicking the button below:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify Email",
          link: verificationLink,
        },
      },
      outro: "If you did not create an account, no further action is required.",
    },
  };

  const emailText = mailGenerator.generatePlaintext(email);
  const emailHtml = mailGenerator.generate(email);
  return { emailText, emailHtml };
};

const resetPasswordTemplate = (name, resetPasswordLink) => {
  const email = {
    body: {
      name,
      intro: "You have requested to reset your password.",
      action: {
        instructions: "To reset your password, please click the button below:",
        button: {
          color: "#22BC66",
          text: "Reset Password",
          link: resetPasswordLink,
        },
      },
      outro: "If you did not request a password reset, no further action is required.",
    },
  };

  const emailText = mailGenerator.generatePlaintext(email);
  const emailHtml = mailGenerator.generate(email);
  return { emailText, emailHtml };
};

export { sendEmail, emailVerificationTemplate, resetPasswordTemplate };
