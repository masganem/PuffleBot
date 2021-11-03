// https://stackoverflow.com/questions/56398985/oauth1-0-header-in-node-js

import crypto from 'crypto';
const OAuth = require('oauth-1.0a');


const CONSUMERKEY = process.env.TWITTER_CONSUMER_KEY;
const CONSUMERSECRET = process.env.TWITTER_CONSUMER_SECRET;
const TOKENKEY = process.env.TWITTER_BOT_ACCESS_TOKEN;
const TOKENSECRET = process.env.TWITTER_BOT_ACCESS_TOKEN_SECRET;

function appendQueryParams(url : string, params : Object): string {
  Object.entries(params).forEach((entry, idx) => {
    const [key, val] = entry;
    if (idx == 0) url += '?';
    else url += '&';

    url += (key + '=' + val);
  });
  return url;
}
interface Request {
    url: string,
    method: string,
    body: object,
    queryParams?: object,
}

class OAuthHelper {
  /**
   * Generates an OAuth1.0 Authorization header to be sent in an HTTP request.
   * @param {Request} request Object containing relevant properties the request to be sent
   * @return {string} Authorization header
   */
  static getAuthHeader(request : Request) {
    const oauth = OAuth({
      consumer: {key: CONSUMERKEY, secret: CONSUMERSECRET},
      signature_method: 'HMAC-SHA1',
      hash_function(base : string, key : string) {
        return crypto
            .createHmac('sha1', key)
            .update(base)
            .digest('base64');
      },
    });

    if (request.queryParams) {
      request.url = appendQueryParams(request.url, request.queryParams);
    }

    const authorization = oauth.authorize(request, {
      key: TOKENKEY,
      secret: TOKENSECRET,
    });

    return oauth.toHeader(authorization).Authorization;
  }
}

export default OAuthHelper;
