import Twitter, {TwitterRequestData} from '../../../controllers/TwitterController';
import OAuthHelper from '../../../util/oauth';
import GenerateMessage from './GenerateMessage';
import UploadMedia from './UploadMedia';

/**
 * Sends a new Direct Message to a Twitter user
 * @param {string} userId User's ID
 * @param {string} text Message text
 * @param {string} media Optional attached media URL
 */
async function DirectMessage(userId: string, text: string, media?: string) {
  const message = GenerateMessage(userId, text, media? await UploadMedia(media) : undefined);
  const request = new TwitterRequestData('direct_messages/events/new.json',
      'POST', message);
  try {
    await Twitter.post(request.url, request.body,
        {headers: {Authorization: OAuthHelper.getAuthHeader(request)}});
  } catch (err : any) {
    console.log('TWITTER ERROR', err.response.data);
  }
}

export default DirectMessage;
