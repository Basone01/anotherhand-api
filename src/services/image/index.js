const axios = require("axios").default;
const cv = require("opencv4nodejs");
const compareImage = async (image, templateImage) => {
  // this function parameter can accept path-string and buffer with different read
  // method
  try {
    let userCapturedImage = typeof image === "string" ? cv.imread(image) : cv.imdecode(image);
    let templateFromDB = typeof templateImage === "string"
      ? cv.imread(templateImage)
      : cv.imdecode(templateImage);
      // console.log(userCapturedImage, templateFromDB);

    //resize to max 512 for faster compare and scale the larger one to same width
    userCapturedImage = userCapturedImage.resizeToMax(512);
    if (userCapturedImage.cols > templateFromDB.cols) {
      userCapturedImage = userCapturedImage.rescale(
        templateFromDB.cols / userCapturedImage.cols
      );
    } else if (templateFromDB.cols > userCapturedImage.cols) {
      templateFromDB = templateFromDB.rescale(
        userCapturedImage.cols / templateFromDB.cols
      );
    }

    //matching
    const matched = userCapturedImage.matchTemplate(templateFromDB, 5);

    //min and max with location of matched rate are return from minMaxLoc()
    const minMax = matched.minMaxLoc();
    const maxAccuracy = minMax.maxVal;
    //send the most matched value back
    return maxAccuracy;
  } catch (error) {
    console.log(error.id);
    return null;
  // throw error;
  }
};

async function compareWithImgArray(loadedScreenshot, productImgArray) {
  try {
    for (let i = 0; i < productImgArray.length; i++) {
      // console.log(`at image ${i+1}`);
      const matchedRate = await compareImage(
        loadedScreenshot,
        productImgArray[i]
      );
      console.log(`Matched Rate : ${matchedRate}`);

      if (matchedRate > 0.8) {
        return productImgArray[i];
      }
    }
  } catch (error) {
    throw error;
  }

  return null;
}

async function downloadImageToBuffer(url) {
  const {data} = await axios.get(url, {
    responseType: "arraybuffer"
  });
  return data;
}

async function findMatchedProduct(loadedScreenshotBuffer, productArray) {
  try {
    for (let i = 0; i < productArray.length; i++) {
      console.log(
        "================ Comparing With " +
        productArray[i].name +
        " ===================\n"
      );

      const downloaded_images = await Promise.all(productArray[i].images.map(downloadImageToBuffer));
      const imgPath = await compareWithImgArray(
        loadedScreenshotBuffer,
        downloaded_images
      );

      console.log();

      if (imgPath) {
        return {
          matchedProduct: productArray[i],
          matchedImage: imgPath
        };
      }
    }
    return {
      matchedProduct: null,
      matchedImage: null
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  downloadImageToBuffer,
  findMatchedProduct
};
