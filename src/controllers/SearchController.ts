import {NotFoundError} from '../util/errors';

const imageSearch = require('image-search-google');

const client = new imageSearch('7ebf245555e8dd903',
    'AIzaSyD1ckQEDnxlwtBDQN8NELDfCql1in8bNdk');

const colors = ['red', 'blue', 'orange', 'black', 'white', 'rainbow', 'teal', 'green'];

/**
 * Designed to hold methods for interacting with the image search API.
 */
class SearchController {
  /**
   * Searches for images of a Club Penguin puffle of a random color.
   * @return {Promise<string>} A randomly selected image URL from search results.
   */
  async searchImage() : Promise<string> {
    const result = await client.search(colors[Math.floor(Math.random()*(colors.length-1))] + ' club penguin puffle',
        {page: 1});
    try {
      return result[Math.floor(Math.random()*(result.length-1))].thumbnail;
    } catch (err) {
      throw new NotFoundError('Unable to find a puffle.');
    }
  }
}

export default new SearchController();
