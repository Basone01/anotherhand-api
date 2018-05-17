const webhookRoutes = require("./webhook");
const productRoutes = require("./product");
const shopRoutes = require("./shop");
function applyRoutes(app) {
	app.use("/webhook", webhookRoutes);
	app.use("/api", shopRoutes);
	app.use("/api", productRoutes);
}

module.exports = applyRoutes;
