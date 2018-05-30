const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'duejf7bfy',
    api_key: '828724832219654',
    api_secret: '2U3iAmQEZ7xDacCr7Z9sJwGtEis'
});

const uploadImage = (file) => new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file, function(err, result) {
        if (result.secure_url) {
            return resolve(result.secure_url)
        } else {
            return reject(new Error("Upload Failed\n" + err))
        }
    })
})


module.exports = {
    uploadImage
}
