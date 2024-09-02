import express from "express";
import multer from "multer";
import { loginController } from "../controllers/userControl/loginUser.js";
import { registerController } from "../controllers/userControl/registerUser.js";
import { uploadProfileController } from "../controllers/userControl/uploadProfilePicture.js";
import { getProfilePictureController } from "../controllers/userControl/getProfilePicture.js";
import { updateProfileController } from "../controllers/userControl/updateProfile.js";
import { getRestaurantsController } from "../controllers/userControl/getRestaurants.js";
import { getItemsController } from "../controllers/restaurantControllers/getItems.js";
import { postUserReviewController } from "../controllers/userControl/postUserReviews.js";
import { getReviewsController } from "../controllers/userControl/getUserReviews.js";
//router object
const router = express.Router();

//REGISTER || POST
router.post("/register", registerController);
//REGISTER || POST
router.post("/login", loginController);

const storage = multer.memoryStorage(); // Use memory storage for example
const upload = multer({ storage });
//UPLOAD PICTURE
router.put(
  "/:id/profile/image",
  upload.single("image"),
  uploadProfileController
);

router.put("/:id/profile/update", updateProfileController);
router.get("/:id/profile/image", getProfilePictureController);
router.get("/restaurants", getRestaurantsController);
router.get("/restaurant/:id/items", getItemsController);
router.post(
  "/restaurant/item/:itemId/reviews/:userId",
  postUserReviewController
);
router.get("/restaurant/item/:itemId/reviews", getReviewsController);

export default router;
