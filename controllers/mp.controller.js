const axios = require('axios');
const mpCtrl = {};

mpCtrl.getPaymentLink = async (req, res) => {
    console.log('🔁 === INICIO getPaymentLink ===');
    console.log('🔐 ACCESS_TOKEN exists:', !!process.env.ACCESS_TOKEN);
    console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));

    try {
        if (!process.env.ACCESS_TOKEN) {
            console.error('❌ ACCESS_TOKEN no configurado');
            return res.status(500).json({
                error: true,
                msg: "ACCESS_TOKEN not configured"
            });
        }

        const defaultItems = [
            {
                title: "Turno Médico",
                description: "Consulta médica odontológica",
                quantity: 1,
                unit_price: 15000
            }
        ];

        const items = req.body.items && Array.isArray(req.body.items) ? req.body.items : defaultItems;

        console.log('🛒 Items para el pago:', JSON.stringify(items, null, 2));

        const body = {
            payer_email: req.body.payer_email || "payer_email@gmail.com",
            items: items,
            external_reference: req.body.external_reference || null,
            back_urls: {
                failure: `${process.env.FRONTEND_URL}/payment/failure`,
                pending: `${process.env.FRONTEND_URL}/payment/pending`,
                success: `${process.env.FRONTEND_URL}/payment/success`
            },
            auto_return: "approved",
            statement_descriptor: "Sistema Odontológico"
        };

        console.log('📤 Enviando a MercadoPago:', JSON.stringify(body, null, 2));

        const payment = await axios.post("https://api.mercadopago.com/checkout/preferences", body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });

        console.log('✅ Pago creado correctamente, ID:', payment.data.id);

        return res.status(200).json(payment.data);

    } catch (error) {
        console.error('🔥 === ERROR EN getPaymentLink ===');
        console.error('📛 Mensaje:', error.message);

        if (error.response) {
            console.error('🔴 Código de estado:', error.response.status);
            console.error('🧾 Respuesta de MP:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('❗️Error sin response:', error);
        }

        return res.status(500).json({
            error: true,
            msg: "Failed to create payment",
            details: error.response?.data || error.message,
            status: error.response?.status
        });
    }
};

mpCtrl.getSubscriptionLink = async (req, res) => {
    console.log('🔁 === INICIO getSubscriptionLink ===');
    console.log('🔐 ACCESS_TOKEN exists:', !!process.env.ACCESS_TOKEN);
    console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));

    try {
        if (!process.env.ACCESS_TOKEN) {
            console.error('❌ ACCESS_TOKEN no configurado');
            return res.status(500).json({
                error: true,
                msg: "ACCESS_TOKEN not configured"
            });
        }

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

        console.log('📤 Enviando suscripción a MercadoPago:', JSON.stringify(body, null, 2));

        const subscription = await axios.post("https://api.mercadopago.com/preapproval", body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });

        console.log('✅ Suscripción creada correctamente, ID:', subscription.data.id);

        return res.status(200).json(subscription.data);

    } catch (error) {
        console.error('🔥 === ERROR EN getSubscriptionLink ===');
        console.error('📛 Mensaje:', error.message);

        if (error.response) {
            console.error('🔴 Código de estado:', error.response.status);
            console.error('🧾 Respuesta de MP:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('❗️Error sin response:', error);
        }

        return res.status(500).json({
            error: true,
            msg: "Failed to create subscription",
            details: error.response?.data || error.message,
            status: error.response?.status
        });
    }
};

module.exports = mpCtrl;