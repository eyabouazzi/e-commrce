import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";

// Get user's wishlist
export const getWishlist = async (req, res) => {
	try {
		const userId = req.user._id;

		let wishlist = await Wishlist.findOne({ user: userId }).populate({
			path: "products.product",
			select: "name price image category averageRating",
		});

		if (!wishlist) {
			wishlist = await Wishlist.create({ user: userId, products: [] });
		}

		res.json({
			success: true,
			wishlist: wishlist.products,
		});
	} catch (error) {
		console.error("Error getting wishlist:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération de la liste de souhaits",
		});
	}
};

// Add product to wishlist
export const addToWishlist = async (req, res) => {
	try {
		const userId = req.user._id;
		const { productId } = req.params;

		// Check if product exists
		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: "Produit non trouvé",
			});
		}

		let wishlist = await Wishlist.findOne({ user: userId });

		if (!wishlist) {
			wishlist = new Wishlist({ user: userId, products: [] });
		}

		// Check if product already in wishlist
		const existingProduct = wishlist.products.find(
			(item) => item.product.toString() === productId
		);

		if (existingProduct) {
			return res.status(400).json({
				success: false,
				message: "Produit déjà dans la liste de souhaits",
			});
		}

		wishlist.products.push({
			product: productId,
			addedAt: new Date(),
		});

		await wishlist.save();

		res.json({
			success: true,
			message: "Produit ajouté à la liste de souhaits",
		});
	} catch (error) {
		console.error("Error adding to wishlist:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de l'ajout à la liste de souhaits",
		});
	}
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
	try {
		const userId = req.user._id;
		const { productId } = req.params;

		const wishlist = await Wishlist.findOne({ user: userId });

		if (!wishlist) {
			return res.status(404).json({
				success: false,
				message: "Liste de souhaits non trouvée",
			});
		}

		wishlist.products = wishlist.products.filter(
			(item) => item.product.toString() !== productId
		);

		await wishlist.save();

		res.json({
			success: true,
			message: "Produit retiré de la liste de souhaits",
		});
	} catch (error) {
		console.error("Error removing from wishlist:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la suppression de la liste de souhaits",
		});
	}
};

// Check if product is in wishlist
export const checkWishlistStatus = async (req, res) => {
	try {
		const userId = req.user._id;
		const { productId } = req.params;

		const wishlist = await Wishlist.findOne({ user: userId });

		const isInWishlist = wishlist
			? wishlist.products.some((item) => item.product.toString() === productId)
			: false;

		res.json({
			success: true,
			isInWishlist,
		});
	} catch (error) {
		console.error("Error checking wishlist status:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la vérification du statut",
		});
	}
};
