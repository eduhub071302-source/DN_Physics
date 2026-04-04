import { prisma } from "../lib/prisma.js";

function sanitizeUserProfile(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    paid: user.paid,
    profileImageUrl: user.profileImageUrl,
    phone: user.phone,
    country: user.country,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function normalizeText(value, maxLength = 120) {
  return String(value || "").trim().slice(0, maxLength);
}

export async function getMyProfile(req, res) {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    return res.json({
      success: true,
      profile: sanitizeUserProfile(user)
    });
  } catch (error) {
    console.error("GET_MY_PROFILE_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile."
    });
  }
}

export async function updateMyProfile(req, res) {
  try {
    const userId = req.user.userId;

    const name = normalizeText(req.body?.name, 100);
    const phone = normalizeText(req.body?.phone, 30);
    const country = normalizeText(req.body?.country, 80);
    const profileImageUrl = normalizeText(req.body?.profileImageUrl, 500);

    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must have at least 2 characters."
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone: phone || null,
        country: country || null,
        profileImageUrl: profileImageUrl || null
      }
    });

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      profile: sanitizeUserProfile(updatedUser)
    });
  } catch (error) {
    console.error("UPDATE_MY_PROFILE_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile."
    });
  }
}
