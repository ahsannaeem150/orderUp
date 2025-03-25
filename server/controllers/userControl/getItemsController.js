import {imageModel} from "../../models/imageModel.js";
import {menuModel} from "../../models/itemModel.js";
import {restaurantModel} from "../../models/restaurantModel.js";

export const getItemsController = async (req, res) => {
    try {
        const restaurant = await restaurantModel.findById(req.params.id).populate({
            path: "menu",
            select: "_id name price description availability category image costPrice stock maxStock minStock preparationTime unit weight createdAt updatedAt expiryDate supplier tags",
        });

        return res.status(200).json({
            success: true,
            items: restaurant.menu.map((item) => ({
                _id: item._id,
                name: item.name,
                price: item.price,
                description: item.description,
                image: item.image,
                category: item.category,
                availability: item.availability,
                costPrice: item.costPrice,
                stock: item.stock,
                maxStock: item.maxStock,
                minStock: item.minStock,
                preparationTime: item.preparationTime,
                unit: item.unit,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                weight: item.weight,
                expiryDate: item.expiryDate,
                supplier: item.supplier,
                tags: item.tags
            })),
        });
    } catch (error) {
        console.error("Error fetching items:", error);
        return res.status(500).json({
            success: false,
            error: "Server Error",
            message: error.message
        });
    }
};