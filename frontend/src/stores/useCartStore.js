import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { useUserStore } from "./useUserStore";

const GUEST_CART_KEY = "guest_cart";

export const useCartStore = create((set, get) => ({
	cart: [],
	coupon: null,
	total: 0,
	subtotal: 0,
	isCouponApplied: false,

	getMyCoupon: async () => {
		try {
			const response = await axios.get("/coupons");
			set({ coupon: response.data });
		} catch (error) {
			console.error("Error fetching coupon:", error);
		}
	},
	applyCoupon: async (code) => {
		try {
			const response = await axios.post("/coupons/validate", { code });
			set({ coupon: response.data, isCouponApplied: true });
			get().calculateTotals();
			toast.success("Coupon applied successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to apply coupon");
		}
	},
	removeCoupon: () => {
		set({ coupon: null, isCouponApplied: false });
		get().calculateTotals();
		toast.success("Coupon removed");
	},

	getCartItems: async () => {
		const { user } = useUserStore.getState();
		if (!user) {
			// load guest cart from localStorage
			try {
				const stored = localStorage.getItem(GUEST_CART_KEY);
				const cart = stored ? JSON.parse(stored) : [];
				set({ cart });
				get().calculateTotals();
			} catch (err) {
				set({ cart: [] });
			}
			return;
		}

		try {
			const res = await axios.get("/cart");
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			set({ cart: [] });
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	clearCart: async () => {
		set({ cart: [], coupon: null, total: 0, subtotal: 0 });
	},
	addToCart: async (product) => {
		const { user } = useUserStore.getState();
		if (!user) {
			// guest: store in localStorage and update state
			set((prevState) => {
				const existingItem = prevState.cart.find((item) => item._id === product._id);
				const newCart = existingItem
					? prevState.cart.map((item) =>
						item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
					)
					: [...prevState.cart, { ...product, quantity: 1 }];
				try {
					localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
				} catch (e) {
					console.error("Failed saving guest cart", e);
				}
				toast.success("Product added to cart");
				get().calculateTotals();
				return { cart: newCart };
			});
			return;
		}

		try {
			await axios.post("/cart", { productId: product._id });
			toast.success("Product added to cart");

			set((prevState) => {
				const existingItem = prevState.cart.find((item) => item._id === product._id);
				const newCart = existingItem
					? prevState.cart.map((item) =>
							item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
						)
					: [...prevState.cart, { ...product, quantity: 1 }];
				return { cart: newCart };
			});
			get().calculateTotals();
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred");
		}
	},
	removeFromCart: async (productId) => {
		const { user } = useUserStore.getState();
		if (!user) {
			set((prevState) => {
				const newCart = prevState.cart.filter((item) => item._id !== productId);
				try {
					localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
				} catch (e) {
					console.error("Failed saving guest cart", e);
				}
				get().calculateTotals();
				return { cart: newCart };
			});
			return;
		}

		await axios.delete(`/cart`, { data: { productId } });
		set((prevState) => ({ cart: prevState.cart.filter((item) => item._id !== productId) }));
		get().calculateTotals();
	},
	updateQuantity: async (productId, quantity) => {
		if (quantity === 0) {
			get().removeFromCart(productId);
			return;
		}

		const { user } = useUserStore.getState();
		if (!user) {
			set((prevState) => {
				const newCart = prevState.cart.map((item) =>
					item._id === productId ? { ...item, quantity } : item
				);
				try {
					localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newCart));
				} catch (e) {
					console.error("Failed saving guest cart", e);
				}
				get().calculateTotals();
				return { cart: newCart };
			});
			return;
		}

		await axios.put(`/cart/${productId}`, { quantity });
		set((prevState) => ({
			cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)),
		}));
		get().calculateTotals();
	},

	syncLocalCartToBackend: async () => {
		const { user } = useUserStore.getState();
		if (!user) return;
		try {
			const stored = localStorage.getItem(GUEST_CART_KEY);
			const cart = stored ? JSON.parse(stored) : [];
			// Run sync operations in parallel per item to avoid sequential delays
			await Promise.all(
				cart.map(async (item) => {
					try {
						// add item (will increment if exists)
						await axios.post("/cart", { productId: item._id });
						// then set the exact quantity
						await axios.put(`/cart/${item._id}`, { quantity: item.quantity });
					} catch (e) {
						console.warn("Failed to sync item", item._id, e.message);
					}
				})
			);
			localStorage.removeItem(GUEST_CART_KEY);
			// refresh from backend
			await get().getCartItems();
		} catch (err) {
			console.error("Error syncing local cart", err);
		}
	},
	calculateTotals: () => {
		const { cart, coupon } = get();
		const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
		let total = subtotal;

		if (coupon) {
			const discount = subtotal * (coupon.discountPercentage / 100);
			total = subtotal - discount;
		}

		set({ subtotal, total });
	},
}));
