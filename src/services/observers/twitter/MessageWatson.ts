import {Request} from 'express';
import AssistantService from '../../AssistantService';
import AssistantV2 from 'ibm-watson/assistant/v2';
import UserController from '../../../controllers/UserController';
import DirectMessage from './DirectMessage';

// MISSING MEDIA RESPONSES. How to get them from Watson? How to send them to Twitter?
// https://developer.twitter.com/en/docs/twitter-api/v1/direct-messages/sending-and-receiving/api-reference/new-event

/**
 * Directs a message from Twitter Bot's inbox to Watson Assistant.
 * @param {Request} req  Request from Twitter API to the webhook.
 * @return {Promise<AssistantV2.Response<AssistantV2.MessageResponse> | any>}
 * If the message was not sent by the bot, returns a Watson Assistant message response, with output and context.
 * Else, returns false.
 */
async function MessageWatson(req : Request) : Promise<AssistantV2.Response<AssistantV2.MessageResponse> | any> {
  const senderId = req.body.direct_message_events[0].message_create.sender_id;

  if (senderId == process.env.TWITTER_BOT_USER_ID) {
    return false;
  }

  // Verifies if user is already registered. If not, registers it.
  let user;
  user = UserController.getUser(senderId);
  if (!user) {
    user = await UserController.addUser(req.body.users[senderId].name, senderId);
  };

  // Verifies if user has an active Session ID;
  let sessionId;
  if (user.sessionId) sessionId = user.sessionId;

  const diff = ((new Date().getTime() - new Date(user.lastActivity).getTime()) / 1000)/60;
  if (diff < 5 && user.sessionId) sessionId = user.sessionId; // Maximum Watson Assistant idle time
  else sessionId = (await AssistantService.createSession()).result.session_id;
  UserController.setSession(user.id, sessionId);

  let watsonResponse;
  try {
    watsonResponse = await AssistantService.message(sessionId!,
        req.body.direct_message_events[0].message_create.message_data.text,
        senderId);
  } catch (err : any) {
    console.log(err);
    sessionId = (await AssistantService.createSession()).result.session_id;
    watsonResponse = await AssistantService.message(sessionId!,
        req.body.direct_message_events[0].message_create.message_data.text,
        senderId);
  }
  UserController.updateLastActivity(user.id);

  console.log(watsonResponse.result.output);
  watsonResponse.result.output.generic!.forEach(async (message) => {
    try {
      await DirectMessage(senderId, (message as any).text, (message as any).source);
    } catch (err) {
      throw err;
    }
  });

  return 'Cool';
}

export default MessageWatson;
