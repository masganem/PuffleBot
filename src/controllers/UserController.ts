import fs from 'fs';
import DirectMessage from '../services/observers/twitter/DirectMessage';
import {BadParamError, NotFoundError} from '../util/errors';
import PuffleController, {Puffle} from './PuffleController';

/**
 Maps each user's ID to it's name and it's adopted puffle.
*/
interface User {
  id : string,
  name : string,
  puffle? : Puffle,
  lastActivity : Date,
  sessionId? : string,
  lastPuffle?: string,
}

const path = './log/users.json';

let users : Array<User> = JSON.parse(fs.readFileSync(path, 'utf-8'));

/**
  Bundles methods for managing the user storage system.
*/
class UserController {
  /**
   * Retrieves all users from the database.
   * @return {Array<User>} Array of users.
   */
  getUsers() : Array<User> {
    return users;
  }

  /**
   * Retrieves a user from the database.
   * @param {string} id User's ID.
   * @return {User} User object.
   */
  getUser(id : string) : User | undefined {
    if (typeof id == 'number') throw new BadParamError('ID must be a string');
    const index = users.findIndex((e) => e.id === id);
    if (index != -1) {
      return users[index];
    } else {
      return undefined;
    }
  }

  /**
   * Appends a new user to the database.
   * @param {string} name User's name.
   * @param {string} _id User ID.
   * @param {Puffle} puffle Optional user's puffle.
   * @return {User} An object containing the user data.
   */
  async addUser(name : string, _id: string, puffle? : Puffle) : Promise<User> {
    if (typeof _id == 'number') throw new BadParamError('ID must be a string');
    if (_id) {
      const user = this.getUser(_id);
      if (user) throw new BadParamError('ID already taken.');
    }

    const user : User = {id: _id, name: name, lastActivity: new Date()};
    users = [...users, user];
    this.save();
    return user;
  }

  /**
   * Renames a user from the database.
   * @param {string} id ID of the user to be renamed.
   * @param {string} name New name.
   */
  async renameUser(id : string, name : string) {
    const index = users.findIndex((e) => e.id === id);
    try {
      users[index].name = name;
    } catch (err) {
      throw new NotFoundError('User not found.');
    }
    this.save();
  }

  /**
   Attributes a Puffle object to a user in the database.
   @param {string} id - ID of the user.
   @param {Puffle} puffle - Puffle to be attributed.
  */
  async setPuffle(id : string, puffle : Puffle) : Promise<User> {
    const index = users.findIndex((e) => e.id === id);
    try {
      users[index].puffle = puffle;
    } catch (err) {
      throw new NotFoundError('User not found.');
    }
    this.save();
    return users[index];
  }

  /**
   Removes the Puffle object from a user in the database.
   @param {string} id - ID of the user.
   @param {Puffle} puffle - Puffle to be attributed.
  */
  async losePuffle(id : string) : Promise<User> {
    const index = users.findIndex((e) => e.id === id);
    try {
      users[index].lastPuffle = users[index].puffle?.name;
      delete users[index].puffle;
    } catch (err) {
      throw new NotFoundError('User not found.');
    }
    this.save();
    return users[index];
  }

  /**
   Attributes a sessionID to a user in the database.
   @param {id} id - ID of the user.
   @param {string} sessionId - Session ID to be attributed.
  */
  async setSession(id : string, sessionId : string) : Promise<User> {
    const index = users.findIndex((e) => e.id === id);
    try {
      users[index].sessionId = sessionId;
    } catch (err) {
      throw new NotFoundError('User not found.');
    }
    this.save();
    return users[index];
  }

  /**
   Updates the lastActivity property of a user in the database.
   @param {string} id - ID of the user.
  */
  async updateLastActivity(id : string) : Promise<User> {
    const index = users.findIndex((e) => e.id === id);
    try {
      users[index].lastActivity = new Date();
    } catch (err) {
      throw new NotFoundError('User not found.');
    }
    this.save();
    return users[index];
  }

  /**
   * Removes a user from the database.
   * @param {string} id User's ID.
   * @return {Promise<User>}
   */
  async removeUser(id : string) : Promise<User> {
    const index = users.findIndex((e) => e.id === id);
    if (index === -1) throw new NotFoundError('User not found.');
    const aux = users[index];
    users.splice(index, 1);
    this.save();
    return aux;
  }

  /**
   * Messages users with endangered puffles.
   */
  async checkUserPuffles() {
    users.forEach(async (user) => {
      if (!user.puffle) return;
      user.puffle = PuffleController.check(user.puffle);
      if ((user.puffle.status.food == 3 || user.puffle.status.happiness == 3)) {
        let text;
        if (user.puffle.status.food == 3 && user.puffle.status.happiness == 3) {
          text = 'hey... ' + user.puffle.name + ' isn\'t doing well';
        } else if (user.puffle.status.happiness == 3) {
          text = 'hey... ' + user.puffle.name + ' is a bit sad.';
        } else {
          text = 'hey... ' + user.puffle.name + ' is quite hungry.';
        }
        DirectMessage(user.id, text);
      }

      if ((user.puffle.status.food <= 0 || user.puffle.status.happiness <= 0)) {
        DirectMessage(user.id, 'things got bad and ' + user.puffle.name + ' left. i\'m sorry.');
        user.lastPuffle = user.puffle.name;
        delete user.puffle;
      }
    });

    fs.writeFile(path, JSON.stringify(users), (err) => {
      if (err) console.log(err);
    });
  }

  /**
    Writes down all user data to the database.
  */
  async save() {
    fs.writeFile(path, JSON.stringify(users), (err) => {
      if (err) console.log(err);
    });
  }
}

export {User};

export default new UserController();
