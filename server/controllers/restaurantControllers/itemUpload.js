import { imageModel } from "../../models/imageModel.js";
import { menuModel } from "../../models/itemModel.js";
import { v4 as uuidv4 } from "uuid";
import { restaurantModel } from "../../models/restaurantModel.js";

export const addMenuItemController = async (req, res) => {
  try {
    const { name, description, price, category, availability } = req.body;
    const restaurantId = req.params.id;
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "name is required",
      });
    }
    console.log(price);
    if (!price) {
      return res.status(400).send({
        success: false,
        message: "price is required",
      });
    }
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "phone is required",
      });
    }

    let image;
    if (req.file) {
      image = new imageModel({
        name: `${uuidv4()}.${req.file.mimetype.split("/")[1]}`,
        data: req.file.buffer,
        contentType: req.file.mimetype,
      });
      await image.save();
    }

    const newMenuItem = new menuModel({
      name,
      description,
      price: parseFloat(price),
      category,
      availability,
      image: image ? image._id : null,
    });

    const savedItem = await newMenuItem.save();
    res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      item: savedItem,
    });

    //GET RESTAURANT
    const restaurant = await restaurantModel.findById(restaurantId);
    restaurant.menu.push(savedItem._id);

    await restaurant.save();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
