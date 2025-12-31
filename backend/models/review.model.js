import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		comment: {
			type: String,
			required: true,
			maxlength: 500,
		},
		images: [
			{
				type: String, // Cloudinary URLs
			},
		],
		isVerified: {
			type: Boolean,
			default: false, // True if user has purchased the product
		},
		helpful: {
			type: Number,
			default: 0,
		},
		reported: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

// Compound index to ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Update product's average rating when review is saved
reviewSchema.post("save", async function () {
	const Product = mongoose.model("Product");
	const reviews = await mongoose.model("Review").find({ product: this.product });
	const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

	await Product.findByIdAndUpdate(this.product, {
		averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
		numReviews: reviews.length,
	});
});

// Update product's average rating when review is removed
reviewSchema.post("remove", async function () {
	const Product = mongoose.model("Product");
	const reviews = await mongoose.model("Review").find({ product: this.product });

	if (reviews.length === 0) {
		await Product.findByIdAndUpdate(this.product, {
			averageRating: 0,
			numReviews: 0,
		});
	} else {
		const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
		await Product.findByIdAndUpdate(this.product, {
			averageRating: Math.round(averageRating * 10) / 10,
			numReviews: reviews.length,
		});
	}
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
