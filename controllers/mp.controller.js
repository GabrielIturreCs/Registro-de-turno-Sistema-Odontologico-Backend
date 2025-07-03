const axios = require('axios')
const mpCtrl = {};

mpCtrl.getPaymentLink =  async (req,res) =>{
    try{
     const url = "https://api.mercadopago.com/checkout/preferences";
     const body = {
        items: req.body.items,
        payer: req.body.payer,
        payer_email: req.body.email,
        back_urls: {
        failure: "http://localhost:4200/failure",
        pending: "http://localhost:4200/pending",
        success: "http://localhost:4200/success"
           }
     };

     const payment = await axios.post(url, body, {
       headers: {
       "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
          }
          });
         res.status(200).json(payment.data);

    }catch(err){
       return res.status(500).json({
       'status': '0', 
       'msg': 'Fallo al crear el pago'
       });
    }
}

module.exports = mpCtrl;