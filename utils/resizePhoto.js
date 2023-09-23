const Jimp = require('jimp');
const catchAsync = require('./catchAsync');

/* eslint-disable */

module.exports = resizePhoto = catchAsync(
  async (buffer, outputPath, dimensions = [250, 250]) =>
    (await Jimp.read(buffer)).resize(...dimensions).write(outputPath)
);
