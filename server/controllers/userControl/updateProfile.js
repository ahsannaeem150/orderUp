import { userModel } from "../../models/userModel.js";

export const updateProfileController = async (req, res) => {
  try {
    //GET USER ID
    const userId = req.params.id;
    //FIND USER
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    user.name = req.body.name;
    user.phone = req.body.phone;
    user.address.address = req.body.address.address;
    user.address.city = req.body.address.city;

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User updated successfully.",
      user: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};
