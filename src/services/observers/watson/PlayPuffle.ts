import {Request} from 'express';
import PuffleController, {Puffle} from '../../../controllers/PuffleController';
import UserController from '../../../controllers/UserController';
import {BadParamError, NotFoundError} from '../../../util/errors';

/**
 * Sets a puffle's happiness status to 10.
 * @param {Request} req HTTP request containing the puffle owner's ID.
 * @return {Puffle} A puffle object.
 */
async function PlayPuffle(req : Request) : Promise<Puffle> {
  const {userId} = req.body;
  if (!userId) throw new BadParamError('Missing User ID in request body');
  const user = UserController.getUser(userId);
  if (!user) throw new NotFoundError('User not found');
  if (!user.puffle) throw new NotFoundError('User does not have a puffle');
  user.puffle = PuffleController.play(user.puffle);
  UserController.save();

  return user.puffle;
}

export default PlayPuffle;
