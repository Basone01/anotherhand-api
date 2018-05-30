const base64decoder = require('./base64decoder');
async function asyncForEach(arr, cb) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    const res = await cb(arr[i], i, arr);
    result.push(res);
  }
  return result;
}

module.exports = {
  asyncForEach

};
