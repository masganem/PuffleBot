const FormData = require('form-data');
import FileType from 'file-type';
import {TwitterRequestData, TwitterUpload} from '../../../controllers/TwitterController';
import getBuffer from '../../../util/getBuffer';
import OAuthHelper from '../../../util/oauth';

/**
 * Uploads media to Twitter's API.
 * @param {string} src Media file URL
 * @return {number} Media ID.
 */
async function UploadMedia(src : string) : Promise<string> {
  const buffer = await getBuffer(src);
  const b64 = buffer.toString('base64');
  const MIMEType = (await FileType.fromBuffer(buffer))!.mime;

  async function init() {
    const request = new TwitterRequestData('media/upload.json', 'POST', {},
        {
          command: 'INIT',
          total_bytes: buffer.byteLength,
          media_type: MIMEType,
        }, true);

    try {
      const res = await TwitterUpload.post(request.url, {}, {
        headers: {Authorization: OAuthHelper.getAuthHeader(request)},
        params: request.queryParams,
      });
      return res.data.media_id_string;
    } catch (err : any) {
      throw err;
    }
  }
  const mediaID = await init();

  async function append() {
    const formData = new FormData();
    formData.append('media_data', b64);
    const request = new TwitterRequestData('media/upload.json', 'POST', formData,
        {
          command: 'APPEND',
          media_id: mediaID,
          segment_index: 0,
        }, true);
    try {
      await TwitterUpload.post(request.url, formData, {
        headers: {'Authorization': OAuthHelper.getAuthHeader(request),
          ...formData.getHeaders(),
        },
        params: request.queryParams,
      });
    } catch (err : any) {
      throw err;
    }
  }

  await append();

  async function finalize() {
    const request = new TwitterRequestData('media/upload.json', 'POST', {},
        {
          command: 'FINALIZE',
          media_id: mediaID,
        }, true);
    try {
      return await TwitterUpload.post(request.url, {}, {
        headers: {'Authorization': OAuthHelper.getAuthHeader(request)},
        params: request.queryParams,
      });
    } catch (err : any) {
      throw err;
    }
  }

  const res = await finalize();

  return res?.data.media_id_string;
}

export default UploadMedia;
