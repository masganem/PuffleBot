import AssistantV2 from 'ibm-watson/assistant/v2';
import {IamAuthenticator} from 'ibm-watson/auth';

/**
  Interface for communicating with Watson Assistant
*/
class AssistantService {
  private watson: AssistantV2;
  private assistantId = process.env.WATSON_ASSISTANT_ID as string;

  constructor() {
    this.watson = new AssistantV2({
      version: '2020-04-01',
      authenticator: new IamAuthenticator({
        apikey: process.env.WATSON_API_KEY as string,
      }),
      serviceUrl: process.env.WATSON_SERVICE_URL,
    });
  }

  async createSession(sessionId? : string) {
    if (sessionId) {
      return await this.watson.createSession({
        assistantId: this.assistantId,
      });
    }
    return await this.watson.createSession({
      assistantId: this.assistantId,
    });
  }

  async deleteSession(sessionId: string) {
    return await this.watson.deleteSession({
      assistantId: this.assistantId,
      sessionId: sessionId,
    });
  }

  /**
   * Carries a text message to the Assistant and triggers appliable events.
   * @param {string} sessionId The Watson Assistant session ID.
   * @param {string} message A plain text message.
   * @param {string} userId Optional identification of user.
   * @return {Promise<AssistantV2.Response<AssistantV2.MessageResponse>>}
   * A Watson Assistant message response, with output and context.
   */
  async message(sessionId: string, message: string, userId?: string) :
  Promise<AssistantV2.Response<AssistantV2.MessageResponse>> {
    const response = await this.watson.message({
      assistantId: this.assistantId,
      sessionId: sessionId,
      input: {
        message_type: 'text',
        text: message,
        options: {
          return_context: true,
        },
      },
      context: {
        global: {
          system: {
            user_id: userId,
          },
        },
      },
    });
    return response;
  }

  async internalMessage(sessionId: string, message: string, context: AssistantV2.MessageContext) :
  Promise<AssistantV2.Response<AssistantV2.MessageResponse>> {
    const response = await this.watson.message({
      assistantId: this.assistantId,
      sessionId: sessionId,
      input: {
        message_type: 'text',
        text: message,
        options: {
          return_context: true,
        },
      },
      context,
    });
    return response;
  }
};

export default new AssistantService();

