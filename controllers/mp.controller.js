const axios = require('axios')
const mpCtrl = {};

mpCtrl.getPaymentLink = async (req, res) => {
    // Recibir en body info de payer_email, title, description, etc...
    try {
        // Verificar que el token de acceso esté configurado
        if (!process.env.ACCESS_TOKEN) {
            console.error('❌ ACCESS_TOKEN no está configurado en las variables de entorno');
            return res.status(500).json({
                error: true,
                msg: "Error de configuración: ACCESS_TOKEN no encontrado"
            });
        }

        const url = "https://api.mercadopago.com/checkout/preferences";
        const frontendUrl = process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com';
        
        const body = {
            payer_email: req.body.payer_email || "payer_email@gmail.com",
            items: req.body.items || [
                {
                    title: "Vasija grande",
                    description: "vasija grande medidas ....",
                    picture_url: "http://www.myapp.com/myimage.jpg",
                    category_id: "category123",
                    quantity: 1,
                    unit_price: 15000
                }
            ],
            back_urls: {
                failure: `${frontendUrl}/payment/failure`,
                pending: `${frontendUrl}/payment/pending`,
                success: `${frontendUrl}/payment/success`
            },
            // Agregar campos que envía el frontend
            external_reference: req.body.external_reference,
            notification_url: req.body.notification_url,
            statement_descriptor: req.body.statement_descriptor
        };

        // Agregar payer si viene en el request
        if (req.body.payer) {
            body.payer = req.body.payer;
        }

        console.log('🔄 Creando pago en MercadoPago con datos:', {
            payer_email: body.payer_email,
            external_reference: body.external_reference,
            items_count: body.items.length
        });

        const payment = await axios.post(url, body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });

        console.log('✅ Pago creado exitosamente en MercadoPago');
        return res.status(200).json(payment.data);
    } catch (error) {
        console.error('❌ Error al crear pago en MercadoPago:', error.response?.data || error.message);
        return res.status(500).json({
            error: true,
            msg: error.response?.data?.message || "Failed to create payment",
            details: error.response?.data || error.message
        });
    }
}

mpCtrl.getSubscriptionLink = async (req, res) => {
    // Recibir en body info de payer_email, razon, cantidad
    try {
        // Verificar que el token de acceso esté configurado
        if (!process.env.ACCESS_TOKEN) {
            console.error('❌ ACCESS_TOKEN no está configurado en las variables de entorno');
            return res.status(500).json({
                error: true,
                msg: "Error de configuración: ACCESS_TOKEN no encontrado"
            });
        }

        const url = "https://api.mercadopago.com/preapproval";
        const frontendUrl = process.env.FRONTEND_URL || 'https://registrar-turno-sistema-clinico.onrender.com';
        
        const body = {
            reason: req.body.reason || "Suscripción de ejemplo",
            auto_recurring: {
                frequency: req.body.frequency || 1,
                frequency_type: req.body.frequency_type || "months",
                transaction_amount: req.body.transaction_amount || 10000,
                currency_id: req.body.currency_id || "ARS"
            },
            back_url: req.body.back_url || `${frontendUrl}/subscription-result`,
            payer_email: req.body.payer_email || "payer_email@gmail.com"
        };

        console.log('🔄 Creando suscripción en MercadoPago con datos:', {
            payer_email: body.payer_email,
            reason: body.reason,
            transaction_amount: body.auto_recurring.transaction_amount
        });

        const subscription = await axios.post(url, body, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
            }
        });

        console.log('✅ Suscripción creada exitosamente en MercadoPago');
        return res.status(200).json(subscription.data);
    } catch (error) {
        console.error('❌ Error al crear suscripción en MercadoPago:', error.response?.data || error.message);
        return res.status(500).json({
            error: true,
            msg: error.response?.data?.message || "Failed to create subscription",
            details: error.response?.data || error.message
        });
    }
}

module.exports = mpCtrl;