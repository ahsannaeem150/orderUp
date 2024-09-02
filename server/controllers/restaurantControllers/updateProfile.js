import { restaurantModel } from "../../models/restaurantModel.js";

export const updateProfileController = async (req, res) => {
  try {
    //GET Restaurant ID
    const restaurantId = req.params.id;
    //Find Restaurant
    const restaurant = await restaurantModel.findById(restaurantId);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found." });
    }

    restaurant.name = req.body.name;
    restaurant.phone = req.body.phone;
    restaurant.address.address = req.body.address.address;
    restaurant.address.city = req.body.address.city;

    await restaurant.save();

    return res.status(201).json({
      success: true,
      message: "Restaurant updated successfully.",
      restaurant: restaurant,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};
