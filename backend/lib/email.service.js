import nodemailer from "nodemailer";

// Create transporter
const createTransporter = () => {
	return nodemailer.createTransporter({
		host: process.env.EMAIL_HOST || "smtp.gmail.com",
		port: process.env.EMAIL_PORT || 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});
};

// Email templates
const emailTemplates = {
	orderConfirmation: (order, user) => ({
		subject: `Confirmation de commande #${order._id}`,
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Merci pour votre commande !</h2>
				<p>Bonjour ${user.name},</p>
				<p>Votre commande a été confirmée avec succès.</p>

				<div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
					<h3>Détails de la commande</h3>
					<p><strong>ID de commande:</strong> ${order._id}</p>
					<p><strong>Total:</strong> ${order.totalAmount}€</p>
					<p><strong>Statut:</strong> ${order.status}</p>
				</div>

				<p>Vous recevrez un email lorsque votre commande sera expédiée.</p>
				<p>Cordialement,<br>L'équipe E-Commerce</p>
			</div>
		`,
	}),

	orderShipped: (order, user, trackingNumber) => ({
		subject: `Votre commande #${order._id} a été expédiée`,
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Votre commande est en route !</h2>
				<p>Bonjour ${user.name},</p>
				<p>Bonne nouvelle ! Votre commande a été expédiée.</p>

				<div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
					<h3>Informations de livraison</h3>
					<p><strong>ID de commande:</strong> ${order._id}</p>
					<p><strong>Numéro de suivi:</strong> ${trackingNumber || "À venir"}</p>
					<p><strong>Livraison estimée:</strong> ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('fr-FR') : "À confirmer"}</p>
				</div>

				<p>Vous pouvez suivre votre commande dans votre espace client.</p>
				<p>Cordialement,<br>L'équipe E-Commerce</p>
			</div>
		`,
	}),

	orderDelivered: (order, user) => ({
		subject: `Votre commande #${order._id} a été livrée`,
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Commande livrée avec succès !</h2>
				<p>Bonjour ${user.name},</p>
				<p>Votre commande a été livrée à l'adresse indiquée.</p>

				<div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
					<h3>Résumé de la commande</h3>
					<p><strong>ID de commande:</strong> ${order._id}</p>
					<p><strong>Date de livraison:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
				</div>

				<p>N'hésitez pas à nous laisser un avis sur les produits commandés.</p>
				<p>Cordialement,<br>L'équipe E-Commerce</p>
			</div>
		`,
	}),

	passwordReset: (user, resetToken) => ({
		subject: "Réinitialisation de votre mot de passe",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Réinitialisation de mot de passe</h2>
				<p>Bonjour ${user.name},</p>
				<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>

				<div style="background: #f5f5f5; padding: 20px; margin: 20px 0; text-align: center;">
					<a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}"
					   style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
						Réinitialiser le mot de passe
					</a>
				</div>

				<p>Ce lien expire dans 1 heure.</p>
				<p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
				<p>Cordialement,<br>L'équipe E-Commerce</p>
			</div>
		`,
	}),

	welcome: (user) => ({
		subject: "Bienvenue sur notre plateforme E-Commerce !",
		html: `
			<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
				<h2>Bienvenue ${user.name} !</h2>
				<p>Merci de vous être inscrit sur notre plateforme.</p>

				<div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
					<h3>Que faire maintenant ?</h3>
					<ul>
						<li>Parcourez notre catalogue de produits</li>
						<li>Ajoutez des articles à votre panier</li>
						<li>Créez une liste de souhaits</li>
						<li>Laissez des avis sur vos achats</li>
					</ul>
				</div>

				<p>Cordialement,<br>L'équipe E-Commerce</p>
			</div>
		`,
	}),
};

// Send email function
export const sendEmail = async (to, template, data) => {
	try {
		const transporter = createTransporter();

		const emailContent = emailTemplates[template](...data);

		const mailOptions = {
			from: `"E-Commerce Store" <${process.env.EMAIL_USER}>`,
			to,
			subject: emailContent.subject,
			html: emailContent.html,
		};

		const info = await transporter.sendMail(mailOptions);
		console.log("Email sent:", info.messageId);

		return { success: true, messageId: info.messageId };
	} catch (error) {
		console.error("Error sending email:", error);
		throw error;
	}
};

// Specific email functions
export const sendOrderConfirmation = async (order, user) => {
	return sendEmail(user.email, "orderConfirmation", [order, user]);
};

export const sendOrderShipped = async (order, user, trackingNumber) => {
	return sendEmail(user.email, "orderShipped", [order, user, trackingNumber]);
};

export const sendOrderDelivered = async (order, user) => {
	return sendEmail(user.email, "orderDelivered", [order, user]);
};

export const sendPasswordReset = async (user, resetToken) => {
	return sendEmail(user.email, "passwordReset", [user, resetToken]);
};

export const sendWelcomeEmail = async (user) => {
	return sendEmail(user.email, "welcome", [user]);
};
