const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration Orange Money
const ORANGE_CONFIG = {
    baseURL: 'https://api.orange.com',
    clientId: process.env.ORANGE_CLIENT_ID || 'VOTRE_CLIENT_ID',
    clientSecret: process.env.ORANGE_CLIENT_SECRET || 'VOTRE_CLIENT_SECRET',
    merchantKey: process.env.ORANGE_MERCHANT_KEY || 'VOTRE_MERCHANT_KEY',
    returnUrl: 'https://votre-app.vercel.app/payment-success',
    cancelUrl: 'https://votre-app.vercel.app/payment-cancel'
};

// Obtenir le token d'authentification
async function getOrangeToken() {
    try {
        const auth = Buffer.from(`${ORANGE_CONFIG.clientId}:${ORANGE_CONFIG.clientSecret}`).toString('base64');
        const response = await axios.post(
            `${ORANGE_CONFIG.baseURL}/oauth/v3/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error('Erreur token Orange:', error.response?.data || error.message);
        return null;
    }
}

// Initier un paiement Orange Money
app.post('/api/initiate-payment', async (req, res) => {
    const { phoneNumber, amount, orderId, customerName } = req.body;
    
    if (!phoneNumber || !amount || !orderId) {
        return res.status(400).json({ error: 'Paramètres manquants' });
    }

    try {
        const token = await getOrangeToken();
        if (!token) throw new Error('Impossible d\'obtenir le token');

        const paymentData = {
            merchant_key: ORANGE_CONFIG.merchantKey,
            currency: 'XOF',
            order_id: orderId,
            amount: amount,
            phone_number: phoneNumber,
            return_url: ORANGE_CONFIG.returnUrl,
            cancel_url: ORANGE_CONFIG.cancelUrl,
            description: `Ticket Urbain Car - ${customerName}`,
            lang: 'fr'
        };

        const response = await axios.post(
            `${ORANGE_CONFIG.baseURL}/orange-money-webpay/api/v1/webpayment/payment`,
            paymentData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({
            success: true,
            paymentUrl: response.data.payment_url,
            transactionId: response.data.transaction_id
        });
    } catch (error) {
        console.error('Erreur paiement:', error.response?.data || error.message);
        res.status(500).json({ 
            error: 'Erreur de paiement',
            details: error.response?.data || error.message
        });
    }
});

// Vérifier le statut du paiement
app.get('/api/check-payment/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    
    try {
        const token = await getOrangeToken();
        const response = await axios.get(
            `${ORANGE_CONFIG.baseURL}/orange-money-webpay/api/v1/webpayment/payment/${transactionId}`,
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        
        res.json({
            success: true,
            status: response.data.status,
            data: response.data
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur vérification' });
    }
});

// Webhook pour confirmer les paiements
app.post('/api/webhook/orange', async (req, res) => {
    const { transaction_id, status, amount, order_id } = req.body;
    
    if (status === 'SUCCESS') {
        console.log(`✅ Paiement réussi: ${order_id} - ${amount} FCFA`);
        // Mettre à jour la base de données
        // Envoyer notification
    }
    
    res.json({ received: true });
});

app.listen(PORT, () => {
    console.log(`\n✅ Backend Orange Money démarré sur port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}/api`);
    console.log(`\n📝 Endpoints disponibles:`);
    console.log(`   POST /api/initiate-payment - Initier un paiement`);
    console.log(`   GET  /api/check-payment/:id - Vérifier paiement`);
    console.log(`   POST /api/webhook/orange - Webhook Orange Money\n`);
});
