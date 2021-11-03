import FetchUser from './FetchUser';
import {Request} from 'express';
import RegisterUser from './RegisterUser';
import FeedPuffle from './FeedPuffle';
import FetchPuffle from './FetchPuffle';
import AdoptPuffle from './AdoptPuffle';
import PlayPuffle from './PlayPuffle';

/**
 * Listens for actions called via IBM Watson webhook HTTP requests.
 * @param {Request} req HTTP request containing applicable actions and necessary context.
 * @return {Object} A result object that varies according to the performed action.
 */
async function WatsonObserver(req : Request) {
  try {
    if (req.body.action === 'fetchUserData') return FetchUser(req);
    if (req.body.action === 'adoptPuffle') return AdoptPuffle(req);
    if (req.body.action === 'fetchPuffle') return FetchPuffle(req);
    if (req.body.action === 'feedPuffle') return FeedPuffle(req);
    if (req.body.action === 'playPuffle') return PlayPuffle(req);
    if (req.body.action === 'registerUser') return RegisterUser(req);
  } catch (err) {
    throw err;
  }
}

export default WatsonObserver;
