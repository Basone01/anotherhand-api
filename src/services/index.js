const imageService = require("./image");
const FacebookAPI = require("./facebook");
const uploader = require('./uploader');
module.exports = {
  imageService,
  FacebookAPI,
  uploadImage: uploader.uploadImage
};
