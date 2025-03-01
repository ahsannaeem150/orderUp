import express from "express";
import multer from "multer";

import { registerController } from "../controllers/restaurantControllers/registerRestaurant.js";
import { loginController } from "../controllers/restaurantControllers/loginRestaurant.js";
import { uploadProfileController } from "../controllers/restaurantControllers/uploadProfilePicture.js";
import { getProfilePictureController } from "../controllers/restaurantControllers/getProfilePicture.js";
import { addMenuItemController } from "../controllers/restaurantControllers/itemUpload.js";
import { getItemsController } from "../controllers/restaurantControllers/getItems.js";
import { getItemController } from "../controllers/restaurantControllers/getItem.js";
import { deleteItemController } from "../controllers/restaurantControllers/deleteItem.js";
import { updateProfileController } from "../controllers/restaurantControllers/updateProfile.js";
import { acceptOrder } from "../controllers/orderControllers/acceptOrderController.js";
import { rejectOrder } from "../controllers/orderControllers/rejectOrderController.js";
import { getRestaurantOrders } from "../controllers/orderControllers/getRestaurantOrders.js";

//router object
const router = express.Router();

//REGISTER || POST
router.post("/auth/register/restaurant", registerController);

//LOGIN || POST
router.post("/auth/login/restaurant", loginController);

const storage = multer.memoryStorage(); // Use memory storage
const upload = multer({ storage });
//UPDATE PROFILE PICTURE
router.put(
  "/restaurant/:id/profile/:type",
  upload.single("image"),
  uploadProfileController
);

router.post(
  "/restaurant/:id/menuitems/",
  upload.single("image"),
  addMenuItemController
);

router.put("/restaurant/:id/update", updateProfileController);
router.get("/restaurant/:id/profile/:type", getProfilePictureController);
router.get("/restaurant/:id/items", getItemsController);
router.get("/restaurant/:restaurantId/item/:itemId", getItemController);
router.delete("/restaurant/:restaurantId/item/:itemId", deleteItemController);

//orders
router.get("/:restaurantId/orders", getRestaurantOrders);

// Accept an order
router.post("/accept-order", acceptOrder);

// Reject an order
router.post("/reject-order", rejectOrder);

export default router;
