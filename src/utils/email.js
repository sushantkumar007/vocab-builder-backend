import Mailgen from "mailgen";
import { Resend } from "resend";
import { env } from "../config/env.js";

const sendEmail = async ({ email, subject, text, html }) => {
  const resend = new Resend(env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: env.RESEND_FROM,
      to: email,
      subject,
      text,
      html,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`, { cause: error });
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`, { cause: error });
  }
};

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "vocbank",
    link: "https://vocbank.com",
  },
});

const emailVerificationTemplate = (name, verificationLink) => {
  const email = {
    body: {
      name,
      intro: "Welcome to vocbank.com! We're excited to have you on board.",
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
