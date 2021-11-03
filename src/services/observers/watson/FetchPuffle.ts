import {Request} from 'express';
import PuffleController, {Puffle} from '../../../controllers/PuffleController';
import UserController from '../../../controllers/UserController';
import {BadParamError, NotFoundError} from '../../../util/errors';

/**
 * Retrieves information on a puffle from the database.
 * @param {Request} req HTTP request containing the puffle owner's ID.
 * @return {Puffle} A puffle object.
 */
async function FetchPuffle(req : Request) : Promise<(Puffle | boolean)> {
  const {userId} = req.body;
  if (!userId) throw new BadParamError('Missing User ID in request body');
  const user = UserController.getUser(userId);
  if (!user) throw new NotFoundError('User not found');
  if (!user.puffle) throw new NotFoundError('User does not have a puffle');
  user.puffle = PuffleController.check(user.puffle);
  UserController.setPuffle(user.id, user.puffle);

  if (user.puffle.status.food <= 0 || user.puffle.status.happiness <= 0) {
    UserController.losePuffle(user.id);
    return false;
  };

  return user.puffle;
}

export default FetchPuffle;
