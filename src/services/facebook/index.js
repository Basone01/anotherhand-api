const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");
const createTemplateMessage = require("./templateMessage/fabebookGenericTemplate");
const {ROOT_DIR} = require('../../config');
function getAttachmentId(filepathToUpload, token) {
  const formData = new FormData();
  formData.append(
    "message",
    JSON.stringify({
      attachment: {
        type: "image",
        payload: {
          is_reusable: true
        }
      }
    })
  );
  let file = fs.createReadStream(ROOT_DIR+filepathToUpload);
  formData.append("filedata", file);
  return axios
    .create({
      headers: formData.getHeaders()
    })
    .post(
      `https://graph.facebook.com/v2.6/me/message_attachments?access_token=${token}`,
      formData
    )
    .then(response => {console.log(response.data); return response.data});
}

async function sendProduct(customer_id, token, product) {
  try {
    const { data } = await axios.post(
      `https://graph.facebook.com/v2.6/me/messages?access_token=${token}`,
      createTemplateMessage({ customer_id, product })
    );
    return data;
  } catch (error) {
    throw error;
  }
}

async function sendImage(targetUserID, token, imagePath) {
  try {
    const { attachment_id } = await getAttachmentId(imagePath, token);
    const { data } = await axios.post(
      `https://graph.facebook.com/v2.6/me/messages?access_token=${token}`,
      {
        recipient: {
          id: targetUserID
        },
        message: {
          attachment: {
            type: "image",
            payload: {
              attachment_id
            }
          }
        }
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
}

async function sendMessage(targetUserID, token, text) {
  try {
    const { data } = await axios.post(
      `https://graph.facebook.com/v2.6/me/messages?access_token=${token}`,
      {
        recipient: {
          id: targetUserID
        },
        message: {
          text
        }
      }
    );
    return data;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAttachmentId,
  sendImage,
  sendMessage,
  sendProduct
};
