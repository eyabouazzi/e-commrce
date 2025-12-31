import User from "../models/user.model.js";

// Get user's addresses
export const getAddresses = async (req, res) => {
	try {
		const userId = req.user._id;

		const user = await User.findById(userId).select("addresses");

		res.json({
			success: true,
			addresses: user.addresses || [],
		});
	} catch (error) {
		console.error("Error getting addresses:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la récupération des adresses",
		});
	}
};

// Add new address
export const addAddress = async (req, res) => {
	try {
		const userId = req.user._id;
		const { type, street, city, state, zipCode, country, isDefault } = req.body;

		const user = await User.findById(userId);

		// If this is the default address, unset other defaults
		if (isDefault) {
			user.addresses.forEach((addr) => {
				addr.isDefault = false;
			});
		}

		const newAddress = {
			type,
			street,
			city,
			state,
			zipCode,
			country,
			isDefault: isDefault || false,
		};

		user.addresses.push(newAddress);
		await user.save();

		res.status(201).json({
			success: true,
			message: "Adresse ajoutée avec succès",
			address: newAddress,
		});
	} catch (error) {
		console.error("Error adding address:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de l'ajout de l'adresse",
		});
	}
};

// Update address
export const updateAddress = async (req, res) => {
	try {
		const userId = req.user._id;
		const { addressId } = req.params;
		const { type, street, city, state, zipCode, country, isDefault } = req.body;

		const user = await User.findById(userId);

		const addressIndex = user.addresses.findIndex(
			(addr) => addr._id.toString() === addressId
		);

		if (addressIndex === -1) {
			return res.status(404).json({
				success: false,
				message: "Adresse non trouvée",
			});
		}

		// If this is the default address, unset other defaults
		if (isDefault) {
			user.addresses.forEach((addr) => {
				addr.isDefault = false;
			});
		}

		user.addresses[addressIndex] = {
			...user.addresses[addressIndex],
			type: type || user.addresses[addressIndex].type,
			street: street || user.addresses[addressIndex].street,
			city: city || user.addresses[addressIndex].city,
			state: state || user.addresses[addressIndex].state,
			zipCode: zipCode || user.addresses[addressIndex].zipCode,
			country: country || user.addresses[addressIndex].country,
			isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault,
		};

		await user.save();

		res.json({
			success: true,
			message: "Adresse mise à jour avec succès",
			address: user.addresses[addressIndex],
		});
	} catch (error) {
		console.error("Error updating address:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la mise à jour de l'adresse",
		});
	}
};

// Delete address
export const deleteAddress = async (req, res) => {
	try {
		const userId = req.user._id;
		const { addressId } = req.params;

		const user = await User.findById(userId);

		const addressIndex = user.addresses.findIndex(
			(addr) => addr._id.toString() === addressId
		);

		if (addressIndex === -1) {
			return res.status(404).json({
				success: false,
				message: "Adresse non trouvée",
			});
		}

		user.addresses.splice(addressIndex, 1);
		await user.save();

		res.json({
			success: true,
			message: "Adresse supprimée avec succès",
		});
	} catch (error) {
		console.error("Error deleting address:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la suppression de l'adresse",
		});
	}
};

// Set default address
export const setDefaultAddress = async (req, res) => {
	try {
		const userId = req.user._id;
		const { addressId } = req.params;

		const user = await User.findById(userId);

		// Unset all defaults first
		user.addresses.forEach((addr) => {
			addr.isDefault = false;
		});

		// Set the specified address as default
		const address = user.addresses.find((addr) => addr._id.toString() === addressId);

		if (!address) {
			return res.status(404).json({
				success: false,
				message: "Adresse non trouvée",
			});
		}

		address.isDefault = true;
		await user.save();

		res.json({
			success: true,
			message: "Adresse par défaut définie avec succès",
		});
	} catch (error) {
		console.error("Error setting default address:", error);
		res.status(500).json({
			success: false,
			message: "Erreur lors de la définition de l'adresse par défaut",
		});
	}
};
