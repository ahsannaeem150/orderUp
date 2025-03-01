export const getBatchItems = async (req, res) => {
  try {
    if (!req.body.ids || !Array.isArray(req.body.ids)) {
      return res.status(400).json({ error: "Invalid item IDs format" });
    }

    // Validate MongoDB IDs
    const validIds = req.body.ids.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const items = await menuModel
      .find({
        _id: { $in: validIds },
      })
      .select("_id name description price image");

    return res.status(200).json(items);
  } catch (error) {
    console.error("Batch items error:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};
