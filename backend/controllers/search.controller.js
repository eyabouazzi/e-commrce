import Product from "../models/product.model.js";

// Advanced search with filters
export const searchProducts = async (req, res) => {
	try {
		const {
			q, // search query
			category,
			minPrice,
			maxPrice,
			rating,
			sortBy = "createdAt",
			sortOrder = "desc",
			page = 1,
			limit = 12,
		} = req.query;

		let query = {};

		// Text search
		if (q) {
			query.$or = [
				{ name: { $regex: q, $options: "i" } },
				{ description: { $regex: q, $options: "i" } },
			];
		}

		// Category filter
		if (category) {
			query.category = { $regex: category, $options: "i" };
		}

		// Price range filter
		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = parseFloat(minPrice);
			if (maxPrice) query.price.$lte = parseFloat(maxPrice);
		}

		// Rating filter
		if (rating) {
			query.averageRating = { $gte: parseFloat(rating) };
		}

		// Sorting
		let sortOptions = {};
		sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

		// Special sorting cases
		if (sortBy === "rating") {
			sortOptions = { averageRating: sortOrder === "desc" ? -1 : 1 };
		} else if (sortBy === "price") {
			sortOptions = { price: sortOrder === "desc" ? -1 : 1 };
		} else if (sortBy === "popularity") {
			sortOptions = { numReviews: sortOrder === "desc" ? -1 : 1 };
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const products = await Product.find(query)
			.sort(sortOptions)
			.skip(skip)
			.limit(parseInt(limit))
			.select("name price image category averageRating numReviews isFeatured");

		const total = await Product.countDocuments(query);

		// Get unique categories for filter options
		const categories = await Product.distinct("category");

		// Get price range for filter options
		const priceStats = await Product.aggregate([
			{ $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } },
		]);

		res.json({
			success: true,
			products,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalProducts: total,
				hasNext: parseInt(page) * parseInt(limit) < total,
				hasPrev: parseInt(page) > 1,
			},
			filters: {
				categories,
				priceRange: priceStats[0] || { minPrice: 0, maxPrice: 1000 },
			},
		});
	} catch (error) {
		console.error("Error searching products:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la recherche de produits",
		});
	}
};

// Get search suggestions
export const getSearchSuggestions = async (req, res) => {
	try {
		const { q } = req.query;

		if (!q || q.length < 2) {
			return res.json({
				success: true,
				suggestions: [],
			});
		}

		// Get product name suggestions
		const productSuggestions = await Product.find({
			name: { $regex: q, $options: "i" },
		})
			.limit(5)
			.select("name");

		// Get category suggestions
		const categorySuggestions = await Product.distinct("category", {
			category: { $regex: q, $options: "i" },
		});

		const suggestions = [
			...productSuggestions.map((p) => ({ type: "product", value: p.name })),
			...categorySuggestions.map((cat) => ({ type: "category", value: cat })),
		];

		res.json({
			success: true,
			suggestions: suggestions.slice(0, 8), // Limit to 8 suggestions
		});
	} catch (error) {
		console.error("Error getting search suggestions:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des suggestions",
		});
	}
};

// Get featured products for homepage
export const getFeaturedProducts = async (req, res) => {
	try {
		const products = await Product.find({ isFeatured: true })
			.sort({ averageRating: -1, numReviews: -1 })
			.limit(8)
			.select("name price image category averageRating numReviews");

		res.json({
			success: true,
			products,
		});
	} catch (error) {
		console.error("Error getting featured products:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des produits vedettes",
		});
	}
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
	try {
		const { category } = req.params;
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 12;

		const query = { category: { $regex: category, $options: "i" } };
		const skip = (page - 1) * limit;

		const products = await Product.find(query)
			.sort({ averageRating: -1, numReviews: -1 })
			.skip(skip)
			.limit(limit)
			.select("name price image category averageRating numReviews");

		const total = await Product.countDocuments(query);

		res.json({
			success: true,
			products,
			pagination: {
				currentPage: page,
				totalPages: Math.ceil(total / limit),
				totalProducts: total,
				hasNext: page * limit < total,
				hasPrev: page > 1,
			},
		});
	} catch (error) {
		console.error("Error getting products by category:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des produits par catégorie",
		});
	}
};
