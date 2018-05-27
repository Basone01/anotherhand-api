const {HOST} = require('../../../config');
const createProductMessage = ({ customer_id, product }) => {
  let { name, _id, shop_id, description, sizes, price, images_path } = product;
  images_path = !images_path
    ? [
        "http://vollrath.com/ClientCss/images/VollrathImages/No_Image_Available.jpg"
      ]
    : images_path.map(
        image_path => HOST + image_path
      );
  const ProductTemplateMessage = {
    recipient: {
      id: customer_id
    },
    message: {
      attachment: {
        type: `template`,
        payload: {
          template_type: `generic`,
          elements: [
            {
              title: name,
              image_url: images_path[0],
              subtitle: `
                ราคา:${price}\n
                รายละเอียด:${description}
              `,
              buttons: [
                {
                  type: `postback`,
                  title: `เลือกแบบ/ไซส์`,
                  payload: `{req:'getSizes',_id:${_id}}`
                },
                {
                  type: `postback`,
                  title: `ดูรูปเพิ่ม`,
                  payload: `{req:'getImage',_id:${_id}}`
                },
                {
                  type: `postback`,
                  title: `รายละเอียด`,
                  payload: `{req:'getDetails',_id:${_id}}`
                }
              ]
            }
          ]
        }
      }
    }
  };
  
  console.log(JSON.stringify(ProductTemplateMessage,null,3))
  return ProductTemplateMessage;
};

module.exports = createProductMessage;
