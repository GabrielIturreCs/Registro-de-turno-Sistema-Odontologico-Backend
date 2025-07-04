const axios = require('axios')
const mpCtrl = {};

mpCtrl.getPaymentLink = async (req, res) => {
    try {
        console.log('=== MERCADO PAGO PAYMENT REQUEST ===');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('ACCESS_TOKEN configured:', !!process.env.ACCESS_TOKEN);
        console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
        
        // Validar que el ACCESS_TOKEN esté presente
        if (!process.env.ACCESS_TOKEN) {
            console.error('ACCESS_TOKEN not configured');
            return res.status(500).json({
                error: true,
                msg: "ACCESS_TOKEN not configured"
            });
        }
        
        const url = "https://api.mercadopago.com/checkout/preferences";
        const body = {
            payer_email: req.body.payer_email || "payer_email@gmail.com",
            items: req.body.items || [
                {
                    title: "Turno Médico",
                    description: "Consulta médica odontológica",
                    quantity: 1,
                    unit_price: 15000
                }
            ],
            external_reference: req.body.external_reference || null,
            back_urls: {
                failure: `${process.env.FRONTEND_URL}/payment/failure`,
                pending: `${process.env.FRONTEND_URL}/payment/pending`,
                success: `${process.env.FRONTEND_URL}/payment/success`
            },
            auto_return: "approved",
            statement_descriptor: "Sistema Odontológico"
        };

        console.log('MercadoPago request body:', JSON.stringify(body, null, 2));

        const payment = await axios.post(url, body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });
        
        console.log('MercadoPago response status:', payment.status);
        console.log('MercadoPago response data:', JSON.stringify(payment.data, null, 2));
        
        return res.status(200).json(payment.data);
    } catch (error) {
        console.error('=== MERCADO PAGO ERROR ===');
        console.error('Error status:', error.response?.status);
        console.error('Error data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Error message:', error.message);
        console.error('Request config:', JSON.stringify(error.config, null, 2));
        
        // Respuesta más detallada para debugging
        const errorResponse = {
            error: true,
            msg: "Failed to create payment",
            details: error.response?.data || error.message,
            status: error.response?.status,
            mpError: error.response?.data
        };
        
        return res.status(500).json(errorResponse);
    }
}

mpCtrl.getSubscriptionLink = async (req, res) => {
    // Recibir en body info de payer_email, razon, cantidad
    try {
        const url = "https://api.mercadopago.com/preapproval";
        const body = {
            reason: req.body.reason || "Suscripción de ejemplo",
            auto_recurring: {
                frequency: req.body.frequency || 1,
                frequency_type: req.body.frequency_type || "months",
                transaction_amount: req.body.transaction_amount || 10000,
                currency_id: req.body.currency_id || "ARS"
            },
            back_url: `${process.env.FRONTEND_URL}/payment/return`,
            payer_email: req.body.payer_email || "payer_email@gmail.com"
        };

        const subscription = await axios.post(url, body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });
        return res.status(200).json(subscription.data);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: true,
            msg: "Failed to create subscription"
        });
    }
}

module.exports = mpCtrl;