const fetch = require('node-fetch');

/**
 * Obtain Buffer object from an image URL
 * @param {string} url URL to image file
 * @return {Promise<Buffer>} Buffer with image data.
 */
const getBuffer = async (url : string) : Promise<Buffer> => {
  const response = await fetch(url);
  const buffer : Buffer = await response.buffer();
  return new Promise((resolve) => {
    resolve(buffer);
  });
};

export default getBuffer;
