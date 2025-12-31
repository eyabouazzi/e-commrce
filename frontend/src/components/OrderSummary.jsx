import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";
import axios from "../lib/axios";
import { useEffect, useState } from "react";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";

const OrderSummary = () => {
	const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
	const { user } = useUserStore();
	const [isPaying, setIsPaying] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("paypal");
	const navigate = useNavigate();
	const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

	const savings = subtotal - total;
	const formattedSubtotal = subtotal.toFixed(2);
	const formattedTotal = total.toFixed(2);
	const formattedSavings = savings.toFixed(2);

	const handleStripePayment = async () => {
		setIsPaying(true);
		try {
			const res = await axios.post("/payments/create-stripe-session", {
				products: cart,
				couponCode: coupon ? coupon.code : null,
			});

			const stripe = await stripePromise;
			const { error } = await stripe.redirectToCheckout({
				sessionId: res.data.id,
			});

			if (error) {
				console.error("Stripe redirect error:", error);
			}
		} catch (error) {
			console.error("Error initiating Stripe payment:", error);
		} finally {
			setIsPaying(false);
		}
	};

	useEffect(() => {
		// Only load PayPal SDK and render buttons when user is authenticated
		if (paymentMethod === "paypal") {
			if (!user) {
				// don't inject the PayPal button for guests
				return;
			}

			const script = document.createElement("script");
			script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}`;
			script.addEventListener("load", () => {
				if (!window.paypal) return;

				window.paypal
					.Buttons({
						createOrder: async () => {
							try {
								const res = await axios.post("/payments/create-paypal-order", {
									products: cart,
									couponCode: coupon ? coupon.code : null,
								});
								return res.data.id;
							} catch (err) {
								console.error("create-paypal-order failed", err);
								toast.error(err.response?.data?.message || "Failed to create PayPal order. Please try again.");
								return null;
							}
						},
						onApprove: async (data) => {
							setIsPaying(true);
							try {
								await axios.post("/payments/capture-paypal-order", {
									orderID: data.orderID,
									products: cart,
									couponCode: coupon ? coupon.code : null,
								});
								navigate("/purchase-success");
							} catch (err) {
								console.error("capture-paypal-order failed", err);
								toast.error(err.response?.data?.message || "Failed to capture PayPal order.");
							} finally {
								setIsPaying(false);
							}
						},
						onError: (err) => {
							console.error("PayPal Buttons error", err);
							toast.error("PayPal error occurred. Please try again later.");
						},
					})
					.render("#paypal-button-container");
			});
			document.body.appendChild(script);
		}
	}, [cart, coupon, navigate, paymentMethod, user]);



	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-semibold text-emerald-400'>Order summary</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-gray-300'>Original price</dt>
						<dd className='text-base font-medium text-white'>${formattedSubtotal}</dd>
					</dl>

					{savings > 0 && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Savings</dt>
							<dd className='text-base font-medium text-emerald-400'>-${formattedSavings}</dd>
						</dl>
					)}

					{coupon && isCouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
							<dd className='text-base font-medium text-emerald-400'>-{coupon.discountPercentage}%</dd>
						</dl>
					)}
					<dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
						<dt className='text-base font-bold text-white'>Total</dt>
						<dd className='text-base font-bold text-emerald-400'>${formattedTotal}</dd>
					</dl>
				</div>

				<div className='space-y-4'>
					<div className='flex items-center space-x-4'>
						<label className='flex items-center'>
							<input
								type='radio'
								value='paypal'
								checked={paymentMethod === 'paypal'}
								onChange={(e) => setPaymentMethod(e.target.value)}
								className='mr-2'
							/>
							PayPal
						</label>
						<label className='flex items-center'>
							<input
								type='radio'
								value='stripe'
								checked={paymentMethod === 'stripe'}
								onChange={(e) => setPaymentMethod(e.target.value)}
								className='mr-2'
							/>
							Credit Card (Stripe)
						</label>
					</div>

					{paymentMethod === 'paypal' && (
						user ? (
							<div id='paypal-button-container'></div>
						) : (
							<div className='text-center'>
								<p className='text-sm text-gray-400 mb-2'>You need to be logged in to pay with PayPal.</p>
								<Link
									to='/login'
									className='inline-flex items-center gap-2 bg-emerald-500 px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-600'
								>
									Login to Pay with PayPal
								</Link>
							</div>
						)
					)}

					{paymentMethod === 'stripe' && (
						<button
							onClick={handleStripePayment}
							disabled={isPaying}
							className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50'
						>
							{isPaying ? 'Processing...' : 'Pay with Credit Card'}
						</button>
					)}
				</div>

				{isPaying && <p className='text-center text-white'>Processing payment...</p>}

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-gray-400'>or</span>
					<Link
						to='/'
						className='inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline'
					>
						Continue Shopping
						<MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
};
export default OrderSummary;