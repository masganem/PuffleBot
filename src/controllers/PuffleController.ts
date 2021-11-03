import fs from 'fs';
import SearchController from './SearchController';

const path = './log/';
const foods = JSON.parse(fs.readFileSync(path + 'foods.json', 'utf-8'));
const names = JSON.parse(fs.readFileSync(path + 'names.json', 'utf-8'));

/**
 Designed to hold general attributes of a puffle.
*/
class Puffle {
  name : string;
  image : string;
  favoriteFood : string;
  status : {
    food : number,
    happiness : number,
  };
  lastChecked : string;
  birthday : string;

  /**
   * Default constructor for an instance of Puffle.
   * @param {string} image URL of the puffle's image.
   * @param {string} name Name to be given to the puffle.
   */
  constructor(image : string, name? : string) {
    const now = new Date();
    this.name = name || names[Math.floor(Math.random()*(names.length-1))];
    this.image = image;
    this.favoriteFood = foods[Math.floor(Math.random()*(foods.length-1))];
    this.status = {
      food: 5,
      happiness: 5,
    };
    this.lastChecked = now.toJSON();
    this.birthday = now.toJSON();
  };
}


class PuffleController {
  /**
    Generates a new Puffle object based on the given description.
    If not provided with a name, one will be randomly selected.
    @param {string} name - The puffle's name.
  */
  async create(name? : string) : Promise<Puffle> {
    const image = await SearchController.searchImage();
    return new Puffle(image, name);
  }

  check(puffle : Puffle) : Puffle {
    const now = new Date();
    const msDiff = now.getTime() - new Date(puffle.lastChecked).getTime();
    const ticks = Math.floor(msDiff/Number(process.env.TICK_INTERVAL));
    puffle.status.food -= ticks; // 432 for death in 3 days
    puffle.status.happiness -= ticks;
    if (ticks > 0) puffle.lastChecked = now.toJSON();
    return puffle;
  }

  feed(puffle : Puffle) : Puffle {
    puffle.status.food = 10;
    return puffle;
  }

  play(puffle : Puffle) : Puffle {
    puffle.status.happiness = 10;
    return puffle;
  }
}


export {Puffle};

export default new PuffleController();
