import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
} from "../controllers/wishlist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All wishlist routes require auth
router.get("/", protectRoute, getWishlist);
router.post("/:productId", protectRoute, addToWishlist);
router.delete("/:productId", protectRoute, removeFromWishlist);
router.get("/status/:productId", protectRoute, checkWishlistStatus);

export default router;
