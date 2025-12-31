import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { OrdersController } from "@paypal/paypal-server-sdk";
import client from "../lib/paypal.js";
import stripe from "../lib/stripe.js";

export const createPaypalOrder = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		// Build items and subtotal from products
		let subtotal = 0;
		const items = products.map((product) => {
			subtotal += product.price * product.quantity;
			return {
				name: product.name,
				unitAmount: {
					currencyCode: "USD",
					value: product.price.toFixed(2),
				},
				quantity: product.quantity,
			};
		});

		if (subtotal >= 200) {
			await createNewCoupon(req.user._id);
		}

		// Apply coupon (if any) by adjusting item prices so PayPal's breakdown sums match the total
		let coupon = null;
		let total = subtotal;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				const discountFactor = 1 - coupon.discountPercentage / 100;
				// adjust each item's unit amount to include the discount so item totals match the final total
				let adjustedSubtotal = 0;
				for (const it of items) {
					const original = parseFloat(it.unitAmount.value);
					const discounted = Number((original * discountFactor).toFixed(2));
					it.unitAmount.value = discounted.toFixed(2);
					adjustedSubtotal += discounted * Number(it.quantity);
				}
				// avoid floating point rounding issues by rounding to 2 decimals
				adjustedSubtotal = Number(adjustedSubtotal.toFixed(2));
				subtotal = adjustedSubtotal;
				total = subtotal;
			}
		}

		const orderRequest = {
			intent: "CAPTURE",
			purchaseUnits: [
				{
					amount: {
						currencyCode: "USD",
						value: total.toFixed(2),
						breakdown: {
							itemTotal: {
								currencyCode: "USD",
								value: subtotal.toFixed(2),
							},
						},
					},
					items: items.map(item => ({
						name: item.name,
						unitAmount: {
							currencyCode: "USD",
							value: item.unitAmount.value,
						},
						quantity: item.quantity.toString(),
					})),
				},
			],
			applicationContext: {
				// PayPal does not accept Stripe-style placeholders like {CHECKOUT_SESSION_ID}.
				// Use a plain return URL; the client-side PayPal SDK handles approval/capture flow.
				returnUrl: `${process.env.CLIENT_URL}/purchase-success`,
				cancelUrl: `${process.env.CLIENT_URL}/purchase-cancel`,
			},
		};

		const ordersController = new OrdersController(client);
		console.log('Order Request:', JSON.stringify(orderRequest, null, 2));
		const { result } = await ordersController.createOrder({ body: orderRequest });

		res.status(200).json({ id: result.id });
	} catch (error) {
		console.error("Error creating PayPal order:", error);
		res.status(500).json({ message: "Error creating PayPal order", error: error.message });
	}
};

export const capturePaypalOrder = async (req, res) => {
	try {
		const { orderID, products, couponCode } = req.body;

		const ordersController = new OrdersController(client);
		const { result } = await ordersController.captureOrder({ id: orderID });

		if (result.status === "COMPLETED") {
			if (couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: couponCode,
						userId: req.user._id,
					},
					{
						isActive: false,
					}
				);
			}

			const newOrder = new Order({
				user: req.user._id,
				products: products.map((product) => ({
					product: product._id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: result.purchaseUnits[0].amount.value,
				paypalOrderId: orderID,
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error capturing PayPal order:", error);
		res.status(500).json({ message: "Error capturing PayPal order", error: error.message });
	}
};



async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}

export const createStripeSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let subtotal = 0;
		const lineItems = products.map((product) => {
			subtotal += product.price * product.quantity;
			return {
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: Math.round(product.price * 100),
				},
				quantity: product.quantity,
			};
		});

		let total = subtotal;
		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				total = subtotal * (1 - coupon.discountPercentage / 100);
			}
		}

		if (subtotal >= 200) {
			await createNewCoupon(req.user._id);
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon ? [{ coupon: coupon.stripeCouponId }] : [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(products.map(p => ({
					id: p._id,
					quantity: p.quantity,
					price: p.price
				}))),
			},
		});

		res.status(200).json({ id: session.id, url: session.url });
	} catch (error) {
		console.error("Error creating Stripe session:", error);
		res.status(500).json({ message: "Error creating Stripe session", error: error.message });
	}
};

export const confirmStripePayment = async (req, res) => {
	try {
		const { sessionId } = req.body;

		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			const { userId, couponCode, products } = session.metadata;

			if (couponCode) {
				await Coupon.findOneAndUpdate(
					{ code: couponCode, userId },
					{ isActive: false }
				);
			}

			const parsedProducts = JSON.parse(products);
			const newOrder = new Order({
				user: userId,
				products: parsedProducts.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: session.amount_total / 100,
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		} else {
			res.status(400).json({ message: "Payment not completed" });
		}
	} catch (error) {
		console.error("Error confirming Stripe payment:", error);
		res.status(500).json({ message: "Error confirming Stripe payment", error: error.message });
	}
};
