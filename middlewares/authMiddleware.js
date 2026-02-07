import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// ==============================
// PROTECTED ROUTE (JWT VERIFY)
// ==============================
export const requireSignIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = JWT.verify(token, process.env.JWT_SECRET);

    // ✅ Always fetch fresh user from DB
    const user = await userModel
      .findById(decoded._id)
      .select("-password");

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }

    req.user = user; // attach full user
    next();
  } catch (error) {
    console.error("JWT ERROR:", error.message);
    return res.status(401).send({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ==============================
// ADMIN ACCESS CHECK
// ==============================
export const isAdmin = (req, res, next) => {
  try {
    // role: 1 === admin
    if (req.user.role !== 1) {
      return res.status(403).send({
        success: false,
        message: "Admin access denied",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Admin authorization failed",
    });
  }
};
