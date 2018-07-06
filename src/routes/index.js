const webhookRoutes = require("./webhook");
const productRoutes = require("./product");
const shopRoutes = require("./shop");
const orderRoutes = require("./order");
const conversationRoutes = require("./conversation");
function applyRoutes(app) {
	app.use("/webhook", webhookRoutes);
	app.use("/api", shopRoutes);
	app.use("/api", productRoutes);
	app.use("/api", orderRoutes);
	app.use("/api", conversationRoutes);
}

module.exports = applyRoutes;
