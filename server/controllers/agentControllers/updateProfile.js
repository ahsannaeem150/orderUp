import { userModel } from "../../models/userModel.js";
import {agentModel} from "../../models/agentModel.js";

export const updateProfileController = async (req, res) => {
  try {
    //GET USER ID
    const agentId = req.params.id;
    //FIND USER
    const agent = await agentModel.findById(agentId);
    if (!agent) {
      return res
        .status(404)
        .json({ success: false, message: "agent not found." });
    }

    agent.username = req.body.username;
    agent.phone = req.body.phone;
    agent.address.address = req.body.address.address;
    agent.address.city = req.body.address.city;

    await agent.save();

    return res.status(201).json({
      success: true,
      message: "agent updated successfully.",
      agent: agent,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};
