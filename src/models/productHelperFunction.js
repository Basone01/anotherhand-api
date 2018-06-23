
const isProductOutOfStock = (product) => {
	if (product.sizes.length < 1) {
		if (product.stock < 1) {
			return true;
		}
	}
	else {
		const total_stock = product.sizes.reduce((stock, size) => stock + size.stock, 0);
		if (total_stock < 1) {
			return true;
		}
	}
	return false;
};

const getProductDisplayPriceRange = (product) => {
	if (product.sizes.length > 0) {
		const sizes_price = product.sizes.map((size) => size.price);
		return Math.min(...sizes_price) < Math.max(...sizes_price)
			? `${Math.min(...sizes_price)}-${Math.max(...sizes_price)}`
			: Math.max(...sizes_price);
	}
	else {
		return product.price;
	}
};


const getProductRemainingStockAnswer = (matchedProduct) => {
	const { sizes, size_type, stock } = matchedProduct;
	let answer = '';

	if (sizes.length > 0) {
		// has sizes
		const allSizeStock = getCountFromSizeArray(sizes);
		if (allSizeStock > 0) {
			// has remaining stock
			const sizeList = getSizeListStringFromSizes(sizes, size_type);
			answer = `ตอนนี้เหลือ\n${sizeList} นิหื๊ออออ~ \nพิเลือกๆๆเลย...`;
		}
		else {
			//out of stock
			answer = `แต่ตอนนี้ของหมดล๊าวว~ พิมะต้องเลือกๆ`;
		}
	}
	else {
		//no sizes
		if (stock > 0) {
			//has available stock
			answer = `ตอนนี้เหลืออยู่ ${stock} อันนิหื๊ออออ~\nพิเลือกๆๆเลย...`;
		}
		else {
			answer = `แต่ตอนนี้ของหมดล๊าวว~ พิมะต้องเลือกๆ`;
		}
	}
	return answer;
};

//Get Answer about remaining stock
const getCountFromSizeArray = (sizeArray) => {
	return sizeArray.reduce((count, size) => {
		return count + size.stock;
	}, 0);
};
const getSizeListStringFromSizes = (sizes, size_type) => {
	return sizes.filter((size) => size.stock > 0).map((size) => `${size.size}${size_type}`).join(', ');
};

module.exports={
    isProductOutOfStock,
    getSizeListStringFromSizes,
    getCountFromSizeArray,
    getProductRemainingStockAnswer,
    getProductDisplayPriceRange
}