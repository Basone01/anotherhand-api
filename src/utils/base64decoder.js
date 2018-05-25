module.exports = function base64toBuffer(base64code) {
	let matches = base64code.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
	let	response = {};

	if (matches.length !== 3) {
		return new Error('Invalid input string');
	}
	response.type = matches[1];
	
	response.data = new Buffer.from(matches[2], 'base64');
	return response;
}
