import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				addedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{ timestamps: true }
);

// Ensure no duplicate products in wishlist
wishlistSchema.pre("save", function (next) {
	const productIds = this.products.map((item) => item.product.toString());
	const uniqueIds = [...new Set(productIds)];

	if (productIds.length !== uniqueIds.length) {
		this.products = uniqueIds.map((id) => ({
			product: id,
			addedAt: this.products.find((item) => item.product.toString() === id)?.addedAt || new Date(),
		}));
	}

	next();
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;
