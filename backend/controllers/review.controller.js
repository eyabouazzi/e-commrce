import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

// Get reviews for a product
export const getProductReviews = async (req, res) => {
	try {
		const { productId } = req.params;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const reviews = await Review.find({ product: productId })
			.populate("user", "name")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await Review.countDocuments({ product: productId });

		res.json({
			success: true,
			reviews,
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(total / limit),
				totalReviews: total,
				hasNext: page * limit < total,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		console.error("Error getting product reviews:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des avis",
		});
	}
};

// Create a new review
export const createReview = async (req, res) => {
	try {
		const { productId } = req.params;
		const userId = req.user._id;
		const { rating, comment, images } = req.body;

		// Check if product exists
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Produit non trouvé",
			});
		}

		// Check if user already reviewed this product
		const existingReview = await Review.findOne({
			user: userId,
			product: productId,
		});

		if (existingReview) {
			return res.status(400).json({
				success: false,
				message: "Vous avez déjà donné votre avis sur ce produit",
			});
		}

		// Check if user has purchased the product (for verified reviews)
		const hasPurchased = await Order.findOne({
			user: userId,
			"products.product": productId,
		});

		const review = new Review({
			user: userId,
			product: productId,
			rating,
			comment,
			images: images || [],
			isVerified: !!hasPurchased,
		});

		await review.save();

		// Populate user info for response
		await review.populate("user", "name");

		res.status(201).json({
			success: true,
			message: "Avis créé avec succès",
			review,
		});
	} catch (error) {
		console.error("Error creating review:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la création de l'avis",
		});
	}
};

// Update a review
export const updateReview = async (req, res) => {
	try {
		const { reviewId } = req.params;
		const userId = req.user._id;
		const { rating, comment, images } = req.body;

		const review = await Review.findOne({
			_id: reviewId,
			user: userId,
		});

		if (!review) {
			return res.status(404).json({
				success: false,
				message: "Avis non trouvé ou accès non autorisé",
			});
		}

		review.rating = rating || review.rating;
		review.comment = comment || review.comment;
		review.images = images || review.images;

		await review.save();
		await review.populate("user", "name");

		res.json({
			success: true,
			message: "Avis mis à jour avec succès",
			review,
		});
	} catch (error) {
		console.error("Error updating review:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la mise à jour de l'avis",
		});
	}
};

// Delete a review
export const deleteReview = async (req, res) => {
	try {
		const { reviewId } = req.params;
		const userId = req.user._id;

		const review = await Review.findOneAndDelete({
			_id: reviewId,
			user: userId,
		});

		if (!review) {
			return res.status(404).json({
				success: false,
				message: "Avis non trouvé ou accès non autorisé",
			});
		}

		res.json({
			success: true,
			message: "Avis supprimé avec succès",
		});
	} catch (error) {
		console.error("Error deleting review:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la suppression de l'avis",
		});
	}
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
	try {
		const { reviewId } = req.params;

		const review = await Review.findById(reviewId);
		if (!review) {
			return res.status(404).json({
				success: false,
				message: "Avis non trouvé",
			});
		}

		review.helpful += 1;
		await review.save();

		res.json({
			success: true,
			message: "Avis marqué comme utile",
			helpful: review.helpful,
		});
	} catch (error) {
		console.error("Error marking review helpful:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors du marquage de l'avis",
		});
	}
};

// Report a review
export const reportReview = async (req, res) => {
	try {
		const { reviewId } = req.params;

		const review = await Review.findById(reviewId);
		if (!review) {
			return res.status(404).json({
				success: false,
				message: "Avis non trouvé",
			});
		}

		review.reported = true;
		await review.save();

		res.json({
			success: true,
			message: "Avis signalé avec succès",
		});
	} catch (error) {
		console.error("Error reporting review:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors du signalement de l'avis",
		});
	}
};
