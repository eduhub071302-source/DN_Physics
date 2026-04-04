import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateName(name) {
  return String(name || "").trim().length >= 2;
}

function validatePassword(password) {
  return String(password || "").length >= 6;
}

function createJwt(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    }
  );
}

function setAuthCookie(res, token) {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

function clearAuthCookie(res) {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    paid: user.paid,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function register(req, res) {
  try {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!validateName(name)) {
      return res.status(400).json({
        success: false,
        message: "Name must have at least 2 characters."
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address."
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters."
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account already exists for this email."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    });

    const token = createJwt(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Register failed."
    });
  }
}

export async function login(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address."
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required."
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);

    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = createJwt(user);
    setAuthCookie(res, token);

    return res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Login failed."
    });
  }
}

export async function logout(req, res) {
  try {
    clearAuthCookie(res);

    return res.json({
      success: true,
      message: "Logged out successfully."
    });
  } catch (error) {
    console.error("LOGOUT_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Logout failed."
    });
  }
}

export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    return res.json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error("ME_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Could not fetch user."
    });
  }
}

export async function forgotPassword(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address."
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.json({
        success: true,
        message: "If the account exists, a reset request has been created."
      });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        email,
        codeHash,
        expiresAt
      }
    });

    return res.json({
      success: true,
      message: "Reset code generated.",
      devResetCode: process.env.NODE_ENV !== "production" ? code : undefined
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Forgot password failed."
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    const code = String(req.body?.code || "").trim();
    const newPassword = String(req.body?.new_password || "");

    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address."
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Reset code is required."
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters."
      });
    }

    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    const resetItem = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        codeHash,
        used: false,
        expiresAt: {
          gte: new Date()
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!resetItem) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset code."
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetItem.userId },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetItem.id },
        data: { used: true }
      })
    ]);

    return res.json({
      success: true,
      message: "Password updated successfully."
    });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Reset password failed."
    });
  }
}
