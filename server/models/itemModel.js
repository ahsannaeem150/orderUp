import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        maxlength: 200
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },
    costPrice: {
        type: Number,
        min: 0,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    maxStock: {
        type: Number,
        min: 0,
        required: true
    },
    minStock: {
        type: Number,
        min: 0,
        required: true
    },

    category: {
        type: String,
        enum: ["Appetizer", "Main Course", "Dessert", "Beverage", "Ingredient"],
        default: "Main Course"
    },
    tags: [{
        type: String,
        enum: ["Vegetarian", "Vegan", "Gluten-Free", "Spicy", "Seasonal"]
    }],

    supplier: {
        name: String,
        contact: String
    },
    batchNumber: String,
    expiryDate: Date,
    lastRestocked: Date,

    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Media"
    },
    barcode: String,

    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "restaurants",
        index: true
    },

    availability: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number,
        min: 0
    },

    unit: {
        type: String,
        enum: ["pieces", "kg", "liters", "packets"],
        default: "pieces"
    },
    weight: Number,
    packaging: String,

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
}, {
    versionKey: false,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

MenuItemSchema.virtual('stockPercentage').get(function () {
    return Math.round((this.stock / this.maxStock) * 100);
});

MenuItemSchema.virtual('lowStockAlert').get(function () {
    return this.stock <= this.minStock;
});

MenuItemSchema.index({restaurant: 1, category: 1});
MenuItemSchema.index({expiryDate: 1});

MenuItemSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const menuModel = mongoose.model("menuitems", MenuItemSchema);