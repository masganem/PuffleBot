import axios from 'axios';

const Twitter = axios.create({
  baseURL: process.env.TWITTER_API_URL,
  timeout: 2000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*',
  },
});

const TwitterUpload = axios.create({
  baseURL: process.env.TWITTER_UPLOAD_URL,
  timeout: 2000,
  headers: {
    'Accept': '*/*',
  },
});

/**
 * Bundles information on a specific Twitter API request in order to perform Axios calls
 * and OAuth authorizations.
 * @constructor
 * @param {string} target The relative URL to the API's endpoint.
 * @param {string} method The request's method.
 * @param {string} body The request's body.
 */
class TwitterRequestData {
  url : string;
  method : string;
  body : Object;
  target : string;
  queryParams?: Object;

  /**
   * Bundles information on a specific Twitter API request in order to perform Axios calls
   * and OAuth authorizations.
   * @param {string} target The relative URL to the API's endpoint.
   * @param {string} method The request's method.
   * @param {Object} body The request's body.
   * @param {Object} queryParams Optional query parameters
   * @param {boolean} upload Flag for directing request to Twitter's Upload API
   */
  constructor(target : string, method : string, body : Object, queryParams?: Object, upload?: boolean) {
    this.url = (upload ? process.env.TWITTER_UPLOAD_URL : process.env.TWITTER_API_URL) + target;
    this.method = method;
    this.body = body;
    this.target = target;
    this.queryParams = queryParams;
  }
}

export default Twitter;
export {TwitterRequestData, TwitterUpload};
