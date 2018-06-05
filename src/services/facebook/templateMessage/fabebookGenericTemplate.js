const createProductMessage = ({ customer_id, product }) => {
  let { name, _id, shop_id, description, sizes, price, images } = product;
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
              image_url: images[0],
              subtitle: `
                ราคา:${price}\n
                รายละเอียด:${description}
              `,
              buttons: [
                {
                  type: `postback`,
                  title: `สั่งซื้อ`,
                  payload: `{"req":"placeOrder","_id":"${_id}"}`
                },
                {
                  type: `postback`,
                  title: `ดูรูปเพิ่ม`,
                  payload: `{"req":"getImages","_id":"${_id}"}`
                },
                {
                  type: `postback`,
                  title: `รายละเอียด`,
                  payload: `{"req":"getDetails","_id":"${_id}"}`
                }
              ]
            }
          ]
        }
      }
    }
  };

  // console.log(JSON.stringify(ProductTemplateMessage, null, 3));
  return ProductTemplateMessage;
};

module.exports = createProductMessage;
