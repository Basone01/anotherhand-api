const path = require("path");
const dbpath = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;
const FB_PAGE_TOKEN = process.env.PAGE_TOKEN;
const FB_WEBHOOK_TOKEN = process.env.FB_WEBHOOK_TOKEN;
const DEV_MODE = process.env.NODE_ENV === "development";
const HOST =
  process.env.NODE_ENV === "development"
    ? "https://a42db2cd.ngrok.io"
    : "https://anotherhand.herokuapp.com";
module.exports = {
  db: dbpath,
  FB_PAGE_TOKEN,
  FB_WEBHOOK_TOKEN,
  DEV_MODE,
  DEV_SHOP_ID: "1274274259365681",
  ROOT_DIR: path.join(__dirname, "../"),
  HOST
};
