import {Request} from 'express';
import MessageWatson from './MessageWatson';

async function TwitterObserver(req : Request) {
  try {
    if (req.body.direct_message_events) return MessageWatson(req);
  } catch (err) {
    throw err;
  }
}

export default TwitterObserver;
