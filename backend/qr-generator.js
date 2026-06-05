// Générateur de QR Code pour les tickets
export function generateQRCode(ticketId, passengerName, tripInfo) {
    const qrData = {
        ticketId: ticketId,
        passenger: passengerName,
        trip: tripInfo,
        timestamp: Date.now(),
        isValid: true
    };
    
    // Convertir en base64 pour le QR code
    const qrString = btoa(JSON.stringify(qrData));
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrString}`;
}

// Scanner le QR code (simulation)
export function scanQRCode(qrData) {
    try {
        const decoded = JSON.parse(atob(qrData));
        return decoded;
    } catch(e) {
        return null;
    }
}
