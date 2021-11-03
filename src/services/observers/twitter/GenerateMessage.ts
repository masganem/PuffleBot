/**
 * Generates a Direct Message object matching Twitter's POST Direct Message API endpoint.
 * @param {string} recipientId Twitter user Recipient ID.
 * @param {string} text Message to be sent to user.
 * @param {string} mediaID Optional ID of media to be attached.
 * @return {Object} DM request data.
 */
function GenerateMessage(recipientId : string, text : string, mediaID?: string): object {
  const message : any = {
    event: {
      type: 'message_create',
      message_create: {
        target: {
          recipient_id: recipientId,
        },
        message_data: {
          text: text,
        },
      },
    },
  };

  if (mediaID) {
    message.event.message_create.message_data.attachment = {
      type: 'media',
      media: {
        id: mediaID,
      },
    };
  }

  return message;
}

export default GenerateMessage;
