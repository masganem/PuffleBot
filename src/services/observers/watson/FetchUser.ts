import UserController, {User} from '../../../controllers/UserController';
import {Request} from 'express';
import {NotFoundError} from '../../../util/errors';

/**
 * Retrieves information on a user from the database.
 * @param {Request} req HTTP request containing the user's ID.
 * @return {User} A user object.
 */
async function FetchUser(req : Request) : Promise<User> {
  const {userId} = req.body;
  console.log('SEARCHING FOR USER', userId);
  const user = UserController.getUser(userId);
  console.log('FOUND', user);
  if (!user) throw new NotFoundError('User not found.');
  return user;
}

export default FetchUser;
