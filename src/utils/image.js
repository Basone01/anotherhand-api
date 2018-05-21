const axios = require('axios').default;
const cv = require('opencv4nodejs');
const helper = require('./helper');
const path = require('path');
const mockupProductsArray = require('./sampleProducts.json');
const compareImage = async (image, templateImage) => {
	// this function parameter can accept path-string and buffer with different read
	// method
	let userCapturedImage = typeof image === 'string'
		? cv.imread(image)
		: cv.imdecode(image);
	let templateFromDB = typeof templateImage === 'string'
		? cv.imread(templateImage)
		: cv.imdecode(templateImage);

	//resize to max 512 for faster compare and scale the larger one to same width
	userCapturedImage = userCapturedImage.resizeToMax(512);
	if (userCapturedImage.cols > templateFromDB.cols) {
		userCapturedImage = userCapturedImage.rescale(templateFromDB.cols / userCapturedImage.cols);
	} else if (templateFromDB.cols > userCapturedImage.cols) {
		templateFromDB = templateFromDB.rescale(userCapturedImage.cols / templateFromDB.cols);
	}

	//matching
	const matched = userCapturedImage.matchTemplate(templateFromDB, 5);

	//min and max with location of matched rate are return from minMaxLoc()
	const minMax = matched.minMaxLoc();
	const maxAccuracy = minMax.maxVal;
	//send the most matched value back
	return maxAccuracy;
};

async function compareWithImgArray(loadedScreenshot, productImgArray) {
	try {
		for (let i = 0; i < productImgArray.length; i++) {
			console.log(`at image ${i+1}`);
			const imageFullPath = path.join(__dirname, "testImages" , productImgArray[i]);
			const matchedRate = await compareImage(loadedScreenshot, imageFullPath);
			console.log(`Rate : ${matchedRate}`);
			
			if (matchedRate > 0.9) {
				return imageFullPath;
			}
		}
		console.log("===================================");
		
	} catch (error) {
		throw error;
	}

	return null;
}

async function downloadImageToBuffer(url) {
	const { data } = await axios.get(url, { responseType: 'arraybuffer' });
	return data;
}

async function findMatchedProduct(screenshotUrl, productArray) {
	try {
		const loadedScreenshot = await downloadImageToBuffer(screenshotUrl);
		for (let i = 0; i < productArray.length; i++) {
			console.log("Matching with",productArray[i].name);
			
			const imgPath = await compareWithImgArray(loadedScreenshot, productArray[i].imagePaths)
			if (imgPath) {
				return { matchedProduct: productArray[i], matchedImage: imgPath };
			}
		}
		return null;
	} catch (error) {
		throw error
	}
}


module.exports = {
	downloadImageToBuffer,
	findMatchedProduct
};
