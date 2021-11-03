import {Request} from 'express';
import PuffleController, {Puffle} from '../../../controllers/PuffleController';
import UserController from '../../../controllers/UserController';
import {BadParamError} from '../../../util/errors';

/**
 * Generates a puffle for a user.
 * @param {Request} req HTTP request containing the puffle owner's ID,
 * the puffle's name (optional) and a short description
 * @return {Puffle} A puffle object.
 */
async function AdoptPuffle(req : Request) : Promise<Puffle> {
  const {userId, name} = req.body;
  if (!userId || !name) throw new BadParamError('Missing information in request body.');
  try {
    const puffle = await PuffleController.create(name);
    await UserController.setPuffle(userId, puffle);
    return puffle;
  } catch (err) {
    throw err;
  }
}

export default AdoptPuffle;
