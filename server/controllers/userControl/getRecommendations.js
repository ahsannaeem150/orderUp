import path from "path";
import { imageModel } from "../../models/imageModel.js";
import { menuModel } from "../../models/itemModel.js";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

export const getRecommendationsController = async (req, res) => {
  try {
    const { itemID } = req.params;
    const topN = 5;

    const recommendations = await getRecommendationsFromPython(itemID, topN);

    if (!recommendations || recommendations.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No recommendations found" });
    }

    // Fetch item details from the menu
    const recommendedItems = await menuModel
      .find({
        _id: { $in: recommendations.map((item) => item.itemId) },
      })
      .lean();

    // Add images and additional data to each recommended item
    const itemsWithImages = await Promise.all(
      recommendedItems.map(async (item) => {
        const image = await imageModel.findById(item.image);

        // Attach the image as base64-encoded string if it exists
        return {
          ...item,
          similarity: recommendations.find(
            (r) => r.itemId === item._id.toString()
          ).similarity,
          image: image
            ? `data:${image.contentType};base64,${image.data.toString(
                "base64"
              )}`
            : null,
        };
      })
    );

    // Send the recommendations with images and other details
    return res.status(200).json({
      success: true,
      message: "Recommendations retrieved successfully",
      recommendations: itemsWithImages,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Helper function to fetch recommendations from Python
const getRecommendationsFromPython = async (itemID, topN) => {
  return new Promise((resolve, reject) => {
    const __filename = fileURLToPath(import.meta.url); // Get the full file path
    const __dirname = path.dirname(__filename); // Get the directory name from the file path

    // Resolve the absolute path to the Python script
    const pythonScriptPath = path.resolve(__dirname, "recommendations.py");
    // Assuming you use a spawn function to call the Python script
    const python = spawn("python", [pythonScriptPath, itemID, topN]);

    let data = "";
    let errorData = "";

    // Capture stdout data from Python script
    python.stdout.on("data", (chunk) => {
      data += chunk.toString();
    });

    // Capture stderr data from Python script (errors)
    python.stderr.on("data", (error) => {
      errorData += error.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(`Python script error: ${errorData}`);
      } else {
        try {
          const recommendations = JSON.parse(data);
          resolve(recommendations);
        } catch (error) {
          reject("Error parsing Python output");
        }
      }
    });
  });
};