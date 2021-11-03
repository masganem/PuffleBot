import UserController, {User} from '../../../controllers/UserController';
import {Request} from 'express';
import PuffleController from '../../../controllers/PuffleController';
import {BadParamError} from '../../../util/errors';

/**
 * Registers a new user in the database.
 * @param {Request} req HTTP request contaning the user's name and a description of their puffle.
 * @return {User} A user object.
 */
async function RegisterUser(req : Request) : Promise<User> {
  const {name, description, id} = req.body;
  if (!name || !description) throw new BadParamError('Missing parameters in request.');
  const puffle = await PuffleController.create(description);
  const user = await UserController.addUser(name, id, puffle);
  return user;
}

export default RegisterUser;
