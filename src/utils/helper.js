module.exports = {
	asyncForEach : async function (arr, cb) {
		for (let i = 0; i < arr.length; i++) {
			await cb(arr[i], i, arr);
		}
	}
};
