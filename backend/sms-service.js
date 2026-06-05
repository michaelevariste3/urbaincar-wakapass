const twilio = require('twilio');

// Configuration Twilio (inscription gratuite sur twilio.com)
const accountSid = process.env.TWILIO_SID || 'VOTRE_SID';
const authToken = process.env.TWILIO_TOKEN || 'VOTRE_TOKEN';
const client = twilio(accountSid, authToken);

async function sendSMS(phoneNumber, message) {
    try {
        // Formater le numéro pour la Côte d'Ivoire
        let formattedNumber = phoneNumber;
        if (!phoneNumber.startsWith('+')) {
            formattedNumber = '+225' + phoneNumber;
        }
        
        const result = await client.messages.create({
            body: message,
            from: '+22501234567', // Votre numéro Twilio
            to: formattedNumber
        });
        
        console.log(`✅ SMS envoyé à ${phoneNumber}: ${result.sid}`);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('❌ Erreur SMS:', error);
        return { success: false, error: error.message };
    }
}

// Template messages
const templates = {
    ticketConfirmation: (ticketId, from, to, date, price) => 
        `🎫 URBAIN CAR: Ticket ${ticketId} confirmé! ${from}→${to} le ${date}. Montant: ${price} FCFA. Présentez ce code à l'embarquement.`,
    
    parcelArrival: (parcelId, city) => 
        `📦 URBAIN CAR: Votre colis ${parcelId} est arrivé en gare de ${city}. Venez le récupérer avec votre pièce d'identité.`,
    
    boardingCode: (ticketId, code) => 
        `🚌 URBAIN CAR: Code embarquement ${code} pour le ticket ${ticketId}. Bon voyage!`
};

module.exports = { sendSMS, templates };
