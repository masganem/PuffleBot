import {Router, Request, Response} from 'express';
import PuffleController from './controllers/PuffleController';
import UserController from './controllers/UserController';
import AssistantService from './services/AssistantService';
import WatsonObserver from './services/observers/watson/WatsonObserver';
import {BadParamError, errorStatus, NotFoundError} from './util/errors';
import crypto from 'crypto';
import TwitterObserver from './services/observers/twitter/TwitterObserver';

/**
  Routes established here were tested via Insomnia.
  Their expected request bodies are defined in the Insomnia collection,
  exported to the root directory of this project under the name "insomnia.json".
*/
const router = Router();
setInterval(UserController.checkUserPuffles, Number(process.env.TICK_INTERVAL));

// INDEX
router.get('/', (req : Request, res: Response) => {
  res.status(200).json('Adopt a puffle.');
});

// CONVERSATION
router.post('/session/', async (req : Request, res: Response) => {
  const session = await AssistantService.createSession();
  res.status(201).json(session.result.session_id);
});

router.delete('/session', async (req : Request, res: Response) => {
  try {
    const session = await AssistantService.deleteSession(req.body.sessionId);
    res.status(200).json(session);
  } catch (err) {
    const error = err as Error;
    res.status(errorStatus(error)).json(error.message);
  }
});

router.post('/message', async (req : Request, res: Response) => {
  const {sessionId, messageText} = req.body;

  try {
    const watsonResponse = await AssistantService.message(sessionId, messageText);
    res.status(watsonResponse.status).json(watsonResponse.result);
  } catch (err) {
    const error = err as Error;
    res.status(400).json(error.message);
  }
});

// USERS
router.get('/users', async (req : Request, res : Response) => {
  const {id} = req.body;
  try {
    const users = id ? await UserController.getUser(id):
      await UserController.getUsers();
    if (!users) res.status(404).json('User not found');
    res.status(200).json(users);
  } catch (err) {
    const error = err as Error;
    res.status(errorStatus(error)).json(error.message);
  }
});

router.post('/users', async (req : Request, res : Response) => {
  const {name, id} = req.body;
  if (!name) {
    res.status(400).json('Incomplete request.');
  }
  try {
    const user = await UserController.addUser(name, id);
    res.status(200).json(user);
  } catch (err) {
    const error = err as Error;
    res.status(errorStatus(error)).json(error.message);
  }
});

router.put('/users', async (req : Request, res : Response) => {
  const {id, name} = req.body;
  if (id === undefined || !name) {
    res.status(400).json('Incomplete request.');
  }
  UserController.renameUser(id, name);
  res.status(200).send();
});

router.delete('/users', async (req : Request, res : Response) => {
  const {id} = req.body;
  if (id === undefined) {
    res.status(400).json('Incomplete request.');
  }
  let user;
  try {
    user = await UserController.removeUser(id);
    res.status(200).json({user});
  } catch (err) {
    const error = err as Error;
    res.status(errorStatus(error)).json(error.message);
  }
});

router.post('/users/adopt', async (req : Request, res : Response) => {
  const {id, name} = req.body;
  if (!id) res.status(400).json('Incomplete request.');
  const puffle = await PuffleController.create(name);
  try {
    const user = await UserController.setPuffle(id, puffle);
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    const error = err as Error;
    res.status(errorStatus(error)).json(error.message);
  }
});

router.get('/users/check', async (req : Request, res : Response) => {
  const {id} = req.body;
  try {
    const user = await UserController.getUser(id);
    if (!user) throw new NotFoundError('User not found');
    if (user.puffle == undefined) throw new BadParamError('This user does not have a puffle');
    user.puffle = PuffleController.check(user.puffle!);
    res.status(200).json(user.puffle);
    await UserController.save();
  } catch (err) {
    const error = err as Error;
    res.status(errorStatus(error)).json(error.message);
  }
});

// SEARCH

router.post('/puffle', async (req : Request, res : Response) => {
  const {name} = req.body;
  if (!name) res.status(400).json('Incomplete request.');
  const puffle = await PuffleController.create(name);
  res.status(200).json(puffle);
});

// WEBHOOKS

router.post('/webhook/watson', async (req : Request, res : Response) => {
  try {
    const result = await WatsonObserver(req);
    res.status(200).json(result);
  } catch (err) {
    const error = err as Error;
    res.status(errorStatus(error)).json(error.message);
    console.log(error.message, 'Action: ', req.body.action, '\nBody: ', req.body);
  }
});

router.post('/webhook/twitter', async (req : Request, res : Response) => {
  try {
    const result = await TwitterObserver(req);
    res.status(200).json(result);
  } catch (err) {
    const error = err as Error;
    res.status(errorStatus(error)).json(error.message);
  }
});

router.get('/webhook/twitter', async (req : Request, res : Response) => {
  const hmac = crypto.createHmac('sha256', process.env.TWITTER_CONSUMER_SECRET as string)
      .update(req.query.crc_token as string).digest('base64');
  res.status(200).json({response_token: 'sha256=' + hmac});
});


// TEST

// router.post('/file/init', async (req: Request, res : Response) => {
//   UploadMedia('https://interactive-examples.mdn.mozilla.net/media/cc0-images/grapefruit-slice-332-332.jpg');
//   res.send(200);
// });

export {router};
