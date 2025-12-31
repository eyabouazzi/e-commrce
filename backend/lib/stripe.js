import Stripe from "stripe";

const stripeKey = process.env.STRIPE_SECRET_KEY;

let stripe = null;

if (!stripeKey) {
	console.warn("Stripe secret key (STRIPE_SECRET_KEY) is not set. Stripe features will be disabled.");
	// lightweight wrapper to avoid crashes when code calls checkout.sessions.create/retrieve
	stripe = {
		checkout: {
			sessions: {
				create: async () => {
					throw new Error("Stripe not configured: STRIPE_SECRET_KEY is missing");
				},
				retrieve: async () => {
					throw new Error("Stripe not configured: STRIPE_SECRET_KEY is missing");
				},
			},
		},
	};
} else {
	stripe = new Stripe(stripeKey);
}

export default stripe;