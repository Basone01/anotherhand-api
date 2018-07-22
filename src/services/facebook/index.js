const axios = require('axios').default;
const createTemplateMessage = require('./templateMessage/fabebookGenericTemplate');

function getAttachmentId({image_url, token}) {
	return axios
		.post(`https://graph.facebook.com/v2.6/me/message_attachments?access_token=${token}`, {
			message: {
				attachment: {
					type: 'image',
					payload: {
						is_reusable: true,
						url: image_url
					}
				}
			}
		})
		.then((response) => {
			return response.data;
		});
}

async function sendProduct({customer_id, token, products}) {
	try {
		const { data } = await axios.post(
			`https://graph.facebook.com/v2.6/me/messages?access_token=${token}`,
			createTemplateMessage({
				customer_id,
				products
			})
		);
		return data;
	} catch (error) {
		throw error;
	}
}

async function sendImage({targetUserID, token, imagePath}) {
	try {
		const { attachment_id } = await getAttachmentId({image_url:imagePath, token});
		const { data } = await axios.post(`https://graph.facebook.com/v2.6/me/messages?access_token=${token}`, {
			recipient: {
				id: targetUserID
			},
			message: {
				attachment: {
					type: 'image',
					payload: {
						attachment_id
					}
				}
			}
		});
		return data;
	} catch (error) {
		throw error;
	}
}

async function sendMessage({targetUserID, token, text}) {
	try {
		const { data } = await axios.post(`https://graph.facebook.com/v2.6/me/messages?access_token=${token}`, {
			recipient: {
				id: targetUserID
			},
			message: {
				text
			}
		});
		return data;
	} catch (error) {
		throw error;
	}
}

const getCustomerProfileFromPSID = async ({id, token}) => {
	return axios.default
		.get(`https://graph.facebook.com/v2.6/${id}?`, {
			params: {
				fields: 'first_name,last_name,profile_pic',
				access_token: token
			}
		})
		.then((res) => res.data);
};
const getPageProfileFromPSID = async ({id, token}) => {
	return axios.default
		.get(`https://graph.facebook.com/v2.6/${id}?`, {
			params: {
				fields: 'name,picture{url}',
				access_token: token
			}
		})
		.then((res) => res.data);
};
module.exports = {
	getAttachmentId,
	sendImage,
	sendMessage,
	sendProduct,
	getCustomerProfileFromPSID,
	getPageProfileFromPSID
};
