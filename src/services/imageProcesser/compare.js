//import opencv form global of docker container
const cv = require('opencv4nodejs');
const path = require('path')

const compareImage = async (image, templateImage) => {
	// console.time('matching');

	// Load images
	try {
		let userCapturedImage = await cv.imreadAsync(image);
		let templateFromDB = await cv.imreadAsync(templateImage);

		userCapturedImage = await userCapturedImage.resizeToMaxAsync(512);
		if (userCapturedImage.cols > templateFromDB.cols) {
			userCapturedImage = await userCapturedImage.rescaleAsync(
				templateFromDB.cols / userCapturedImage.cols
			);
		} else if (templateFromDB.cols > userCapturedImage.cols) {
			templateFromDB = await templateFromDB.rescaleAsync(
				userCapturedImage.cols / templateFromDB.cols
			);
		}

		// Match template (the brightest locations indicate the highest match)
		const matched = userCapturedImage.matchTemplate(templateFromDB, 5);
	
		// Use minMaxLoc to locate the highest value (or lower, depending of the type of matching method)
		const minMax = matched.minMaxLoc();
		const { maxLoc: { x, y } } = minMax;
		console.log('matched', minMax.maxVal);
	
		// Draw bounding rectangle
		userCapturedImage.drawRectangle(
			new cv.Rect(x, y, templateFromDB.cols, templateFromDB.rows),
			new cv.Vec(0, 255, 0),
			2,
			cv.LINE_AA
		);
	
		// console.timeEnd('matching');

		return minMax.maxVal;
	} catch (error) {
		console.log(error);
		throw error
	}
	

};

const findFromAll = async () => {
	for (let index = 1; index < 6; index++) {
		console.log('============================');
		console.log('comparing', index);
		console.log('============================');
		try {
			const result = await compareImage(path.join(__dirname,'./act.png'), path.join(__dirname,`./tem${index}.jpg`));
			console.log(result);
			if (result > 0.9) {
				console.log('Found!!!');
				break;
			}
		} catch (error) {
			console.log(error);
			
		}
		
	}
};

module.exports = findFromAll